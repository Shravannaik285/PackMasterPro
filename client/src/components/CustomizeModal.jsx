import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';

/**
 * CustomizeModal:
 * Allows user to tweak dimensions, material grade, and quantity to recalculate the quotation.
 */
export default function CustomizeModal({
  isOpen,
  onClose,
  initialData,
  onApplyChanges,
}) {
  if (!isOpen) return null;

  const [length, setLength] = useState(initialData?.dimensions?.length || 20);
  const [width, setWidth] = useState(initialData?.dimensions?.width || 15);
  const [height, setHeight] = useState(initialData?.dimensions?.height || 8);
  const [quantity, setQuantity] = useState(initialData?.quantity || 500);
  const [materialGrade, setMaterialGrade] = useState(
    initialData?.materialGrade || '5-Ply Corrugated Cardboard'
  );
  const [customPrint, setCustomPrint] = useState(
    Boolean(initialData?.requirements?.customPrint)
  );

  const handleSave = () => {
    onApplyChanges({
      dimensions: {
        length: Number(length),
        width: Number(width),
        height: Number(height),
      },
      quantity: Number(quantity),
      materialGrade,
      requirements: {
        ...(initialData?.requirements || {}),
        customPrint,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Customize Packaging</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          
          {/* Dimensions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Dimensions (cm)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Length</span>
                <input
                  type="number"
                  min="1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Width</span>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Height</span>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Material Grade Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Material Grade
            </label>
            <select
              value={materialGrade}
              onChange={(e) => setMaterialGrade(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="3-Ply Standard Corrugated">3-Ply Standard Corrugated (Lightweight)</option>
              <option value="5-Ply Corrugated Cardboard">5-Ply Corrugated Cardboard (High Protection)</option>
              <option value="7-Ply Heavy Duty Board">7-Ply Heavy Duty Board (Industrial / Fragile)</option>
              <option value="Kraft Paper 180 GSM">Kraft Paper 180 GSM (Eco-Friendly)</option>
              <option value="Thermal Coated Adhesive Roll">Thermal Coated Adhesive Roll (Labels)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Order Quantity (Units)
            </label>
            <input
              type="number"
              min="50"
              step="50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Bulk discounts automatically apply at 500+ and 1000+ units.
            </p>
          </div>

          {/* Custom Branding Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={customPrint}
                onChange={(e) => setCustomPrint(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span>Include custom business logo & brand printing (+₹3/unit)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
          >
            <Check className="w-4 h-4" />
            Apply & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
