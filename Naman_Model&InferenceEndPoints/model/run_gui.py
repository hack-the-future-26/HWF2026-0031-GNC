"""
Launcher for Lightweight HAT-Light Satellite Super-Resolution Studio.
Defaults to native Windows Electron desktop application.
Pass --browser if web browser mode is explicitly desired.
"""

import os
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
os.chdir(ROOT_DIR)
sys.path.insert(0, str(ROOT_DIR))

import torch


def verify_cuda():
    if not torch.cuda.is_available():
        sys.exit(
            "\n" + "=" * 75 + "\n"
            "CRITICAL ERROR: CUDA GPU required. No compatible NVIDIA GPU detected.\n"
            "Execution halted.\n"
            + "=" * 75 + "\n"
        )


def main():
    verify_cuda()

    # If --browser is explicitly requested, launch in browser
    if "--browser" in sys.argv:
        import webbrowser
        import threading
        import time
        import uvicorn
        from model.server import app

        host = "127.0.0.1"
        port = 7860
        url = f"http://{host}:{port}"

        print(f"[Studio] Launching Web GUI at: {url}")
        threading.Thread(target=lambda: (time.sleep(1.2), webbrowser.open(url)), daemon=True).start()
        uvicorn.run(app, host=host, port=port, log_level="info")
    else:
        # Default to native Windows Electron app
        from run_app import main as launch_electron
        launch_electron()


if __name__ == "__main__":
    main()
