# Sentinel-2 4-Channel Super-Resolution Dataset Pipeline

Reproducible data acquisition, processing, patch extraction, and degradation pipeline for training 4-channel (Red, Green, Blue, Near-Infrared) satellite super-resolution models.

---

## Overview

This pipeline queries the **Copernicus Data Space Ecosystem (CDSE) OData API**, retrieves cloud-free Sentinel-2 Level-2A surface reflectance products, extracts high-fidelity 4-band patches (128x128), simulates realistic satellite optical sensor degradation via Gaussian Point Spread Function (PSF), and splits the dataset into **Train (80%)**, **Validation (10%)**, and **Test (10%)** sets.

### Spectral Bands Extracted:
| Index | Band | Description | Native Resolution | Central Wavelength |
|:---:|:---:|:---:|:---:|:---:|
| **0** | **B04** | Red | 10m | 665 nm |
| **1** | **B03** | Green | 10m | 560 nm |
| **2** | **B02** | Blue | 10m | 490 nm |
| **3** | **B08** | Near-Infrared (NIR) | 10m | 842 nm |

---

## Directory Structure

`
Shourya_DataSetConstruct/
├── cdse_client.py         # CDSE OData API client (OAuth2, spatial search, streaming download)
├── patch_extractor.py     # 4-band patch slicing with cloud/nodata/variance filters
├── build_dataset.py       # Automated scene downloader and patch accumulator across AOIs
├── prepare_splits.py      # PSF Gaussian blur + 4x downsampling (HR/LR) and Train/Val/Test splits
├── verify_dataset.py      # Quality verification, array statistics, and preview generator
├── requirements.txt       # Python dependencies
├── .env.example           # Environment template for CDSE credentials
└── README.md              # Pipeline documentation
`

---

## Quickstart & Reproduction

### 1. Install Dependencies
`ash
pip install -r requirements.txt
`

### 2. Configure Credentials
1. Register for a free Copernicus Data Space account at https://dataspace.copernicus.eu/
2. Copy .env.example to .env:
   `ash
   cp .env.example .env
   `
3. Enter your CDSE username and password inside .env:
   `ini
   CDSE_USERNAME=your_copernicus_email@example.com
   CDSE_PASSWORD=your_copernicus_password
   DATASET_OUTPUT_DIR=./data/4_Channel_Data
   TARGET_PATCH_COUNT=8000
   PATCH_SIZE=128
   `

### 3. Survey AOIs (Dry Run)
Verify CDSE API connectivity and survey available cloud-free tiles across 16 global targets without downloading:
`ash
python build_dataset.py --dry-run
`

### 4. Download Scenes & Extract 4-Channel Patches
`ash
python build_dataset.py --target-count 8000 --max-cloud 2.0
`
This will:
- Query cloud-free Sentinel-2 L2A granules across diverse geographic terrain (military air bases, naval dry docks, commercial airports, ports, urban/industrial hubs).
- Stream individual 10m band files (B04, B03, B02, B08).
- Filter out invalid patches (nodata, high cloud saturation, flat textures).
- Save clean (4, 128, 128) uint16 patches as .npy files inside ./data/4_Channel_Data/.

### 5. Generate Sensor PSF Degradation & Prepare Splits
`ash
python prepare_splits.py --scale 4 --sigma-min 0.6 --sigma-max 1.4
`
This generates:
- ./data/train/HR and ./data/train/LR (80% of data)
- ./data/val/HR and ./data/val/LR (10% of data)
- ./data/FinalTest/HR and ./data/FinalTest/LR (10% of data)
- dataset_manifest.json with metadata and PSF sigma parameters.

### 6. Verify Dataset Quality & Visual Previews
`ash
# Verify raw 4-channel patches
python verify_dataset.py --dir ./data/4_Channel_Data --preview ./sample_patches_preview.png

# Verify splits
python verify_dataset.py --check-splits --data-dir ./data
`
