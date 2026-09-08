"""
One-Shot Zero-Config Application Launcher for Competition Evaluators.
Automatically launches Prakshat's CPU Inference Server and opens the Inference Studio in Chrome/Default Browser.
"""

import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent

def find_python_interpreter() -> str:
    # 1. Check local virtual environment in repo
    local_venv = REPO_ROOT / ".venv" / "Scripts" / "python.exe"
    if local_venv.exists():
        return str(local_venv)
    
    # 2. Check direct parent directory virtual environment (for subfolder clones)
    parent_venv = REPO_ROOT.parent / ".venv" / "Scripts" / "python.exe"
    if parent_venv.exists():
        return str(parent_venv)

    # 3. Check parent/sibling virtual environment
    sibling_venv = REPO_ROOT.parent / "SIH_SatSuperResoulution" / ".venv" / "Scripts" / "python.exe"
    if sibling_venv.exists():
        return str(sibling_venv)
        
    # 4. Fallback to currently running interpreter
    return sys.executable

def main():
    print("=" * 70)
    print("  HAT-Light Satellite Super-Resolution: One-Shot Studio Launcher")
    print("=" * 70)
    py_exec = find_python_interpreter()
    print(f"[1/3] Using Python interpreter: {py_exec}")

    # Start FastAPI Backend
    server_script = REPO_ROOT / "GUI" / "Prakshat_Inference_GUI_Endpoints_MultiFormatSupport_Backend" / "server.py"
    print(f"[2/3] Launching CPU Inference Server ({server_script.name})...")
    
    server_process = subprocess.Popen(
        [py_exec, str(server_script)],
        cwd=str(REPO_ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # Wait for server startup
    print("[3/3] Initializing studio and loading model weights on CPU...")
    time.sleep(3.5)

    studio_url = "http://localhost:8000"
    print(f"\n   Studio successfully live at: {studio_url}")
    print("Opening browser for live evaluation...")
    webbrowser.open(studio_url)

    print("\nPress Ctrl+C to stop the studio.")
    try:
        while True:
            line = server_process.stdout.readline()
            if line:
                print(line.strip())
            elif server_process.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nShutting down studio...")
        server_process.terminate()

if __name__ == "__main__":
    main()
