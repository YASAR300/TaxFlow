'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

/**
 * AdditionalCharges component for adding shipping, packing, handling fees and overall discounts.
 * 
 * Props:
 * - charges (object): Current state of additional charges
 * - onChange (function): Callback when a charge field changes (field, value)
 * - totals (object): Totals calculated from calculateInvoiceTotals
 */
export default function AdditionalCharges({ charges = {}, onChange, totals = {} }) {
  // Graceful fallback destructuring
  const shippingCharges = charges.shippingCharges ?? 0;
  const packagingCharges = charges.packagingCharges ?? 0;
  const otherCharges = charges.otherCharges ?? 0;
  const shippingGstRate = charges.shippingGstRate ?? 0;
  const packagingGstRate = charges.packagingGstRate ?? 0;
  const otherGstRate = charges.otherGstRate ?? 0;
  const overallDiscountType = charges.overallDiscountType ?? 'flat';
  const overallDiscount = charges.overallDiscount ?? 0;

  const subTotal = totals.subTotal ?? 0;
  const isPercent = overallDiscountType === 'percent';
  const discountVal = parseFloat(overallDiscount) || 0;

  // Live calculations
  const shippingGst = shippingGstRate > 0 ? parseFloat(shippingCharges) * 0.18 : 0;
  const packagingGst = packagingGstRate > 0 ? parseFloat(packagingCharges) * 0.18 : 0;
  const otherGst = otherGstRate > 0 ? parseFloat(otherCharges) * 0.18 : 0;

  let calculatedDiscount = 0;
  if (isPercent) {
    // Note: If totals has taxableAmount before overall discount, we use that or fallback to subTotal
    const baseForDiscount = totals.taxableAmount 
      ? (totals.taxableAmount + (totals.overallDiscountAmount || 0)) 
      : subTotal;
    calculatedDiscount = (baseForDiscount * discountVal) / 100;
  } else {
    calculatedDiscount = discountVal;
  }

  // Live validations
  let discountError = '';
  if (isPercent && discountVal > 100) {
    discountError = 'Discount percentage cannot exceed 100%';
  } else if (!isPercent && discountVal > subTotal) {
    discountError = `Flat discount cannot exceed subtotal (₹${subTotal.toLocaleString('en-IN')})`;
  }

  const handleChargeChange = (field, valString) => {
    const parsed = valString === '' ? '' : Math.max(0, parseFloat(valString) || 0);
    onChange(field, parsed);
  };

  const handleDiscountChange = (valString) => {
    const parsed = valString === '' ? '' : Math.max(0, parseFloat(valString) || 0);
    onChange('overallDiscount', parsed);
  };

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2]">
          <Plus size={16} className="text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            Additional Charges & Discounts
          </h2>
        </div>
      </div>

      {/* Charge Rows */}
      <div className="flex flex-col gap-5">
        {/* Row 1: Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-[#2a2a2a]/30 pb-4">
          <div className="md:col-span-4 flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[#e2e8f0]">Shipping / Freight</span>
            <span className="text-[11px] text-[#666]">Charges for logistics and delivery</span>
          </div>
          <div className="md:col-span-4 relative rounded-lg flex items-center bg-[#1a1a1a] border border-[#2a2a2a] focus-within:border-[#5e6ad2] focus-within:ring-1 focus-within:ring-[#5e6ad2] transition-all">
            <span className="pl-3 text-[#666] select-none text-[13px]">₹</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={shippingCharges === 0 ? '' : shippingCharges}
              onChange={(e) => handleChargeChange('shippingCharges', e.target.value)}
              className="w-full bg-transparent pl-1.5 pr-3 py-2 text-[13px] text-[#e2e8f0] focus:outline-none placeholder-[#444]"
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6">
            <Toggle
              checked={shippingGstRate === 18}
              onChange={(checked) => onChange('shippingGstRate', checked ? 18 : 0)}
              label="Taxable"
              description="Add 18% GST"
            />
            {shippingGstRate === 18 && shippingCharges > 0 && (
              <span className="text-slate-400 text-xs font-medium whitespace-nowrap">
                + ₹{shippingGst.toFixed(2)} GST
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Packing */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-[#2a2a2a]/30 pb-4">
          <div className="md:col-span-4 flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[#e2e8f0]">Packing Charges</span>
            <span className="text-[11px] text-[#666]">Packaging materials and handling</span>
          </div>
          <div className="md:col-span-4 relative rounded-lg flex items-center bg-[#1a1a1a] border border-[#2a2a2a] focus-within:border-[#5e6ad2] focus-within:ring-1 focus-within:ring-[#5e6ad2] transition-all">
            <span className="pl-3 text-[#666] select-none text-[13px]">₹</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={packagingCharges === 0 ? '' : packagingCharges}
              onChange={(e) => handleChargeChange('packagingCharges', e.target.value)}
              className="w-full bg-transparent pl-1.5 pr-3 py-2 text-[13px] text-[#e2e8f0] focus:outline-none placeholder-[#444]"
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6">
            <Toggle
              checked={packagingGstRate === 18}
              onChange={(checked) => onChange('packagingGstRate', checked ? 18 : 0)}
              label="Taxable"
              description="Add 18% GST"
            />
            {packagingGstRate === 18 && packagingCharges > 0 && (
              <span className="text-slate-400 text-xs font-medium whitespace-nowrap">
                + ₹{packagingGst.toFixed(2)} GST
              </span>
            )}
          </div>
        </div>

        {/* Row 3: Handling */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[#e2e8f0]">Handling Charges</span>
            <span className="text-[11px] text-[#666]">Other service fees and processing</span>
          </div>
          <div className="md:col-span-4 relative rounded-lg flex items-center bg-[#1a1a1a] border border-[#2a2a2a] focus-within:border-[#5e6ad2] focus-within:ring-1 focus-within:ring-[#5e6ad2] transition-all">
            <span className="pl-3 text-[#666] select-none text-[13px]">₹</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={otherCharges === 0 ? '' : otherCharges}
              onChange={(e) => handleChargeChange('otherCharges', e.target.value)}
              className="w-full bg-transparent pl-1.5 pr-3 py-2 text-[13px] text-[#e2e8f0] focus:outline-none placeholder-[#444]"
            />
          </div>
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6">
            <Toggle
              checked={otherGstRate === 18}
              onChange={(checked) => onChange('otherGstRate', checked ? 18 : 0)}
              label="Taxable"
              description="Add 18% GST"
            />
            {otherGstRate === 18 && otherCharges > 0 && (
              <span className="text-slate-400 text-xs font-medium whitespace-nowrap">
                + ₹{otherGst.toFixed(2)} GST
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overall Discount Section */}
      <div className="border-t border-[#2a2a2a] pt-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-[#888] uppercase tracking-wider">
              Overall Invoice Discount
            </span>
            <span className="text-[11px] text-[#666]">
              Apply discount to subtotal of taxable amount
            </span>
          </div>

          {/* Toggle Type Buttons */}
          <div className="flex rounded-lg bg-[#1a1a1a] p-1 border border-[#2a2a2a] w-fit">
            <button
              type="button"
              className={`px-3 py-1.5 text-[11px] rounded-md transition-all font-semibold ${
                overallDiscountType === 'flat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#888] hover:text-[#ccc]'
              }`}
              onClick={() => {
                onChange('overallDiscountType', 'flat');
                // Optional: clamp discount if switching types
                if (overallDiscount > subTotal) {
                  onChange('overallDiscount', subTotal);
                }
              }}
            >
              ₹ Flat
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-[11px] rounded-md transition-all font-semibold ${
                overallDiscountType === 'percent'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#888] hover:text-[#ccc]'
              }`}
              onClick={() => {
                onChange('overallDiscountType', 'percent');
                if (overallDiscount > 100) {
                  onChange('overallDiscount', 100);
                }
              }}
            >
              % Percent
            </button>
          </div>
        </div>

        {/* Input and Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-1.5">
            <div className="relative rounded-lg flex items-center bg-[#1a1a1a] border border-[#2a2a2a] focus-within:border-[#5e6ad2] focus-within:ring-1 focus-within:ring-[#5e6ad2] transition-all">
              {!isPercent && <span className="pl-3 text-[#666] select-none text-[13px]">₹</span>}
              <input
                type="number"
                min="0"
                placeholder="0"
                value={overallDiscount === 0 ? '' : overallDiscount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className={`w-full bg-transparent pr-3 py-2 text-[13px] text-[#e2e8f0] focus:outline-none placeholder-[#444] ${
                  isPercent ? 'pl-3' : 'pl-1.5'
                }`}
              />
              {isPercent && <span className="pr-3 text-[#666] select-none text-[13px] font-semibold">%</span>}
            </div>

            {/* Error Message */}
            {discountError ? (
              <span className="text-[11px] font-semibold text-rose-500 mt-0.5">{discountError}</span>
            ) : (
              overallDiscount > 0 && (
                <span className="text-red-500 text-xs font-semibold mt-0.5">
                  = ₹{calculatedDiscount.toFixed(2)} off
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
