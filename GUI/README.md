# Satellite Super-Resolution GUI Studio

A modular, cross-platform inference studio engineered with Linear.app-inspired design aesthetics for interactive evaluation of the **HAT-Light (4-Channel Sentinel-2 Super-Resolution)** model.

---

## ?? Architecture & Modules

```
GUI/
+-- Rounak_Inference_GUI_Frontend/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   ¦   +-- Header.jsx                 # Linear minimalist top bar & mode toggles
¦   ¦   ¦   +-- SidebarControls.jsx        # Granule browser, scale selector, tiling settings
¦   ¦   ¦   +-- LinearComparisonSlider.jsx # Draggable split comparison slider with pan & zoom
¦   ¦   ¦   +-- DifferenceHeatmap.jsx      # High-frequency Sobel/Wavelet residual difference map
¦   ¦   ¦   +-- MultiFormatDropzone.jsx    # Drag & drop importer (.tif, .npy, .png, .jpg, .jp2)
¦   ¦   ¦   +-- ExportModal.jsx            # Format-preserving exporter popup
¦   ¦   +-- services/
¦   ¦   ¦   +-- inferenceService.js        # Decoupled API service with Zero-Shot offline simulation
¦   ¦   +-- App.jsx
¦   ¦   +-- main.jsx
¦   ¦   +-- index.css
¦   +-- package.json
¦   +-- vite.config.js
¦   +-- tailwind.config.js
¦   +-- README.md
¦
+-- Prakshat_Inference_GUI_Endpoints_MultiFormatSupport_Backend/
    +-- main.py                            # FastAPI CPU/GPU inference server
    +-- requirements.txt
    +-- README.md                          # API contract & multi-format handling
```

---

## ? Quickstart (Zero-Shot Judges Demo)

### 1. Launch Frontend
```bash
cd Rounak_Inference_GUI_Frontend
npm install
npm run dev
```
Open `http://localhost:5173` to interact with the full GUI studio immediately without requiring a GPU.
