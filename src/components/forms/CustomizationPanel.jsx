'use client';

import React, { useRef } from 'react';
import { Palette, Plus } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

/**
 * CustomizationPanel component for adjusting invoice styling, templates, accent colors, and toggles.
 * 
 * Props:
 * - customization (object): Styling properties
 * - onChange (function): Callback when a customization property changes (field, value)
 */
export default function CustomizationPanel({ customization = {}, onChange }) {
  // Graceful fallback destructuring
  const accentColor = customization.accentColor ?? '#1a56db';
  const template = customization.template ?? 'classic';
  const fontFamily = customization.fontFamily ?? 'Inter';

  // Toggle values fallback
  const showLogo = customization.showLogo ?? true;
  const showQrCode = customization.showQrCode ?? true;
  const showBankDetails = customization.showBankDetails ?? true;
  const showSignature = customization.showSignature ?? true;
  const showWatermark = customization.showWatermark ?? false;
  const showItemSerialNumbers = customization.showItemSerialNumbers ?? true;

  const colorInputRef = useRef(null);

  const presets = [
    '#1a56db', // Blue
    '#059669', // Emerald
    '#dc2626', // Red
    '#7c3aed', // Violet
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#1f2937', // Slate
  ];

  const isPresetSelected = presets.includes(accentColor);

  const fontOptions = [
    { value: 'Arial', label: 'Professional' },
    { value: 'Inter', label: 'Modern' },
    { value: 'serif', label: 'Classic' },
  ];

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2]">
          <Palette size={16} className="text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            Invoice Appearance
          </h2>
        </div>
      </div>

      {/* Color Theme Selector */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
          Accent Color
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {presets.map((color) => {
            const isSelected = accentColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange('accentColor', color)}
                className={`w-7 h-7 rounded-full cursor-pointer transition-all hover:scale-105 border border-[#222]`}
                style={{
                  backgroundColor: color,
                  boxShadow: isSelected ? `0 0 0 2px #111, 0 0 0 4px #2563eb` : 'none',
                }}
                title={color}
              />
            );
          })}
          
          {/* Custom Color Input Swatch */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className={`w-7 h-7 rounded-full cursor-pointer transition-all flex items-center justify-center border border-dashed border-[#444] bg-[#1a1a1a] hover:bg-[#222]`}
              style={{
                boxShadow: !isPresetSelected && accentColor
                  ? `0 0 0 2px #111, 0 0 0 4px #2563eb`
                  : 'none',
                backgroundColor: !isPresetSelected ? accentColor : undefined,
              }}
              title="Custom Color"
            >
              <Plus size={14} className={!isPresetSelected ? 'text-white' : 'text-[#888]'} />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={accentColor}
              onChange={(e) => onChange('accentColor', e.target.value)}
              className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
          Invoice Template
        </span>
        <div className="grid grid-cols-3 gap-3">
          
          {/* Card 1: Classic */}
          <button
            type="button"
            onClick={() => onChange('template', 'classic')}
            className={`border-2 rounded-lg p-2 flex flex-col gap-2 cursor-pointer transition-all text-left ${
              template === 'classic'
                ? 'border-blue-600 bg-[#141414]'
                : 'border-[#2a2a2a] bg-[#111111] hover:border-[#333]'
            }`}
          >
            {/* Thumbnail: Logo left, details right */}
            <div className="w-full h-14 bg-[#181818] rounded border border-[#2a2a2a]/50 p-2 flex items-start justify-between">
              <div className="w-4 h-4 bg-[#333] rounded-[2px]" />
              <div className="flex flex-col gap-1 items-end w-12">
                <div className="w-full h-1 bg-[#333] rounded" />
                <div className="w-8 h-1 bg-[#333] rounded" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#ccc] text-center w-full block">Classic</span>
          </button>

          {/* Card 2: Modern */}
          <button
            type="button"
            onClick={() => onChange('template', 'modern')}
            className={`border-2 rounded-lg p-2 flex flex-col gap-2 cursor-pointer transition-all text-left ${
              template === 'modern'
                ? 'border-blue-600 bg-[#141414]'
                : 'border-[#2a2a2a] bg-[#111111] hover:border-[#333]'
            }`}
          >
            {/* Thumbnail: Colored full-width header band */}
            <div className="w-full h-14 bg-[#181818] rounded border border-[#2a2a2a]/50 flex flex-col overflow-hidden">
              <div className="w-full h-3 bg-blue-600" />
              <div className="p-2 flex justify-between items-start">
                <div className="w-3 h-3 bg-[#333] rounded-[2px]" />
                <div className="w-6 h-1 bg-[#333] rounded" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#ccc] text-center w-full block">Modern</span>
          </button>

          {/* Card 3: Minimal */}
          <button
            type="button"
            onClick={() => onChange('template', 'minimal')}
            className={`border-2 rounded-lg p-2 flex flex-col gap-2 cursor-pointer transition-all text-left ${
              template === 'minimal'
                ? 'border-blue-600 bg-[#141414]'
                : 'border-[#2a2a2a] bg-[#111111] hover:border-[#333]'
            }`}
          >
            {/* Thumbnail: Clean borderless layout */}
            <div className="w-full h-14 bg-[#181818] rounded border border-[#2a2a2a]/50 p-2 flex flex-col justify-between">
              <div className="flex justify-between w-full">
                <div className="w-3 h-1 bg-[#333] rounded" />
                <div className="w-5 h-1 bg-[#333] rounded" />
              </div>
              <div className="w-full h-1 bg-[#333] rounded" />
              <div className="flex justify-between w-full">
                <div className="w-4 h-1 bg-[#333] rounded" />
                <div className="w-2 h-1 bg-[#333] rounded" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#ccc] text-center w-full block">Minimal</span>
          </button>

        </div>
      </div>

      {/* Font Style Selector */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
          Font Style
        </span>
        <div className="flex gap-2">
          {fontOptions.map((opt) => {
            const isSelected = fontFamily === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('fontFamily', opt.value)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance Switches */}
      <div className="border-t border-[#2a2a2a] pt-6 flex flex-col gap-4">
        <span className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
          Appearance Settings
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Toggle
            checked={showLogo}
            onChange={(val) => onChange('showLogo', val)}
            label="Show Company Logo"
          />
          <Toggle
            checked={showQrCode}
            onChange={(val) => onChange('showQrCode', val)}
            label="Show QR Code on Invoice"
          />
          <Toggle
            checked={showBankDetails}
            onChange={(val) => onChange('showBankDetails', val)}
            label="Show Bank Details"
          />
          <Toggle
            checked={showSignature}
            onChange={(val) => onChange('showSignature', val)}
            label="Show Signature Line"
          />
          <Toggle
            checked={showWatermark}
            onChange={(val) => {
              onChange('showWatermark', val);
              // Also update watermark text if needed
              onChange('watermark', val ? 'ORIGINAL' : '');
            }}
            label="Show Duplicate/Original watermark"
          />
          <Toggle
            checked={showItemSerialNumbers}
            onChange={(val) => onChange('showItemSerialNumbers', val)}
            label="Show Item Serial Numbers"
          />
        </div>
      </div>

    </div>
  );
}
