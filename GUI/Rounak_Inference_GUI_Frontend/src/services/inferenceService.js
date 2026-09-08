/**
 * Real Multi-Format Model Inference API Client
 * Connects directly to Prakshat's CPU-capable FastAPI backend.
 */

const API_BASE_URL = 'http://localhost:8000';

export const CURATED_TEST_SAMPLES = [
  {
    id: 'patch_airport_001428.npy',
    name: 'Frankfurt Intersecting Runways',
    category: 'Airports & Runways',
    coords: '50.037° N, 8.562° E',
    resolution: '10m Native -> 2.5m Super-Resolved',
    format: 'GeoTIFF / NPY (4-Channel uint16)'
  },
  {
    id: 'patch_military_002130.npy',
    name: 'Norfolk Naval Station Dry Docks',
    category: 'Naval & Air Bases',
    coords: '36.945° N, -76.326° W',
    resolution: '10m Native -> 2.5m Super-Resolved',
    format: 'GeoTIFF / NPY (4-Channel uint16)'
  },
  {
    id: 'patch_water_ports_006302.npy',
    name: 'Rotterdam Maritime Logistics Basin',
    category: 'Ports & Infrastructure',
    coords: '51.954° N, 4.128° E',
    resolution: '10m Native -> 2.5m Super-Resolved',
    format: 'GeoTIFF / NPY (4-Channel uint16)'
  },
  {
    id: 'patch_urban_004512.npy',
    name: 'Dubai Industrial Grid & Terminals',
    category: 'Urban & Industrial',
    coords: '25.077° N, 55.138° E',
    resolution: '10m Native -> 2.5m Super-Resolved',
    format: 'GeoTIFF / NPY (4-Channel uint16)'
  }
];

export const inferenceService = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return { connected: true, data };
      }
    } catch (e) {
      console.warn('Backend not running at ' + API_BASE_URL);
    }
    return {
      connected: false,
      data: {
        status: 'offline',
        device: 'CPU (Waiting for backend)',
        hardwareNotice: 'Run python GUI/Prakshat_Inference_GUI_Endpoints_MultiFormatSupport_Backend/server.py'
      }
    };
  },

  async getTestPatches() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patches/list`);
      if (res.ok) {
        const list = await res.json();
        if (list.length > 0) return list;
      }
    } catch (e) {}
    return CURATED_TEST_SAMPLES;
  },

  async runInference({
    patchPath = '',
    inputMode = 'curated',
    scale = 4.0,
    useTiling = false,
    tileSize = 128,
    overlap = 32,
    colorMode = 'rgb'
  }) {
    const res = await fetch(`${API_BASE_URL}/api/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patch_path: patchPath,
        scale: Number(scale),
        use_tiling: Boolean(useTiling),
        tile_size: Number(tileSize),
        overlap: Number(overlap),
        color_mode: colorMode
      })
    });
    if (!res.ok) {
      throw new Error(`Inference request failed: ${res.statusText}`);
    }
    return await res.json();
  },

  async uploadAndInfer(file, scale = 4.0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scale', scale);

    const res = await fetch(`${API_BASE_URL}/api/infer/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      throw new Error(`Upload inference failed: ${res.statusText}`);
    }
    return await res.json();
  },

  async exportSuperResolution({
    filename = 'satellite_sr_4x',
    format = 'tif',
    scale = 4.0,
    bitDepth = '16-bit',
    exportPath = './exports'
  }) {
    const res = await fetch(`${API_BASE_URL}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, format, scale, bitDepth, exportPath })
    });
    return await res.json();
  }
};
