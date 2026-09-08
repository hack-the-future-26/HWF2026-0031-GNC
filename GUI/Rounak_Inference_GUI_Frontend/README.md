# Rounak: Satellite Super-Resolution Inference GUI (Frontend)

A sleek, desktop-grade inference studio inspired by **Linear.app** design aesthetics, engineered for interactive satellite imagery super-resolution (HAT-Light / HAT-Sat-Pro).

---

## ✨ Features

- **Linear-Inspired Dark Interface:**
  - Obsidian/charcoal surfaces (#08090a, #0f1011, #141517) with subtle 1px border lines (#232529).
  - Monospace telemetry tags, badge chips, keyboard shortcuts (⌘E), and glowing accents.
- **Interactive Split Slider:**
  - Real-time draggable divider comparing Bicubic Low-Resolution (10m) vs. HAT-Light Super-Resolved (2.5m).
  - Smooth pan and 1x-6x zoom functionality.
  - Side-by-side mode toggle for dual-panel inspection.
- **High-Frequency Residual Difference Map:**
  - Spatial difference heatmap highlighting restored high-frequency edges (runways, coastline, piers, roads).
  - Boost multiplier control (1x - 10x) and colormap selections (Inferno, Viridis, Monochrome).
- **Dual Spectral Modes:**
  - **RGB True Color:** Bands 4 (Red), 3 (Green), 2 (Blue).
  - **Color Infrared NIR (CIR):** Bands 8 (Near-Infrared), 4 (Red), 3 (Green) for vegetation and moisture analysis.
- **Tiled & Normal Direct Inference:**
  - Normal direct forward pass for patches.
  - Seamless 2D sliding-window tiling with Hann window blending (64x64, 128x128, 256x256 windows with 16-64px overlap) for full-scene GeoTIFFs.
- **Multi-Format Drag & Drop Importer:**
  - Drag & drop or local filesystem path input supporting GeoTIFF (.tif, .tiff), NumPy (.npy), PNG, JPEG, and JPEG 2000 (.jp2).
- **Input Format-Preserving Exporter:**
  - Export modal preserving original input format and radiometric depth (16-bit uint16 reflectance or 8-bit visual preview).
- **Zero-Shot Instant Run for Competition Judges:**
  - Self-contained standalone mode with preloaded test granules.
  - Operates completely on **CPU with zero GPU requirements**!

---

## 🚀 Quickstart (Zero-Shot Clone & Run)

### 1. Install Dependencies
`ash
npm install
`

### 2. Launch Development Studio
`ash
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build Production Bundle
`ash
npm run build
`

---

## 🔌 Open-Ended Backend Architecture

All API calls are decoupled inside src/services/inferenceService.js:
- Auto-detects if Prakshat's backend is active on http://localhost:8000.
- If offline, falls back seamlessly to the built-in standalone simulation, enabling instant demonstrations anywhere.
