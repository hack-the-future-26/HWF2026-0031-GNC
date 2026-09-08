import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import SidebarControls from './components/SidebarControls.jsx';
import LinearComparisonSlider from './components/LinearComparisonSlider.jsx';
import DifferenceHeatmap from './components/DifferenceHeatmap.jsx';
import ExportModal from './components/ExportModal.jsx';
import { inferenceService, CURATED_TEST_SAMPLES } from './services/inferenceService.js';

export default function App() {
  const [activeMode, setActiveMode] = useState('slider'); // 'slider' | 'sidebyside' | 'diff'
  const [inputMode, setInputMode] = useState('curated'); // 'curated' | 'custom'
  const [selectedSampleId, setSelectedSampleId] = useState('patch_airport_001428');
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

  // Check health and run initial zero-shot inference on mount
  useEffect(() => {
    inferenceService.checkHealth().then(setBackendStatus);
    executeInference();
  }, []);

  const executeInference = async () => {
    setIsInferring(true);
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
    setIsInferring(false);
  };

  const currentSample = CURATED_TEST_SAMPLES.find(s => s.id === selectedSampleId) || CURATED_TEST_SAMPLES[0];

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
          selectedSampleId={selectedSampleId}
          setSelectedSampleId={(id) => {
            setSelectedSampleId(id);
            setTimeout(() => executeInference(), 50);
          }}
          customPath={customPath}
          setCustomPath={setCustomPath}
          scale={scale}
          setScale={(s) => {
            setScale(s);
            setTimeout(() => executeInference(), 50);
          }}
          useTiling={useTiling}
          setUseTiling={setUseTiling}
          tileSize={tileSize}
          setTileSize={setTileSize}
          overlap={overlap}
          setOverlap={setOverlap}
          colorMode={colorMode}
          setColorMode={(m) => {
            setColorMode(m);
            setTimeout(() => executeInference(), 50);
          }}
          onRunInference={executeInference}
          isInferring={isInferring}
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
                  <div className="h-9 border-b border-[#232529] px-3 flex items-center text-xs font-mono text-[#8a8f98]">
                    10m Bicubic Low-Resolution
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <img src={result.images.bicubic} alt="Bicubic LR" className="max-h-full object-contain rounded" />
                  </div>
                </div>
                <div className="flex flex-col bg-[#0f1011] rounded-xl border border-[#232529] overflow-hidden">
                  <div className="h-9 border-b border-[#232529] px-3 flex items-center text-xs font-mono text-emerald-400">
                    2.5m HAT-Light Super-Resolved (+6.75 dB)
                  </div>
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <img src={result.images.superResolved} alt="Super-Resolved" className="max-h-full object-contain rounded" />
                  </div>
                </div>
              </div>
            ) : (
              <LinearComparisonSlider 
                beforeImage={result.images.bicubic}
                afterImage={result.images.superResolved}
                beforeLabel={`Bicubic Input (${colorMode.toUpperCase()})`}
                afterLabel={`HAT-Light SR (${colorMode.toUpperCase()})`}
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
