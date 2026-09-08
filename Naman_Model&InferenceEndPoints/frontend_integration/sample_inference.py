"""
Standalone direct inference example without running the FastAPI server.
"""

import sys
from pathlib import Path

# Add parent directory to path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from model.infer import infer_engine

def run_standalone_demo():
    checkpoint = parent_dir / "weights" / "best_model.pth"
    test_patch_dir = parent_dir / "test_dataset" / "HR"
    patches = list(test_patch_dir.glob("*.npy"))
    
    if not patches:
        print("No patches found in test_dataset/HR.")
        return
        
    patch = patches[0]
    print(f"Loading checkpoint: {checkpoint}")
    infer_engine.load_model(str(checkpoint), scale=4.0)
    
    print(f"Running inference on patch: {patch.name}")
    result = infer_engine.run_patch_inference(str(patch), scale=4.0)
    
    print("\n=== Inference Results ===")
    print(f"Overall PSNR: {result['metrics']['psnr']} dB")
    print(f"RGB PSNR:     {result['metrics']['psnr_rgb']} dB")
    print(f"NIR PSNR:     {result['metrics']['psnr_nir']} dB")
    print(f"SSIM:         {result['metrics']['ssim']}")
    print(f"MAE:          {result['metrics']['mae']}")
    print("\nBase64 output ready for frontend display: RGB len =", len(result.get('rgb_sr_base64', '')))

if __name__ == "__main__":
    run_standalone_demo()
