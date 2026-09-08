"""
Example Python client demonstrating how frontend/client apps communicate with the HAT-Light inference server.
"""

import requests
import json
import base64
from pathlib import Path

SERVER_URL = "http://localhost:8000"

def check_server_health():
    url = f"{SERVER_URL}/api/health"
    try:
        r = requests.get(url, timeout=5)
        print("Server Health:", r.json())
        return r.status_code == 200
    except Exception as e:
        print(f"Could not connect to server at {url}: {e}")
        return False

def test_patch_inference(patch_path: str, scale: float = 4.0):
    url = f"{SERVER_URL}/api/infer"
    payload = {
        "patch_path": str(patch_path),
        "scale": scale,
        "checkpoint": "weights/best_model.pth"
    }
    r = requests.post(url, json=payload)
    if r.status_code == 200:
        data = r.json()
        print("Inference successful!")
        print("Metrics:", json.dumps(data.get("metrics"), indent=2))
        return data
    else:
        print("Inference failed:", r.status_code, r.text)
        return None

if __name__ == "__main__":
    print("Testing HAT-Light Inference Client...")
    if check_server_health():
        # Example test patch
        sample_patch = Path("test_dataset/HR").glob("*.npy")
        first_patch = next(sample_patch, None)
        if first_patch:
            test_patch_inference(str(first_patch))
        else:
            print("No test patch found in test_dataset/HR.")
