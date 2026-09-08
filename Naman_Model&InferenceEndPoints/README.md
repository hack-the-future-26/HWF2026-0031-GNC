# Naman: Model Architecture, Training Telemetry & Inference Endpoints

This module contains the complete deep learning pipeline for **4-Channel Satellite Super-Resolution (HAT-Light / HAT-Sat-Pro)**, including model architecture, loss functions, trained weights, evaluation telemetry across 100 epochs, the test dataset, and API endpoints for frontend application integration.

---

## 📁 Structure

`
Naman_Model&InferenceEndPoints/
├── model/
│   ├── hat_light.py         # Lightweight Hybrid Attention Transformer (HAT-Light)
│   ├── dataset.py           # 4-Channel PyTorch dataset loader & normalizer
│   ├── losses.py            # Composite loss: L1 + 0.10*FFT + 0.05*Gradient
│   ├── trainer.py           # 100-Epoch Training loop, mixed precision & telemetry
│   ├── infer.py             # Inference engine with 2D Hann window tiled blending
│   ├── server.py            # FastAPI REST & WebSocket streaming server
│   └── run_gui.py           # Studio GUI runner
├── weights/
│   └── best_model.pth       # Trained model checkpoint (Epoch 82/100, 58.4 MB)
├── evaluation_and_metrics/
│   ├── best_model_eval_epoch_100.png   # Visual RGB & CIR comparison against Ground Truth
│   ├── training_curves_epoch_100.png   # 6-Graph telemetry curves (Loss, PSNR, SSIM, LR)
│   ├── model_evaluation_and_test_scores.md # Complete architectural and loss specifications
│   └── evaluation_metrics.json         # Machine-readable test benchmark scores
├── test_dataset/
│   ├── HR/                  # 799 Ground Truth 128x128 4-channel .npy patches
│   ├── LR/                  # 799 4x Downsampled & PSF-degraded 32x32 .npy patches
│   └── sample_preview.png   # Dataset preview visualization
├── frontend_integration/
│   ├── api_docs.md          # REST API & WebSocket specifications for frontend devs
│   ├── test_client.py       # Python test client for HTTP API calls
│   └── sample_inference.py  # Standalone Python inference demo (3 lines of code)
├── requirements.txt         # Required Python packages
└── README.md
`

---

## 🚀 Quickstart

### 1. Install Dependencies
`ash
pip install -r requirements.txt
`

### 2. Run Inference Server (FastAPI)
`ash
python model/server.py --port 8000
`
API Documentation will be live at http://localhost:8000/docs.

### 3. Run Standalone Inference Demo
`ash
python frontend_integration/sample_inference.py
`

### 4. Key Performance Highlights (FinalTest Dataset)
* **Overall 4-Band PSNR:** 40.18 dB (+6.75 dB gain over bicubic)
* **RGB PSNR:** 45.51 dB
* **NIR PSNR:** 37.76 dB (+9.26 dB gain)
* **SSIM:** 0.9312
* **Inference Speed:** ~100 ms per patch on NVIDIA RTX 3050 Laptop GPU (6GB)
