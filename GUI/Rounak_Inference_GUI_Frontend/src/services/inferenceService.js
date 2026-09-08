/**
 * Real Multi-Format Model Inference API Client
 * Connects directly to Prakshat's CPU-capable FastAPI backend.
 */

const API_BASE_URL = 'http://localhost:8000';

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
        hardwareNotice: 'Run python app.py'
      }
    };
  },

  async getTestPatches(category = 'all', search = '', limit = 100) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('limit', String(limit));

      const res = await fetch(`${API_BASE_URL}/api/patches/list?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to fetch test patches from backend:', e);
    }
    return { total: 0, categories: {}, patches: [] };
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
