# Frontend & Application Integration Guide

This guide describes how to connect any web, desktop, or mobile frontend to the HAT-Light Satellite Super-Resolution inference server.

---

## 1. Running the Inference Server

Start the FastAPI inference backend:
```bash
python model/server.py --port 8000 --host 0.0.0.0
```
Or launch with GUI studio:
```bash
python model/run_gui.py
```

The interactive Swagger API documentation will be available at:
👉 `http://localhost:8000/docs`

---

## 2. REST API Endpoints

### Health & GPU Status
- **Method:** `GET`
- **Path:** `/api/health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "device": "cuda:0",
    "gpu_name": "NVIDIA GeForce RTX 3050 6GB Laptop GPU",
    "vram_allocated_mb": 260.0
  }
  ```

### Run Patch Inference
- **Method:** `POST`
- **Path:** `/api/infer`
- **Body:**
  ```json
  {
    "patch_path": "test_dataset/HR/sample_001.npy",
    "scale": 4.0,
    "checkpoint": "weights/best_model.pth"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "scale": 4.0,
    "metrics": {
      "psnr": 41.2,
      "psnr_rgb": 46.1,
      "psnr_nir": 38.4,
      "ssim": 0.935
    },
    "rgb_sr_base64": "data:image/png;base64,...",
    "cir_sr_base64": "data:image/png;base64,..."
  }
  ```

### Direct File Upload (0-Shot Super-Resolution)
- **Method:** `POST`
- **Path:** `/api/infer/upload`
- **Form Data:**
  - `file`: Raw image / `.npy` array / GeoTIFF
  - `scale`: Continuous scale factor (e.g. `2.0`, `3.0`, `4.0`, `8.0`)
- **Response:** Returns base64 encoded PNG for both True Color RGB and Color Infrared CIR.

### Seamless Sliding-Window Tiling (Large Satellite Scenes)
- **Method:** `POST`
- **Path:** `/api/infer/tile`
- **Body:**
  ```json
  {
    "image_path": "/path/to/large_scene.tif",
    "scale": 4.0,
    "tile_size": 64,
    "overlap": 16
  }
  ```
- Uses 2D Hann window blending across adjacent overlapping patches to guarantee zero border/seam artifacts.

---

## 3. Direct Python Module Integration (No HTTP Server Needed)

Frontend or backend engineers can import the inference engine directly:

```python
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from model.infer import infer_engine

# 1. Load model weights (CUDA GPU)
infer_engine.load_model("weights/best_model.pth", scale=4.0)

# 2. Run inference on patch
result = infer_engine.run_patch_inference("test_dataset/HR/sample_001.npy", scale=4.0)

# 3. Access results
print("PSNR:", result["metrics"]["psnr"])
print("SSIM:", result["metrics"]["ssim"])
# Base64 string ready to pass directly to HTML <img src="...">
img_uri = result["rgb_sr_base64"]
```
