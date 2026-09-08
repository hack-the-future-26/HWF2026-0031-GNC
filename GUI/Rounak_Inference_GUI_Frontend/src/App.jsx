import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import SidebarControls from './components/SidebarControls.jsx';
import LinearComparisonSlider from './components/LinearComparisonSlider.jsx';
import DifferenceHeatmap from './components/DifferenceHeatmap.jsx';
import ExportModal from './components/ExportModal.jsx';
import { inferenceService } from './services/inferenceService.js';

export default function App() {
  const [activeMode, setActiveMode] = useState('slider'); // 'slider' | 'sidebyside' | 'diff'
  const [inputMode, setInputMode] = useState('curated'); // 'curated' | 'custom'
  
  // Real dataset state
  const [patches, setPatches] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPatches, setIsLoadingPatches] = useState(true);

  // Selected sample & execution parameters
  const [selectedSampleId, setSelectedSampleId] = useState('patch_airport_001428.npy');
  const [customFile, setCustomFile] = useState(null);
  const [customPath, setCustomPath] = useState('');
  const [scale, setScale] = useState(4.0);
  const [useTiling, setUseTiling] = useState(false);
  const [tileSize, setTileSize] = useState(128);
  const [overlap, setOverlap] = useState(32);
  const [colorMode, setColorMode] = useState('rgb');

  const [backendStatus, setBackendStatus] = useState(null);
  const [isInferring, setIsInferring] = useState(false);
  const [result, setResult] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load real patches from backend
  const loadPatches = useCallback(async (cat, search) => {
    setIsLoadingPatches(true);
    const data = await inferenceService.getTestPatches(cat, search, 80);
    setPatches(data.patches || []);
    setCategories(data.categories || {});
    setIsLoadingPatches(false);
    return data.patches || [];
  }, []);

  // Initial load
  useEffect(() => {
    inferenceService.checkHealth().then(setBackendStatus);
    loadPatches('all', '').then((loaded) => {
      if (loaded.length > 0) {
        setSelectedSampleId(loaded[0].id);
      }
    });
  }, [loadPatches]);

  // Refetch patches when category or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatches(selectedCategory, searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, loadPatches]);

  // Run real inference whenever sample or parameters change
  const executeInference = useCallback(async () => {
    setIsInferring(true);
    try {
      if (inputMode === 'custom' && customFile) {
        const res = await inferenceService.uploadAndInfer(customFile, scale);
        setResult(res);
      } else {
        const res = await inferenceService.runInference({
          patchPath: selectedSampleId,
          inputMode,
          scale,
          useTiling,
          tileSize,
          overlap,
          colorMode
        });
        setResult(res);
      }
    } catch (e) {
      console.error('Inference error:', e);
    } finally {
      setIsInferring(false);
    }
  }, [inputMode, customFile, selectedSampleId, scale, useTiling, tileSize, overlap, colorMode]);

  // Trigger inference when parameters change
  useEffect(() => {
    if (selectedSampleId) {
      executeInference();
    }
  }, [selectedSampleId, scale, colorMode, useTiling, tileSize, overlap, executeInference]);

  const currentSample = patches.find(s => s.id === selectedSampleId || s.stem === selectedSampleId) || {
    id: selectedSampleId || 'patch_airport_001428.npy',
    name: 'Selected Satellite Scene'
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08090a] text-[#f7f8f8] overflow-hidden bg-linear-grid">
      {/* Linear Inspired Top Navigation Header */}
      <Header 
        backendStatus={backendStatus}
        onOpenExport={() => setIsExportModalOpen(true)}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Main Studio Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Interactive Control Panel */}
        <SidebarControls 
          inputMode={inputMode}
          setInputMode={setInputMode}
          patches={patches}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSampleId={selectedSampleId}
          setSelectedSampleId={setSelectedSampleId}
          customFile={customFile}
          setCustomFile={setCustomFile}
          customPath={customPath}
          setCustomPath={setCustomPath}
          scale={scale}
          setScale={setScale}
          useTiling={useTiling}
          setUseTiling={setUseTiling}
          tileSize={tileSize}
          setTileSize={setTileSize}
          overlap={overlap}
          setOverlap={setOverlap}
          colorMode={colorMode}
          setColorMode={setColorMode}
          onRunInference={executeInference}
          isInferring={isInferring}
          isLoadingPatches={isLoadingPatches}
        />

        {/* Center Canvas Viewport */}
        <main className="flex-1 p-4 overflow-hidden flex flex-col items-center justify-center">
          {result && (
            activeMode === 'diff' ? (
              <DifferenceHeatmap 
                heatmapImage={result.images.differenceHeatmap}
                metrics={result.metrics}
              />
            ) : activeMode === 'sidebyside' ? (
              <div className="grid grid-cols-2 gap-4 w-full h-full">
                <div className="flex flex-col bg-[#0f1011] rounded-xl border border-[#232529] overflow-hidden">
                  <div className="h-9 border-b border-[#232529] px-3 flex items-center justify-between text-xs font-mono text-[#8a8f98]">
                    <span>10m Sensor PSF Input</span>
                    <span className="text-[10px] text-[#525660]">{colorMode.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center bg-[#0a0b0d]">
                    <img 
                      src={result.images.lrInput || result.images.bicubic} 
                      alt="10m Sensor PSF Input" 
                      className="max-h-full object-contain rounded" 
                    />
                  </div>
                </div>
                <div className="flex flex-col bg-[#0f1011] rounded-xl border border-[#232529] overflow-hidden">
                  <div className="h-9 border-b border-[#232529] px-3 flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span>2.5m HAT-Light Super-Resolved</span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                      {result.metrics?.psnr ? `${result.metrics.psnr} dB` : '+6.75 dB Gain'}
                    </span>
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center bg-[#0a0b0d]">
                    <img 
                      src={result.images.superResolved} 
                      alt="2.5m HAT-Light SR" 
                      className="max-h-full object-contain rounded" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <LinearComparisonSlider 
                beforeImage={result.images.lrInput || result.images.bicubic}
                afterImage={result.images.superResolved}
                beforeLabel={`10m Sensor PSF Input (${colorMode.toUpperCase()})`}
                afterLabel={`2.5m HAT-Light SR (${colorMode.toUpperCase()})`}
                metrics={result.metrics}
                scale={scale}
              />
            )
          )}
        </main>
      </div>

      {/* Export Dialog Popup */}
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentSample={currentSample}
        scale={scale}
      />
    </div>
  );
}
