"""
FastAPI Server for HAT-Light Satellite Super-Resolution GUI Studio.
Exposes REST APIs & WebSockets for:
- HAT-Light Model Training lifecycle (Start, Pause, Resume, Stop, Checkpoint export)
- Real-time YOLO terminal streaming and dynamic metric broadcasting
- High-performance GPU inference & 0-Shot 10m upscaling demo
- Seamless Sliding-Window Tiling Inference with 2D Hann window blending
- Static mounting of the React frontend build
"""

import os
import sys
import glob
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, List, Union

import shutil
import torch
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from model.hat_light import check_cuda_device
from model.trainer import SRTrainer, TrainingState
from model.infer import infer_engine, tiled_inference

# Enforce strict CUDA check on server startup
check_cuda_device()

app = FastAPI(
    title="HAT-Light Satellite Super-Resolution Studio",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_websockets: List[WebSocket] = []
loop: Optional[asyncio.AbstractEventLoop] = None


def broadcast_event(data: Dict[str, Any]):
    """Thread-safe broadcaster for WebSocket clients."""
    global loop
    if loop and active_websockets:
        coro = _async_broadcast(data)
        asyncio.run_coroutine_threadsafe(coro, loop)


async def _async_broadcast(data: Dict[str, Any]):
    dead_sockets = []
    for ws in active_websockets:
        try:
            await ws.send_json(data)
        except Exception:
            dead_sockets.append(ws)
    for ws in dead_sockets:
        if ws in active_websockets:
            active_websockets.remove(ws)


trainer = SRTrainer(callback=broadcast_event)


# Request schemas
class TrainStartRequest(BaseModel):
    train_dir: str = "Dataset/data/Train"
    val_dir: str = "Dataset/data/Val"
    export_dir: str = "model/checkpoints"
    checkpoint_path: Optional[str] = None
    epochs: int = 50
    batch_size: int = 16
    learning_rate: float = 2e-4
    scale: float = 4.0
    grad_accum_steps: int = 1
    early_stopping: bool = True
    patience: int = 10
    min_delta: float = 0.02


class InferRequest(BaseModel):
    patch_path: str
    checkpoint_path: Optional[str] = None
    scale: float = 4.0
    use_tiling: bool = False
    tile_size: int = 64
    overlap: int = 16


class InferImageFileRequest(BaseModel):
    input_path: str
    output_path: Optional[str] = None
    checkpoint_path: Optional[str] = None
    scale: float = 4.0
    use_tiling: bool = True
    tile_size: int = 128
    overlap: int = 32


class BrowseRequest(BaseModel):
    initial_path: Optional[str] = None
    mode: str = "folder"  # "folder", "file", or "save"
    file_types: Optional[str] = None  # e.g. "image" or "model"


@app.post("/api/utils/browse")
def browse_path_endpoint(req: BrowseRequest):
    """
    Spawns a native Windows Explorer folder or file picker dialog
    opening at initial_path, returning the chosen path string.
    """
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)

        init_dir = "."
        if req.initial_path and os.path.exists(req.initial_path):
            if os.path.isdir(req.initial_path):
                init_dir = req.initial_path
            else:
                init_dir = str(Path(req.initial_path).parent)

        if req.mode == "folder":
            selected = filedialog.askdirectory(initialdir=init_dir, title="Select Directory")
        elif req.mode == "save":
            types = [
                ("All Supported Images", "*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.geotiff"),
                ("GeoTIFF Images (*.tif;*.tiff)", "*.tif;*.tiff"),
                ("PNG Images (*.png)", "*.png"),
                ("JPEG Images (*.jpg;*.jpeg)", "*.jpg;*.jpeg"),
                ("All Files", "*.*")
            ]
            selected = filedialog.asksaveasfilename(initialdir=init_dir, filetypes=types, title="Select Export File Path")
        else:
            if req.file_types == "image":
                types = [
                    ("All Supported Images (*.jpg;*.png;*.tif)", "*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.geotiff"),
                    ("GeoTIFF Images (*.tif;*.tiff)", "*.tif;*.tiff"),
                    ("PNG Images (*.png)", "*.png"),
                    ("JPEG Images (*.jpg;*.jpeg)", "*.jpg;*.jpeg"),
                    ("All Files", "*.*")
                ]
                dialog_title = "Select Image File (JPEG, PNG, or GeoTIFF)"
            else:
                types = [("Model Checkpoints", "*.pth;*.pt"), ("All Files", "*.*")]
                dialog_title = "Select Checkpoint File"
            selected = filedialog.askopenfilename(initialdir=init_dir, filetypes=types, title=dialog_title)

        root.destroy()
        if selected:
            return {"selected": selected.replace("\\", "/")}
        return {"selected": None}
    except Exception as e:
        print(f"[Browse Error] {e}")
        return {"selected": None, "error": str(e)}


@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_running_loop()


@app.get("/api/status")
def get_system_status():
    """Returns GPU and Trainer status."""
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None"
    gpu_mem_used = round(torch.cuda.memory_reserved(0) / (1024**3), 2) if torch.cuda.is_available() else 0
    gpu_mem_total = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2) if torch.cuda.is_available() else 0

    return {
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": gpu_name,
        "architecture": "HAT-Sat-Pro (Hybrid Attention Transformer)",
        "parameters": "5.09M",
        "loss_suite": "L1 (1.0) + Fourier FFT (0.1) + Spatial Gradient (0.05)",
        "gpu_memory_used_gb": gpu_mem_used,
        "gpu_memory_total_gb": gpu_mem_total,
        "trainer_state": trainer.state,
        "current_epoch": trainer.current_epoch,
        "total_epochs": trainer.total_epochs,
        "best_psnr": trainer.best_psnr,
    }


@app.post("/api/train/start")
def start_training_endpoint(req: TrainStartRequest):
    chosen_export = req.export_dir.strip() if (req.export_dir and req.export_dir.strip()) else "model/checkpoints"
    return trainer.start_training(
        data_train_dir=req.train_dir,
        data_val_dir=req.val_dir,
        export_dir=chosen_export,
        checkpoint_path=req.checkpoint_path,
        epochs=req.epochs,
        batch_size=req.batch_size,
        learning_rate=req.learning_rate,
        scale=req.scale,
        grad_accum_steps=req.grad_accum_steps,
        early_stopping=req.early_stopping,
        patience=req.patience,
        min_delta=req.min_delta,
    )


@app.post("/api/train/pause")
def pause_training_endpoint():
    return trainer.pause_training()


@app.post("/api/train/resume")
def resume_training_endpoint():
    return trainer.resume_training()


@app.post("/api/train/stop")
def stop_training_endpoint():
    res = trainer.stop_training()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
    return res


@app.post("/api/utils/release_memory")
def release_memory_endpoint():
    trainer._cleanup_gpu_memory()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
    mem_used = round(torch.cuda.memory_reserved(0) / (1024**3), 3) if torch.cuda.is_available() else 0
    return {"status": "ok", "gpu_memory_reserved_gb": mem_used}


@app.get("/api/train/history")
def get_train_history():
    return {
        "state": trainer.state,
        "current_epoch": trainer.current_epoch,
        "total_epochs": trainer.total_epochs,
        "best_psnr": trainer.best_psnr,
        "history": trainer.history,
    }


@app.get("/api/patches/list")
def list_available_patches(split: str = "FinalTest"):
    """
    Returns curated sample patches categorized for easy demonstration.
    """
    categories = ["military_base", "airport", "city_roads", "mountain_outpost", "vegetation", "water_ports"]
    base_dir = Path("Dataset/4_Channel_Data")
    if not base_dir.exists():
        base_dir = Path("Dataset/data/FinalTest/HR")

    grouped: Dict[str, List[Dict[str, str]]] = {cat: [] for cat in categories}
    grouped["other"] = []

    if base_dir.exists():
        files = sorted(list(base_dir.glob("*.npy")))
        for f in files:
            placed = False
            for cat in categories:
                prefix = cat.split("_")[0]
                if prefix in f.stem:
                    if len(grouped[cat]) < 12:
                        grouped[cat].append({"name": f.name, "path": str(f.resolve())})
                    placed = True
                    break
            if not placed and len(grouped["other"]) < 10:
                grouped["other"].append({"name": f.name, "path": str(f.resolve())})

    return grouped


@app.get("/api/models/list")
def list_available_models():
    """Lists all saved .pth checkpoints in user-chosen export_dir and model/checkpoints."""
    search_dirs = []
    if hasattr(trainer, "export_dir") and trainer.export_dir:
        custom_dir = Path(trainer.export_dir)
        if custom_dir.exists():
            search_dirs.append(custom_dir)
    default_dir = Path("model/checkpoints")
    if default_dir.exists() and default_dir not in search_dirs:
        search_dirs.append(default_dir)

    seen = set()
    models = []
    for sdir in search_dirs:
        for f in sdir.glob("**/*.pth"):
                resolved = str(f.resolve())
                if resolved not in seen:
                    seen.add(resolved)
                    models.append({
                        "name": f.name,
                        "path": str(f).replace("\\", "/"),
                        "size_mb": round(f.stat().st_size / (1024 * 1024), 2),
                        "modified": f.stat().st_mtime
                    })
    return sorted(models, key=lambda x: x["modified"], reverse=True)


def _find_eval_image(filename: str) -> Optional[Path]:
    if hasattr(trainer, "export_dir") and trainer.export_dir:
        p = Path(trainer.export_dir) / filename
        if p.exists():
            return p
    p = Path("model/checkpoints") / filename
    if p.exists():
        return p
    matches = sorted(Path("model/checkpoints").glob(f"**/{filename}"), key=lambda x: x.stat().st_mtime, reverse=True)
    if matches:
        return matches[0]
    return None


@app.get("/report")
@app.get("/report.html")
async def serve_report_page():
    """Serves the standalone evaluation report page with interactive image viewer."""
    candidates = [
        Path("model/gui/dist/report.html"),
        Path("model/gui/public/report.html"),
        Path("model/gui/report.html")
    ]
    for p in candidates:
        if p.exists():
            return FileResponse(p, media_type="text/html")
    raise HTTPException(status_code=404, detail="Standalone report.html not found.")


@app.get("/api/artifacts/eval/latest")
def get_latest_eval_artifact():
    path = _find_eval_image("best_model_eval_latest.png")
    if path and path.exists():
        return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="No evaluation image found.")


@app.get("/api/artifacts/eval/{epoch}")
def get_epoch_eval_artifact(epoch: int):
    path = _find_eval_image(f"best_model_eval_epoch_{epoch}.png")
    if not path:
        path = _find_eval_image("best_model_eval_latest.png")
    if path and path.exists():
        return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Evaluation image not found.")


@app.get("/api/artifacts/curves/latest")
def get_latest_curves_artifact():
    path = _find_eval_image("training_curves_latest.png")
    if path and path.exists():
        return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="No curves image found.")


@app.get("/api/artifacts/curves/{epoch}")
def get_epoch_curves_artifact(epoch: int):
    path = _find_eval_image(f"training_curves_epoch_{epoch}.png")
    if not path:
        path = _find_eval_image("training_curves_latest.png")
    if path and path.exists():
        return FileResponse(path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Curves image not found.")


@app.post("/api/infer/run")
def run_inference_endpoint(req: InferRequest):
    """Standard LR -> SR inference with metrics against HR (supports continuous scale & seamless tiling)."""
    try:
        return infer_engine.run_patch_inference(
            patch_path=req.patch_path,
            checkpoint_path=req.checkpoint_path,
            scale=req.scale,
            use_tiling=req.use_tiling,
            tile_size=req.tile_size,
            overlap=req.overlap
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/infer/zero-shot")
def run_zero_shot_endpoint(req: InferRequest):
    """0-Shot mode: runs directly on native 10m patch (supports continuous scale & seamless tiling)."""
    try:
        return infer_engine.run_zero_shot_inference(
            patch_path=req.patch_path,
            checkpoint_path=req.checkpoint_path,
            scale=req.scale,
            use_tiling=req.use_tiling,
            tile_size=req.tile_size,
            overlap=req.overlap
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/infer/image-file")
def run_image_file_inference_endpoint(req: InferImageFileRequest):
    """
    Runs full super-resolution inference on any custom JPEG, PNG, or GeoTIFF image.
    Supports continuous scale factors, seamless sliding-window tiling, and exports
    to the designated output path in the identical data format.
    """
    try:
        return infer_engine.run_custom_file_inference(
            input_path=req.input_path,
            output_path=req.output_path,
            checkpoint_path=req.checkpoint_path,
            scale=req.scale,
            use_tiling=req.use_tiling,
            tile_size=req.tile_size,
            overlap=req.overlap
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/infer/upload-image")
async def upload_image_endpoint(file: UploadFile = File(...)):
    """
    Uploads a JPEG, PNG, or GeoTIFF file from drag-and-drop web browser interaction.
    Saves to Dataset/temp_uploads and returns the local disk path.
    """
    try:
        upload_dir = Path("Dataset/temp_uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        dest_path = upload_dir / file.filename

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        size_mb = round(dest_path.stat().st_size / (1024 * 1024), 2)
        return {
            "status": "success",
            "filename": file.filename,
            "path": str(dest_path.resolve()).replace("\\", "/"),
            "size_mb": size_mb
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@app.websocket("/ws/train")
async def websocket_training_stream(websocket: WebSocket):
    """Websocket channel for live YOLO terminal lines and epoch summaries."""
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        await websocket.send_json({
            "type": "init",
            "state": trainer.state,
            "epoch": trainer.current_epoch,
            "total_epochs": trainer.total_epochs,
            "best_psnr": trainer.best_psnr,
            "history": trainer.history
        })
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
    except Exception:
        if websocket in active_websockets:
            active_websockets.remove(websocket)


# Mount static React frontend if build exists
frontend_dist = Path("model/gui/dist")
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
