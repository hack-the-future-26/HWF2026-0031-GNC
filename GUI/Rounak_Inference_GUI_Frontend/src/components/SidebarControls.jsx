import React from 'react';
import { 
  Sliders, 
  Grid, 
  Sparkles, 
  Zap, 
  Cpu, 
  Eye, 
  Layers, 
  ChevronRight,
  Database,
  UploadCloud,
  Check
} from 'lucide-react';
import { CURATED_TEST_SAMPLES } from '../services/inferenceService.js';
import MultiFormatDropzone from './MultiFormatDropzone.jsx';

export default function SidebarControls({
  inputMode,
  setInputMode,
  selectedSampleId,
  setSelectedSampleId,
  customPath,
  setCustomPath,
  scale,
  setScale,
  useTiling,
  setUseTiling,
  tileSize,
  setTileSize,
  overlap,
  setOverlap,
  colorMode,
  setColorMode,
  onRunInference,
  isInferring
}) {
  const currentSample = CURATED_TEST_SAMPLES.find(s => s.id === selectedSampleId) || CURATED_TEST_SAMPLES[0];

  return (
    <aside className="w-80 border-r border-[#232529] bg-[#0f1011] flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Tab Switcher: Curated Test Dataset vs Multi-Format Dropzone */}
      <div className="p-3 border-b border-[#232529]">
        <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#141517] border border-[#232529]">
          <button 
            onClick={() => setInputMode('curated')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              inputMode === 'curated'
                ? 'bg-[#232529] text-white shadow-sm'
                : 'text-[#8a8f98] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Test Dataset</span>
          </button>
          <button 
            onClick={() => setInputMode('custom')}
            className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              inputMode === 'custom'
                ? 'bg-[#232529] text-white shadow-sm'
                : 'text-[#8a8f98] hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Custom File</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-5 flex-1">
        {/* Mode 1: Curated Test Dataset Selector */}
        {inputMode === 'curated' ? (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
              <span>Select FinalTest Granule:</span>
              <span className="text-emerald-400 font-semibold">{CURATED_TEST_SAMPLES.length} Scenes</span>
            </label>

            <div className="flex flex-col gap-1.5">
              {CURATED_TEST_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSampleId(s.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedSampleId === s.id
                      ? 'border-[#5e6ad2] bg-[#5e6ad2]/10 text-white shadow-sm'
                      : 'border-[#232529] bg-[#141517] text-[#8a8f98] hover:text-white hover:border-[#3e424b]'
                  }`}
                >
                  <div className="font-medium text-xs text-white flex items-center justify-between">
                    <span>{s.name}</span>
                    {selectedSampleId === s.id && <Check className="w-3.5 h-3.5 text-[#5e6ad2]" />}
                  </div>
                  <div className="text-[10px] text-[#8a8f98] font-mono mt-0.5">{s.coords}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#1c1d20] text-emerald-400 border border-[#2e3138]">
                      {s.metrics.psnr} dB
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#1c1d20] text-[#8a8f98]">
                      SSIM {s.metrics.ssim}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Mode 2: Multi-Format Drag & Drop */
          <div className="flex flex-col gap-2">
            <MultiFormatDropzone 
              onFileSelected={(f) => setCustomPath(f.name)}
              customPath={customPath}
              setCustomPath={setCustomPath}
            />
          </div>
        )}

        {/* Spectral Band Mode: RGB vs NIR */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
            <span>Spectral Composite:</span>
            <span className="text-violet-400 font-semibold">{colorMode.toUpperCase()}</span>
          </label>
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#141517] border border-[#232529]">
            <button
              onClick={() => setColorMode('rgb')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                colorMode === 'rgb'
                  ? 'bg-[#232529] text-white shadow-sm'
                  : 'text-[#8a8f98] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>RGB True Color</span>
            </button>
            <button
              onClick={() => setColorMode('nir')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                colorMode === 'nir'
                  ? 'bg-[#232529] text-violet-300 shadow-sm'
                  : 'text-[#8a8f98] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>NIR False Color</span>
            </button>
          </div>
        </div>

        {/* Continuous Scale Factor */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
            <span>Super-Resolution Scale:</span>
            <span className="text-emerald-400 font-semibold">{scale}x</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[2, 3, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  scale === s 
                    ? 'border border-[#5e6ad2] bg-[#5e6ad2]/20 text-white' 
                    : 'border border-[#232529] bg-[#141517] text-[#8a8f98] hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Tiling vs Direct Pass Toggle */}
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#232529] bg-[#141517]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span>Seamless 2D Tiling</span>
            </span>
            <button 
              onClick={() => setUseTiling(!useTiling)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                useTiling ? 'bg-[#5e6ad2]' : 'bg-[#232529]'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                useTiling ? 'left-4.5' : 'left-1'
              }`} />
            </button>
          </div>

          {useTiling && (
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#232529] text-[11px] font-mono text-[#8a8f98]">
              <div className="flex items-center justify-between">
                <span>Tile Window:</span>
                <select 
                  value={tileSize}
                  onChange={(e) => setTileSize(Number(e.target.value))}
                  className="bg-[#0f1011] border border-[#232529] rounded px-1.5 py-0.5 text-white outline-none"
                >
                  <option value="64">64 x 64</option>
                  <option value="128">128 x 128</option>
                  <option value="256">256 x 256</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Overlap:</span>
                <span>{overlap} px (Hann Blending)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execution Action Button */}
      <div className="p-4 border-t border-[#232529] bg-[#0f1011]">
        <button
          onClick={onRunInference}
          disabled={isInferring}
          className="w-full py-2.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6e7be0] text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-linear-glow disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{isInferring ? 'Processing Model...' : 'Execute Super-Resolution'}</span>
        </button>
      </div>
    </aside>
  );
}
