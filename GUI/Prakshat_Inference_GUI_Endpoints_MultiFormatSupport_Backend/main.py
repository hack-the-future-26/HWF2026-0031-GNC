"""
Prakshat: Multi-Format Satellite Super-Resolution Inference FastAPI Server Entry Point.
"""

from GUI.Prakshat_Inference_GUI_Endpoints_MultiFormatSupport_Backend.server import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
