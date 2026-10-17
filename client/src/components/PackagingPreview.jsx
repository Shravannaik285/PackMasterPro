import React from 'react';
import { Box, Layers, ShieldCheck, Tag } from 'lucide-react';

/**
 * PackagingPreview:
 * Visual cardboard box / packaging representation component.
 * Recreates the "Product Preview" card shown on Screen 3 of the reference image.
 */
export default function PackagingPreview({
  packagingType = 'Corrugated Box',
  dimensions = { length: 20, width: 15, height: 8 },
  material = '5-Ply Corrugated Cardboard',
}) {
  const l = dimensions.length || 20;
  const w = dimensions.width || 15;
  const h = dimensions.height || 8;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between text-center h-full min-h-[360px]">
      <div className="w-full flex justify-between items-center text-xs font-medium text-gray-400 mb-2">
        <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-semibold">
          <Box className="w-3.5 h-3.5" />
          {packagingType}
        </span>
        <span>Preview Mode</span>
      </div>

      {/* Visual Render Box matching reference image */}
      <div className="my-auto py-4 relative flex items-center justify-center w-full">
        {packagingType === 'Paper Bag' ? (
          // Paper bag illustration
          <div className="relative group cursor-pointer">
            <svg className="w-44 h-48 drop-shadow-md transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 180" fill="none">
              {/* Bag Handles */}
              <path d="M60 45 C60 15, 100 15, 100 45" stroke="#92400E" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Bag Body */}
              <path d="M40 45 L120 45 L130 165 L30 165 Z" fill="#D97706" fillOpacity="0.85" />
              <path d="M40 45 L50 165 L30 165 Z" fill="#B45309" fillOpacity="0.9" />
              {/* Fold lines */}
              <line x1="80" y1="45" x2="80" y2="165" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            </svg>
          </div>
        ) : packagingType === 'Labels' ? (
          // Label Roll illustration
          <div className="relative group cursor-pointer">
            <svg className="w-44 h-44 drop-shadow-md transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 160" fill="none">
              {/* Roll Body */}
              <ellipse cx="80" cy="80" rx="60" ry="40" fill="#E2E8F0" />
              <ellipse cx="80" cy="80" rx="30" ry="20" fill="#94A3B8" />
              <path d="M20 80 C20 102 47 120 80 120 C113 120 140 102 140 80 L140 110 C140 132 113 150 80 150 C47 150 20 132 20 110 Z" fill="#CBD5E1" />
              {/* Label Strip */}
              <path d="M110 95 L150 110 L150 125 L110 110 Z" fill="#22C55E" fillOpacity="0.8" />
            </svg>
          </div>
        ) : (
          // Isometric 3D Cardboard Box (Corrugated / Mailing)
          <div className="relative group cursor-pointer">
            <svg
              className="w-48 h-48 drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Face */}
              <polygon points="25,75 100,120 100,185 25,140" fill="#C28445" />
              {/* Right Face */}
              <polygon points="100,120 175,75 175,140 100,185" fill="#A86F38" />
              {/* Top Face */}
              <polygon points="100,30 175,75 100,120 25,75" fill="#DE9B52" />
              {/* Flap details / tape */}
              <line x1="100" y1="30" x2="100" y2="120" stroke="#B87739" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="25" y1="75" x2="175" y2="75" stroke="#B87739" strokeWidth="1.5" />
              {/* Box edge highlight */}
              <line x1="100" y1="120" x2="100" y2="185" stroke="#925F30" strokeWidth="2" />
            </svg>

            {/* Dimension badges */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-amber-200 text-amber-900 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              {l} × {w} × {h} cm
            </div>
          </div>
        )}
      </div>

      {/* Description below preview */}
      <div className="w-full pt-4 border-t border-gray-50">
        <h4 className="text-sm font-semibold text-gray-900">Product Preview</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
          Sample 3D representation based on your input dimensions and material grade.
        </p>
      </div>
    </div>
  );
}
