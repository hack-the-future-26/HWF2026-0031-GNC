# Prakshat: Multi-Format Super-Resolution Inference Endpoints (Backend)

High-performance FastAPI server providing CPU and GPU inference endpoints for the HAT-Light Satellite Super-Resolution GUI.

---

## 📡 API Endpoints Specification (Contract with Rounak's Frontend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/health` | System status, device mode (CPU / CUDA), memory allocation |
| **GET** | `/api/patches/list` | List available test dataset scenes and categories |
| **POST** | `/api/infer` | Direct single-patch super-resolution |
| **POST** | `/api/infer/tile` | Seamless 2D Hann-window sliding tiling for large GeoTIFFs |
| **POST** | `/api/infer/upload` | Multi-format file upload (`.tif`, `.npy`, `.png`, `.jpg`, `.jp2`) |
| **POST** | `/api/export` | Export result in identical format to input |

---

## 🧩 Supported Formats
- **GeoTIFF (`.tif`, `.tiff`):** Reads/writes via `rasterio` preserving projection and geotransforms.
- **NumPy (`.npy`):** 4-channel `(4, H, W)` surface reflectance uint16 arrays.
- **JPEG 2000 (`.jp2`):** Native Sentinel-2 10m bands.
- **Standard Images (`.png`, `.jpg`):** True Color visual RGB composites.

---

## 💻 Zero-GPU / CPU Optimization for Competition Judges
The engine supports `torch.device('cpu')` with Float32 tensors so that evaluators and judges without dedicated NVIDIA GPUs can run the complete super-resolution pipeline with zero errors.
