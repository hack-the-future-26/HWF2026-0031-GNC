import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Grid, 
  Sparkles, 
  Zap, 
  Cpu, 
  Layers, 
  Database, 
  UploadCloud, 
  Check, 
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Eye
} from 'lucide-react';
import MultiFormatDropzone from './MultiFormatDropzone.jsx';

export default function SidebarControls({
  inputMode,
  setInputMode,
  patches = [],
  categories = {},
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedSampleId,
  setSelectedSampleId,
  customFile,
  setCustomFile,
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
  isInferring,
  isLoadingPatches
}) {
  const categoryList = [
    { id: 'all', label: 'All', count: 799 },
    { id: 'military', label: 'Military', count: categories.military || 208 },
    { id: 'airport', label: 'Airport', count: categories.airport || 180 },
    { id: 'city', label: 'City', count: categories.city || 126 },
    { id: 'vegetation', label: 'Vegetation', count: categories.vegetation || 120 },
    { id: 'water', label: 'Water', count: categories.water || 105 },
    { id: 'mountain', label: 'Mountain', count: categories.mountain || 60 },
  ];

  return (
    <aside className="w-88 w-[350px] border-r border-[#232529] bg-[#0f1011] flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Tab Switcher: Test Dataset vs Multi-Format Dropzone */}
      <div className="p-3 border-b border-[#232529] bg-[#141517]/50">
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
            <span>Test Dataset (799)</span>
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
            <span>Upload / Custom</span>
          </button>
        </div>
      </div>

      {/* Scrollable Center Controls */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {inputMode === 'curated' ? (
          <div className="flex flex-col gap-2.5">
            {/* Category Filter Pills */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#5e6ad2]" />
                  Biome / Target Filter:
                </span>
                <span className="text-emerald-400 font-semibold">{patches.length} Granules</span>
              </label>

              <div className="flex flex-wrap gap-1">
                {categoryList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 ${
                      selectedCategory === cat.id
                        ? 'bg-[#5e6ad2] text-white font-semibold shadow-sm'
                        : 'bg-[#141517] text-[#8a8f98] hover:text-white border border-[#232529]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="opacity-70 text-[9px]">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8f98]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or granule..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141517] border border-[#232529] text-xs font-mono text-white placeholder-[#525660] focus:border-[#5e6ad2] outline-none"
              />
            </div>

            {/* Thumbnail Patch Cards List */}
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {isLoadingPatches ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#8a8f98]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" />
                  <span className="text-xs font-mono">Loading real Sentinel-2 patches...</span>
                </div>
              ) : patches.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8a8f98] font-mono">
                  No patches found matching query.
                </div>
              ) : (
                patches.map((p) => {
                  const isSelected = selectedSampleId === p.id || selectedSampleId === p.stem;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedSampleId(p.id)}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#5e6ad2] bg-[#5e6ad2]/15 text-white shadow-sm'
                          : 'border-[#232529] bg-[#141517] text-[#8a8f98] hover:text-white hover:border-[#3e424b]'
                      }`}
                    >
                      {/* Real Thumbnail Preview */}
                      <div className="w-12 h-12 rounded bg-[#0a0b0d] border border-[#232529] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#1c1d20] flex items-center justify-center text-[9px] text-[#525660]">NPY</div>
                        )}
                      </div>

                      {/* Patch Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate flex items-center justify-between">
                          <span className="truncate">{p.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#5e6ad2] flex-shrink-0 ml-1" />}
                        </div>
                        <div className="text-[10px] text-[#8a8f98] font-mono truncate">{p.id}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#1c1d20] text-emerald-400 border border-[#2e3138]">
                            {p.category}
                          </span>
                          <span className="text-[9px] font-mono text-[#62666d]">10m → 2.5m</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Multi-Format Custom Ingestion Dropzone */
          <div className="flex flex-col gap-2">
            <MultiFormatDropzone 
              onFileSelected={(file) => {
                setCustomFile(file);
                setCustomPath(file.name);
              }}
              customPath={customPath}
              setCustomPath={setCustomPath}
            />
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[#232529]" />

        {/* Spectral Band Mode: True Color RGB vs NIR Color Infrared */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
            <span>Spectral Composite:</span>
            <span className="text-violet-400 font-semibold">{colorMode.toUpperCase()}</span>
          </label>
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#141517] border border-[#232529]">
            <button
              onClick={() => setColorMode('rgb')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                colorMode === 'rgb'
                  ? 'bg-[#232529] text-white shadow-sm font-semibold'
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
                  ? 'bg-[#232529] text-violet-300 shadow-sm font-semibold'
                  : 'text-[#8a8f98] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>NIR False Color</span>
            </button>
          </div>
        </div>

        {/* Continuous Scale Factor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-[#8a8f98] flex items-center justify-between">
            <span>Super-Resolution Scale:</span>
            <span className="text-emerald-400 font-semibold">{scale}x Continuous</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[2, 3, 4, 8].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`py-1 rounded-md text-xs font-mono font-semibold transition-all border ${
                  scale === s
                    ? 'border-[#5e6ad2] bg-[#5e6ad2]/20 text-white shadow-sm'
                    : 'border-[#232529] bg-[#141517] text-[#8a8f98] hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Seamless 2D Hann-Window Sliding Tiling Engine */}
        <div className="flex flex-col gap-2 p-2.5 rounded-lg border border-[#232529] bg-[#141517]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#5e6ad2]" />
              Seamless Sliding Tiling
            </span>
            <input 
              type="checkbox"
              checked={useTiling}
              onChange={(e) => setUseTiling(e.target.checked)}
              className="accent-[#5e6ad2] cursor-pointer w-4 h-4 rounded"
            />
          </div>

          {useTiling && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#232529] animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8f98]">
                <span>Tile Window Size:</span>
                <span className="text-white font-semibold">{tileSize}px</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[64, 128, 256].map((ts) => (
                  <button
                    key={ts}
                    onClick={() => setTileSize(ts)}
                    className={`py-0.5 rounded text-[10px] font-mono border ${
                      tileSize === ts
                        ? 'border-[#5e6ad2] bg-[#5e6ad2]/20 text-white font-semibold'
                        : 'border-[#232529] bg-[#1c1d20] text-[#8a8f98]'
                    }`}
                  >
                    {ts}px
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8f98] mt-1">
                <span>Tile Border Overlap:</span>
                <span className="text-white font-semibold">{overlap}px</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[16, 32, 64].map((ov) => (
                  <button
                    key={ov}
                    onClick={() => setOverlap(ov)}
                    className={`py-0.5 rounded text-[10px] font-mono border ${
                      overlap === ov
                        ? 'border-[#5e6ad2] bg-[#5e6ad2]/20 text-white font-semibold'
                        : 'border-[#232529] bg-[#1c1d20] text-[#8a8f98]'
                    }`}
                  >
                    {ov}px
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="p-3 border-t border-[#232529] bg-[#141517]">
        <button
          onClick={onRunInference}
          disabled={isInferring}
          className="w-full py-2.5 rounded-lg bg-[#5e6ad2] hover:bg-[#6e7be0] disabled:bg-[#32343c] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-linear-glow"
        >
          {isInferring ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Synthesizing HAT-Light SR...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Run Super-Resolution</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
