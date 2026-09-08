# 🛰️ HAT-Light: 4-Channel Multi-Spectral Satellite Super-Resolution Studio
### High-Fidelity 10m -> 2.5m (4x) Continuous Super-Resolution for RGB + Near-Infrared (NIR) Imagery
**Hack the Future 2026 Submission** | **Team HTF26-029-GNC**

[![Zero-GPU CPU Verified](https://img.shields.io/badge/CPU%20Inference-161ms%20%7C%20Zero--GPU%20Ready-emerald.svg)](#-zero-shot-quickstart-for-evaluators)
[![PSNR Benchmark](https://img.shields.io/badge/Test%20PSNR-40.18%20dB-blue.svg)](#-benchmark-results)
[![Multi-Format Support](https://img.shields.io/badge/Format-GeoTIFF%20%7C%20NumPy%20%7C%20PNG%20%7C%20JPEG-purple.svg)](#-multi-format-geospatial-engine)
[![UI Design](https://img.shields.io/badge/Frontend-Linear.app%20Design-indigo.svg)](#-interactive-inference-studio-gui)

---

## 📌 Executive Summary

Satellite imagery from Earth observation constellations (such as Sentinel-2) provides invaluable multispectral data. However, native optical resolution is physically constrained to **10 meters/pixel** across Visible (B02 Blue, B03 Green, B04 Red) and Near-Infrared (B08 NIR) bands.

**HAT-Light** solves this challenge by deploying a **Hybrid Attention Transformer** specially calibrated for 4-channel 16-bit satellite reflectance. The system:
1. **Super-resolves 10m imagery to 2.5m resolution (4x scale)**, bringing out airport runways, shipping containers, building perimeters, and agricultural field boundaries.
2. **Runs zero-shot on standard CPUs (Zero-GPU required)**: Evaluators can clone and run in **~160 milliseconds per patch** without high-end NVIDIA hardware.
3. **Preserves Geospatial Georeferencing**: Preserves full Coordinate Reference Systems (CRS) and automatically scales Affine geotransforms in 16-bit GeoTIFF exports.
4. **Features an Interactive Linear.app-Inspired Studio**: Split-screen comparative slider, high-frequency difference heatmap, dual spectral mode (RGB True Color & Color Infrared / NIR), and multi-format drag-and-drop.

---

## ⚡ 1-Minute Quickstart for Evaluators

The repository is configured for **instant zero-config launch** on standard consumer PCs and laptops.

### Method 1: Double-Click Launcher (Windows)
Double-click **`run_demo.bat`** or **`app.bat`** in the repository root.

### Method 2: Python Command Line
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Launch the Studio (starts CPU inference server & opens browser automatically)
python app.py
```
> The studio will start on **`http://localhost:8000`** and open in your default browser.

---

## 🏆 Benchmark Results

Evaluated across **799 curated multi-spectral test patches** from diverse geographic biomes (airports, naval bases, metropolitan grids, maritime ports, and agricultural basins):

| Metric | Bicubic Baseline | HAT-Light (Our Model) | Net Gain |
| :--- | :---: | :---: | :---: |
| **Overall PSNR** | 33.43 dB | **40.18 dB** | **+6.75 dB** 🚀 |
| **RGB Bands PSNR** | 35.12 dB | **42.45 dB** | **+7.33 dB** |
| **NIR Band PSNR** | 32.20 dB | **38.64 dB** | **+6.44 dB** |
| **SSIM** | 0.812 | **0.934** | **+0.122** |
| **MAE** | 0.042 | **0.012** | **-71.4% Error** |
| **CPU Latency** | — | **161.9 ms / patch** | **Zero-GPU Ready** |

---

## 🏗️ Technical Architecture & Repository Layout

```
HWF2026-0031-GNC/
│
├── app.py / run_demo.py          # One-shot evaluator application launchers
├── app.bat / run_demo.bat        # Windows zero-config launch scripts
├── requirements.txt              # Root consolidated dependencies
│
├── Dataset/
│   └── Shourya_DataSetConstruct/ # Stage 1: Data pipeline by Shourya
│       ├── cdse_fetcher.py       # CDSE Copernicus Sentinel-2 automated API ingestion
│       ├── patch_extractor.py    # 16-bit 4-channel (B04, B03, B02, B08) extraction
│       ├── psf_degradation.py    # Physical sensor point-spread function simulation
│       └── split_dataset.py      # Spatial cross-validation dataset splits
│
├── Naman_Model&InferenceEndPoints/ # Stage 2: AI model & training by Naman
│   ├── model/
│   │   ├── hat_light.py          # Hybrid Attention Transformer architecture
│   │   ├── losses.py             # Composite loss (Charbonnier + FFT + SAM + SSIM)
│   │   ├── dataset.py            # uint16 BOA reflectance normalization
│   │   └── infer.py              # Zero-shot model inference engine
│   ├── weights/
│   │   └── best_model.pth        # Trained model checkpoint (100% parameter match)
│   ├── test_dataset/             # 799 multi-spectral evaluation test patches (HR & LR)
│   └── evaluation_and_metrics/   # Loss curves, validation graphs, and metrics summary
│
└── GUI/
    ├── Rounak_Inference_GUI_Frontend/ # Stage 3: Studio UI by Rounak
    │   ├── src/                  # Linear.app-inspired React/Tailwind/Lucide UI
    │   │   ├── components/       # Split-slider, difference heatmap, dropzone, export
    │   │   └── services/         # Real API integration service
    │   └── dist/                 # Pre-compiled high-performance production build
    │
    └── Prakshat_Inference_GUI_Endpoints_MultiFormatSupport_Backend/ # Stage 3: Backend by Prakshat
        ├── server.py             # FastAPI CPU/GPU zero-shot REST server
        ├── multi_format_io.py    # GeoTIFF, NPY, PNG, JPG I/O with CRS scaling
        └── tiling_engine.py      # 2D Hann-window sliding tiling for full scenes
```

---

## 🎨 Interactive Inference Studio Features

1. **Interactive Comparison Split-Slider**: Compare 10m native bicubic baseline vs. 2.5m super-resolved output with real-time zooming and panning.
2. **High-Frequency Difference Heatmap**: Turbo colormap rendering highlighting restored architectural edges, runways, road networks, and port terminals.
3. **Dual Spectral Visualization**:
   - **True Color (RGB)**: Natural color representation (B04, B03, B02).
   - **Color Infrared (CIR / NIR)**: False-color composite (B08 NIR, B04 Red, B03 Green) highlighting vegetation density and water bodies.
4. **Seamless Sliding-Window Tiling Engine**: 2D Hann-window blending stitches full-scene satellite tiles without boundary seams or edge artifacts.
5. **Multi-Format Format-Preserving Export**: Download super-resolved imagery in the exact same format as input (16-bit GeoTIFF with updated Affine geotransform, 4-channel uint16 NumPy, or standard high-res PNG).

---

## 👥 Team HTF26-029-GNC Contributions

- **Shourya Bhargava** (`Dataset` / `Work`): CDSE Sentinel-2 data ingestion, PSF degradation pipeline, multi-band extraction, and dataset curation.
- **Naman** (`Model`): HAT-Light neural architecture design, Composite Multi-Task Physical Loss Suite, model training, checkpoint weights, and benchmark evaluation.
- **Rounak Kapoor** (`Frontend`): Linear.app-inspired React studio, comparison split slider, difference heatmap component, and spectral toggles.
- **Prakshat Khunteta** (`Frontend` / `Backend`): Multi-format geospatial I/O (GeoTIFF/NPY/PNG), 2D Hann sliding tiling engine, zero-GPU CPU execution optimization, and one-shot evaluator launchers.

---
*Built for Hack the Future 2026. All rights reserved.*
