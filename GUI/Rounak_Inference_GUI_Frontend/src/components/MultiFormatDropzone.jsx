import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCode, 
  FolderOpen, 
  FileText, 
  Sparkles, 
  AlertCircle,
  FileCheck2,
  Check
} from 'lucide-react';

export default function MultiFormatDropzone({ onFileSelected, customPath, setCustomPath }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('tif');

  const supportedFormats = [
    { ext: 'tif', label: 'GeoTIFF (.tif, .tiff)', badge: '4-Band 10m' },
    { ext: 'npy', label: 'NumPy Array (.npy)', badge: '(4, 128, 128)' },
    { ext: 'png', label: 'PNG Image (.png)', badge: 'RGB' },
    { ext: 'jpg', label: 'JPEG Image (.jpg, .jpeg)', badge: 'Visual' },
    { ext: 'jp2', label: 'JPEG 2000 (.jp2)', badge: 'Sentinel-2 L2A' }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setCustomPath(file.name);
      onFileSelected(file);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop Target Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging 
            ? 'border-[#5e6ad2] bg-[#5e6ad2]/10 scale-[0.99]' 
            : 'border-[#232529] hover:border-[#3e424b] bg-[#141517]/60'
        }`}
      >
        <input 
          type="file" 
          accept=".tif,.tiff,.npy,.png,.jpg,.jpeg,.jp2"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setCustomPath(e.target.files[0].name);
              onFileSelected(e.target.files[0]);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <div className="w-10 h-10 rounded-full bg-[#1c1d20] border border-[#232529] flex items-center justify-center mb-2.5 text-[#5e6ad2]">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-white mb-1">
          Drag & drop satellite scene or click to browse
        </p>
        <p className="text-[11px] text-[#8a8f98]">
          Supports GeoTIFF, NumPy 4-channel arrays, JP2, and standard images
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
          {supportedFormats.map((f) => (
            <span 
              key={f.ext}
              className="px-2 py-0.5 rounded border border-[#232529] bg-[#0f1011] text-[10px] font-mono text-[#8a8f98]"
            >
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Manual Path Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono text-[#8a8f98]">
          Or specify absolute filesystem path:
        </label>
        <div className="flex items-center gap-1.5">
          <input 
            type="text" 
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="e.g. D:/Projects/Dataset/test_scene.tif"
            className="flex-1 bg-[#141517] border border-[#232529] focus:border-[#5e6ad2] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#3e424b] outline-none transition-colors"
          />
          <button 
            onClick={() => onFileSelected({ name: customPath })}
            className="px-3 py-2 rounded-lg bg-[#232529] hover:bg-[#2e3138] text-xs font-medium text-white transition-colors flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Load</span>
          </button>
        </div>
      </div>
    </div>
  );
}
