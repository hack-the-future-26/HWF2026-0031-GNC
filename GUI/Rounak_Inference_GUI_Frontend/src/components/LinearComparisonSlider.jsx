import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Maximize2, Split } from 'lucide-react';

export default function LinearComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = '10m Bicubic LR',
  afterLabel = '2.5m HAT-Light SR',
  metrics = null,
  scale = 4.0
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const containerRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 });

  const updateSlider = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.slider-handle')) {
      setIsDragging(true);
    } else if (zoom > 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging) {
        updateSlider(e.clientX);
      } else if (isPanning && zoom > 1) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y
        });
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isPanning, zoom, updateSlider]);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPos(50);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#08090a] rounded-xl border border-[#232529] overflow-hidden select-none">
      {/* Viewport Toolbar */}
      <div className="h-10 border-b border-[#232529] bg-[#0f1011] px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#8a8f98]">Scale Factor:</span>
          <span className="px-1.5 py-0.5 rounded bg-[#1c1d20] text-emerald-400 font-semibold">{scale}x</span>
          {metrics && (
            <>
              <span className="text-[#3e424b]">•</span>
              <span className="text-[#8a8f98]">PSNR:</span>
              <span className="text-white font-semibold">{metrics.psnr} dB</span>
              <span className="text-[#3e424b]">•</span>
              <span className="text-[#8a8f98]">SSIM:</span>
              <span className="text-white font-semibold">{metrics.ssim}</span>
            </>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setZoom(z => Math.max(1, +(z - 0.5).toFixed(1)))}
            className="p-1 text-[#8a8f98] hover:text-white hover:bg-[#1c1d20] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-[#8a8f98] px-1">{zoom.toFixed(1)}x</span>
          <button 
            onClick={() => setZoom(z => Math.min(6, +(z + 0.5).toFixed(1)))}
            className="p-1 text-[#8a8f98] hover:text-white hover:bg-[#1c1d20] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={resetView}
            className="p-1 text-[#8a8f98] hover:text-white hover:bg-[#1c1d20] rounded transition-colors ml-1"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={`relative flex-1 overflow-hidden flex items-center justify-center ${
          zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <div 
          className="relative w-full h-full max-w-[900px] max-h-[600px] aspect-square transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
          }}
        >
          {/* After Image (Super-Resolved - Background Layer) */}
          <img 
            src={afterImage} 
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Before Image (Bicubic - Clipped Top Layer) */}
          <div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          >
            <img 
              src={beforeImage} 
              alt={beforeLabel}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Draggable Divider Line & Linear Handle */}
          <div 
            className="absolute top-0 bottom-0 z-10 slider-handle"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.6)] cursor-ew-resize">
              {/* Center Pill Button */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#0f1011] border border-[#3e424b] shadow-linear-card flex items-center justify-center hover:scale-110 active:scale-95 transition-transform text-[#f7f8f8]">
                <Split className="w-3.5 h-3.5 text-[#5e6ad2]" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Edge Badges */}
        <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-md bg-[#0f1011]/80 backdrop-blur-md border border-[#232529] text-xs font-mono text-[#8a8f98] pointer-events-none">
          {beforeLabel}
        </div>
        <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-md bg-[#0f1011]/80 backdrop-blur-md border border-[#232529] text-xs font-mono text-emerald-400 pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {afterLabel}
        </div>
      </div>
    </div>
  );
}
