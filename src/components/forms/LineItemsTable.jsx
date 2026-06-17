'use client';

import { useState, useEffect, useRef } from 'react';
import { GripVertical, Info, Trash2, Plus, AlignLeft, Trash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { calculateLineItem, calculateInvoiceTotals } from '@/utils/taxCalculations';
import { formatINR, numberToWords } from '@/utils/indianFormat';
import { DEFAULT_LINE_ITEM, DEFAULT_ADDITIONAL_CHARGES } from '@/constants/defaultValues';
import { UNIT_TYPES, GST_RATES } from '@/constants/gstData';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function LineItemsTable({
  items = [],
  taxMode = 'intrastate',
  onChange,
  additionalCharges = {}
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect screen size for responsive layouts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle local changes to fields inside an item
  const handleFieldChange = (itemId, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id !== itemId) return item;

      const updatedRawItem = { ...item, [field]: value };

      // Description-only rows bypass standard pricing calculation and have zero values
      if (updatedRawItem.isDescriptionOnly) {
        return {
          ...updatedRawItem,
          quantity: 0,
          rate: 0,
          discountPercent: 0,
          gstRate: 0,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          gstAmount: 0,
          totalAmount: 0,
        };
      }

      // Perform GST / taxable calculation
      return calculateLineItem(updatedRawItem, taxMode);
    });

    onChange(updatedItems);
  };

  // Keep mutable ref copies of items and onChange to avoid linter warnings and infinite render loops
  const itemsRef = useRef(items);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    itemsRef.current = items;
    onChangeRef.current = onChange;
  }, [items, onChange]);

  // Recalculate line items if taxMode changes externally
  useEffect(() => {
    if (!mounted || itemsRef.current.length === 0) return;

    const recalculated = itemsRef.current.map((item) => {
      if (item.isDescriptionOnly) return item;
      return calculateLineItem(item, taxMode);
    });

    // Check if values actually changed to prevent infinite rendering loop
    const hasChanged = recalculated.some((item, idx) => {
      const prev = itemsRef.current[idx];
      return (
        !prev ||
        item.taxableAmount !== prev.taxableAmount ||
        item.gstAmount !== prev.gstAmount ||
        item.totalAmount !== prev.totalAmount ||
        item.cgstAmount !== prev.cgstAmount ||
        item.igstAmount !== prev.igstAmount
      );
    });

    if (hasChanged) {
      onChangeRef.current(recalculated);
    }
  }, [taxMode, mounted]);

  // Drag and drop handler
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const itemsCopy = Array.from(items);
    const [reorderedItem] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, reorderedItem);

    // Re-index Sr No based on new sorting order
    const updatedItems = itemsCopy.map((item, idx) => ({
      ...item,
      srNo: idx + 1
    }));

    onChange(updatedItems);
  };

  // Add standard new line item
  const handleAddItem = () => {
    const newItem = {
      ...DEFAULT_LINE_ITEM(),
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      srNo: items.length + 1
    };
    onChange([...items, newItem]);
  };

  // Add description-only row (pricing fields disabled/hidden)
  const handleAddDescriptionRow = () => {
    const newItem = {
      ...DEFAULT_LINE_ITEM(),
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      isDescriptionOnly: true,
      description: '',
      srNo: items.length + 1,
      quantity: 0,
      rate: 0,
      discountPercent: 0,
      gstRate: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      gstAmount: 0,
      totalAmount: 0
    };
    onChange([...items, newItem]);
  };

  // Clear all items with confirmation
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all items? This will reset to a single default line item.')) {
      const resetItem = {
        ...DEFAULT_LINE_ITEM(),
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        srNo: 1
      };
      onChange([resetItem]);
    }
  };

  // Delete row handler
  const handleDeleteRow = (itemId) => {
    const filtered = items.filter((item) => item.id !== itemId);
    if (filtered.length === 0) {
      const resetItem = {
        ...DEFAULT_LINE_ITEM(),
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        srNo: 1
      };
      onChange([resetItem]);
    } else {
      const updated = filtered.map((item, idx) => ({
        ...item,
        srNo: idx + 1
      }));
      onChange(updated);
    }
  };

  // Fetch colors based on GST rate selection
  const getGstColorClass = (rate) => {
    switch (Number(rate)) {
      case 0: return 'text-slate-400 font-medium';
      case 5: return 'text-emerald-400 font-medium';
      case 12: return 'text-amber-400 font-medium';
      case 18: return 'text-orange-400 font-medium';
      case 28: return 'text-rose-400 font-medium';
      default: return 'text-[#e2e8f0]';
    }
  };

  // Totals calculations using helper
  const charges = { ...DEFAULT_ADDITIONAL_CHARGES, ...additionalCharges };
  const totals = calculateInvoiceTotals(items, charges, taxMode);

  if (!mounted) {
    return (
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-xs text-[#888]">
          <svg className="animate-spin h-4 w-4 text-[#5e6ad2]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading billing items...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {/* Desktop View */}
        {!isMobile && (
          <div className="overflow-x-auto border border-[#2a2a2a] rounded-xl bg-[#111111] shadow-sm">
            <table className="w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#141414] text-[#888] text-[10px] font-semibold uppercase tracking-wider border-b border-[#2a2a2a] select-none">
                  {/* Sticky drag-handle & Sr No columns */}
                  <th className="p-3 w-10 sticky left-0 bg-[#141414] border-b border-[#2a2a2a] z-20"></th>
                  <th className="p-3 w-12 sticky left-10 bg-[#141414] border-b border-[#2a2a2a] z-20 text-center">#</th>
                  <th className="p-3 min-w-[200px] sticky left-[52px] bg-[#141414] border-b border-[#2a2a2a] z-20">Description</th>
                  <th className="p-3 w-[110px] border-b border-[#2a2a2a]">HSN/SAC</th>
                  <th className="p-3 w-[85px] text-right border-b border-[#2a2a2a]">Qty</th>
                  <th className="p-3 w-[95px] border-b border-[#2a2a2a]">Unit</th>
                  <th className="p-3 w-[120px] text-right border-b border-[#2a2a2a]">Rate (₹)</th>
                  <th className="p-3 w-[80px] text-right border-b border-[#2a2a2a]">Disc%</th>
                  <th className="p-3 w-[95px] border-b border-[#2a2a2a]">GST%</th>
                  <th className="p-3 w-[120px] text-right border-b border-[#2a2a2a]">Taxable</th>
                  <th className="p-3 w-[120px] text-right border-b border-[#2a2a2a]">GST Amt</th>
                  <th className="p-3 w-[120px] text-right border-b border-[#2a2a2a]">Total</th>
                  <th className="p-3 w-12 text-center border-b border-[#2a2a2a]"></th>
                </tr>
              </thead>
              <Droppable droppableId="items-tbody">
                {(provided) => (
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="divide-y divide-[#2a2a2a]/60 bg-[#111111]"
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group transition-colors ${
                              snapshot.isDragging ? 'bg-[#181818] border-y border-[#5e6ad2]/30' : 'hover:bg-[#151515]'
                            }`}
                          >
                            {/* Drag handle */}
                            <td className="p-2.5 text-center sticky left-0 bg-inherit border-r border-[#2a2a2a]/40 align-middle z-10">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab text-slate-400 hover:text-slate-200 transition-colors p-1 rounded inline-block"
                              >
                                <GripVertical size={14} />
                              </div>
                            </td>

                            {/* Sr No */}
                            <td className="p-2.5 text-center text-slate-500 font-mono text-[11px] sticky left-10 bg-inherit border-r border-[#2a2a2a]/40 align-middle z-10">
                              {index + 1}
                            </td>

                            {/* Description Row Logic */}
                            {item.isDescriptionOnly ? (
                              <>
                                <td colSpan={10} className="p-2.5 sticky left-[52px] bg-inherit align-middle">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                                    placeholder="Section Header or Category description..."
                                    className="w-full px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                  />
                                </td>
                              </>
                            ) : (
                              <>
                                {/* Description */}
                                <td className="p-2.5 sticky left-[52px] bg-inherit border-r border-[#2a2a2a]/40 align-middle z-10">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                                    placeholder="Item description or service"
                                    className="w-full px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                  />
                                </td>

                                {/* HSN/SAC */}
                                <td className="p-2.5 align-middle">
                                  <div className="relative flex items-center gap-1.5 w-[90px]">
                                    <input
                                      type="text"
                                      value={item.hsnCode || ''}
                                      onChange={(e) => handleFieldChange(item.id, 'hsnCode', e.target.value)}
                                      placeholder="HSN/SAC"
                                      className="w-full px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                    />
                                    <div className="relative group shrink-0">
                                      <Info size={12} className="text-slate-500 hover:text-slate-300 cursor-help" />
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-40 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e2e8f0] text-[9px] p-2 rounded-md shadow-xl z-50 pointer-events-none text-center leading-normal">
                                        HSN for goods, SAC for services
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Qty */}
                                <td className="p-2.5 align-middle">
                                  <input
                                    type="number"
                                    min={0.001}
                                    step={0.001}
                                    value={item.quantity === 0 ? '' : item.quantity}
                                    onChange={(e) => handleFieldChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="0.000"
                                    className="w-[65px] px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                  />
                                </td>

                                {/* Unit */}
                                <td className="p-2.5 align-middle">
                                  <select
                                    value={item.unit || 'NOS'}
                                    onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                                    className="w-[75px] px-1.5 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] focus:outline-none focus:border-[#5e6ad2]"
                                  >
                                    {UNIT_TYPES.map((u) => (
                                      <option key={u.value} value={u.value} className="bg-[#111111]">
                                        {u.value}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Rate */}
                                <td className="p-2.5 align-middle">
                                  <div className="relative flex items-center w-[100px]">
                                    <span className="absolute left-2 text-[#555] text-[10px] font-mono">₹</span>
                                    <input
                                      type="number"
                                      value={item.rate === 0 ? '' : item.rate}
                                      onChange={(e) => handleFieldChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-full pl-4 pr-1.5 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                    />
                                  </div>
                                </td>

                                {/* Disc% */}
                                <td className="p-2.5 align-middle">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.discountPercent === 0 ? '' : item.discountPercent}
                                    onChange={(e) => handleFieldChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className={`w-[60px] px-2 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] ${
                                      !item.discountPercent || Number(item.discountPercent) === 0 ? 'text-[#555] placeholder-[#444]' : 'text-[#e2e8f0]'
                                    }`}
                                  />
                                </td>

                                {/* GST% */}
                                <td className="p-2.5 align-middle">
                                  <select
                                    value={item.gstRate || 0}
                                    onChange={(e) => handleFieldChange(item.id, 'gstRate', parseFloat(e.target.value) || 0)}
                                    className={`w-[75px] px-1.5 py-1 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-xs focus:outline-none focus:border-[#5e6ad2] ${getGstColorClass(item.gstRate)}`}
                                  >
                                    {GST_RATES.map((g) => (
                                      <option key={g.value} value={g.value} className={`bg-[#111111] ${getGstColorClass(g.value)}`}>
                                        {g.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Taxable Amount */}
                                <td className="p-2.5 text-right text-xs text-slate-400 font-mono align-middle">
                                  {formatINR(item.taxableAmount || 0)}
                                </td>

                                {/* GST Amount with hover tooltip breakdown */}
                                <td className="p-2.5 text-right text-xs text-slate-400 font-mono align-middle">
                                  <div className="relative group cursor-help inline-block border-b border-dashed border-[#444] hover:border-slate-400">
                                    <span>{formatINR(item.gstAmount || 0)}</span>
                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-44 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e2e8f0] text-[10px] p-2.5 rounded-md shadow-xl z-50 text-left font-sans leading-normal">
                                      {taxMode === 'interstate' ? (
                                        <div className="font-semibold text-[#5e6ad2]">IGST: {formatINR(item.igstAmount || 0)}</div>
                                      ) : (
                                        <div className="flex flex-col gap-1">
                                          <div className="text-emerald-400">CGST: {formatINR(item.cgstAmount || 0)}</div>
                                          <div className="text-teal-400">SGST: {formatINR(item.sgstAmount || 0)}</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Total */}
                                <td className="p-2.5 text-right text-xs text-[#e2e8f0] font-semibold font-mono align-middle">
                                  {formatINR(item.totalAmount || 0)}
                                </td>
                              </>
                            )}

                            {/* Delete row button */}
                            <td className="p-2.5 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(item.id)}
                                className="text-red-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </div>
        )}

        {/* Mobile View */}
        {isMobile && (
          <Droppable droppableId="items-tbody">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-4"
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 shadow-sm relative transition-all ${
                          snapshot.isDragging ? 'border-[#5e6ad2] bg-[#141414]' : ''
                        }`}
                      >
                        {/* Header of mobile card */}
                        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
                            >
                              <GripVertical size={16} />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 font-mono">
                              Item #{index + 1}
                            </span>
                            {item.isDescriptionOnly && (
                              <span className="text-[9px] font-bold uppercase bg-[#252525] text-[#888] px-1.5 py-0.5 rounded">
                                Section Row
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(item.id)}
                            className="text-red-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Card Contents */}
                        {item.isDescriptionOnly ? (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                              Section Header / Description
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                              placeholder="Section Header or Category description..."
                              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3.5">
                            {/* Description */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                                placeholder="Item description or service"
                                className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                              />
                            </div>

                            {/* HSN/SAC & Unit */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold text-[#888] uppercase tracking-wider flex items-center gap-1">
                                  HSN/SAC
                                  <div className="relative group">
                                    <Info size={12} className="text-slate-500 cursor-pointer" />
                                    <div className="absolute bottom-full mb-1.5 left-0 w-40 bg-[#1a1a1a] border border-[#2a2a2a] text-[#e2e8f0] text-[9px] p-2 rounded-md shadow-xl z-50 pointer-events-none leading-relaxed">
                                      HSN for goods, SAC for services
                                    </div>
                                  </div>
                                </span>
                                <input
                                  type="text"
                                  value={item.hsnCode || ''}
                                  onChange={(e) => handleFieldChange(item.id, 'hsnCode', e.target.value)}
                                  placeholder="Code"
                                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                  Unit
                                </label>
                                <select
                                  value={item.unit || 'NOS'}
                                  onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] focus:outline-none focus:border-[#5e6ad2]"
                                >
                                  {UNIT_TYPES.map((u) => (
                                    <option key={u.value} value={u.value} className="bg-[#111111]">
                                      {u.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Qty & Rate */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min={0.001}
                                  step={0.001}
                                  value={item.quantity === 0 ? '' : item.quantity}
                                  onChange={(e) => handleFieldChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  placeholder="0.000"
                                  className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                  Rate (₹)
                                </label>
                                <div className="relative flex items-center">
                                  <span className="absolute left-3 text-[#555] text-xs font-mono">₹</span>
                                  <input
                                    type="number"
                                    value={item.rate === 0 ? '' : item.rate}
                                    onChange={(e) => handleFieldChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-[#e2e8f0] placeholder-[#444] text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Disc% & GST% */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                  Discount %
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={item.discountPercent === 0 ? '' : item.discountPercent}
                                  onChange={(e) => handleFieldChange(item.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className={`w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-right focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] ${
                                    !item.discountPercent || Number(item.discountPercent) === 0 ? 'text-[#555] placeholder-[#444]' : 'text-[#e2e8f0]'
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-semibold text-[#888] uppercase tracking-wider">
                                  GST Rate
                                </label>
                                <select
                                  value={item.gstRate || 0}
                                  onChange={(e) => handleFieldChange(item.id, 'gstRate', parseFloat(e.target.value) || 0)}
                                  className={`w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-xs focus:outline-none focus:border-[#5e6ad2] ${getGstColorClass(item.gstRate)}`}
                                >
                                  {GST_RATES.map((g) => (
                                    <option key={g.value} value={g.value} className={`bg-[#111111] ${getGstColorClass(g.value)}`}>
                                      {g.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Read-only calculations drawer */}
                            <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 flex flex-col gap-2 text-xs">
                              <div className="flex justify-between items-center text-[#888]">
                                <span>Taxable Amount:</span>
                                <span className="font-mono text-slate-300">{formatINR(item.taxableAmount || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[#888]">
                                <span>GST Amount:</span>
                                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                                  <span>{formatINR(item.gstAmount || 0)}</span>
                                  <span className="text-[10px] text-[#555] font-sans">
                                    ({taxMode === 'interstate' ? `IGST` : `CGST+SGST`})
                                  </span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[#e2e8f0] font-semibold border-t border-[#2a2a2a]/60 pt-2 mt-1">
                                <span>Total Amount:</span>
                                <span className="font-mono text-emerald-400">{formatINR(item.totalAmount || 0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </DragDropContext>

      {/* Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddItem}
            icon={Plus}
          >
            Add Item
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddDescriptionRow}
            icon={AlignLeft}
            className="hover:bg-[#1a1a1a]"
          >
            Add Description Row
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          icon={Trash}
          className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/20"
        >
          Clear All Items
        </Button>
      </div>

      {/* Totals Summary Section */}
      <div className="flex flex-col items-end mt-2">
        <div className="w-full md:w-[420px] bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider pl-2.5 border-l-2 border-[#5e6ad2]">
            Invoice Summary
          </h3>

          <div className="flex flex-col gap-2.5 text-xs text-[#ccc]">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-[#888]">Subtotal:</span>
              <span className="font-mono">{formatINR(totals.subTotal || 0)}</span>
            </div>

            {/* Line Item Discounts */}
            {totals.lineItemsDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#888]">Line Item Discounts:</span>
                <span className="font-mono text-rose-500">-{formatINR(totals.lineItemsDiscount)}</span>
              </div>
            )}

            {/* Additional Charges dynamic values */}
            {totals.additionalChargesBreakdown?.shipping?.base > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#888]">Shipping Charges:</span>
                <span className="font-mono">{formatINR(totals.additionalChargesBreakdown.shipping.base)}</span>
              </div>
            )}
            {totals.additionalChargesBreakdown?.packaging?.base > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#888]">Packaging Charges:</span>
                <span className="font-mono">{formatINR(totals.additionalChargesBreakdown.packaging.base)}</span>
              </div>
            )}
            {totals.additionalChargesBreakdown?.other?.base > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#888]">{charges.otherChargesLabel || 'Other Charges'}:</span>
                <span className="font-mono">{formatINR(totals.additionalChargesBreakdown.other.base)}</span>
              </div>
            )}

            {/* Overall Discount */}
            {totals.overallDiscountAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#888]">Overall Discount:</span>
                <span className="font-mono text-rose-500">-{formatINR(totals.overallDiscountAmount)}</span>
              </div>
            )}

            {/* Taxable Amount */}
            <div className="flex justify-between items-center border-t border-[#2a2a2a]/45 pt-2.5 font-semibold text-[#e2e8f0]">
              <span>Taxable Amount:</span>
              <span className="font-mono">{formatINR(totals.taxableAmount || 0)}</span>
            </div>

            {/* GST Breakup Slab Table */}
            {totals.taxSlabs && totals.taxSlabs.length > 0 && (
              <div className="mt-2.5 border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#141414] shadow-inner">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead className="bg-[#1a1a1a] text-[#888] border-b border-[#2a2a2a] font-semibold uppercase tracking-wider select-none">
                    <tr>
                      <th className="p-2 border-r border-[#2a2a2a]/40">Rate</th>
                      <th className="p-2 text-right border-r border-[#2a2a2a]/40">Taxable</th>
                      <th className="p-2 text-right">{taxMode === 'interstate' ? 'IGST' : 'CGST+SGST'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]/45 font-mono text-[#e2e8f0]">
                    {totals.taxSlabs.map((slab) => (
                      <tr key={slab.rate} className="hover:bg-[#181818]/50">
                        <td className="p-2 border-r border-[#2a2a2a]/40 text-[#888] font-sans font-medium">{slab.rate}%</td>
                        <td className="p-2 text-right border-r border-[#2a2a2a]/40">{formatINR(slab.taxable)}</td>
                        <td className="p-2 text-right">
                          {taxMode === 'interstate' ? (
                            formatINR(slab.igst)
                          ) : (
                            <div className="flex flex-col items-end gap-0.5">
                              <span>{formatINR(slab.cgst + slab.sgst)}</span>
                              <span className="text-[8px] text-[#666] font-sans leading-none">
                                (CGST {formatINR(slab.cgst)} + SGST {formatINR(slab.sgst)})
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Tax */}
            <div className="flex justify-between items-center mt-1">
              <span className="text-[#888]">Total Tax:</span>
              <span className="font-mono">{formatINR(totals.totalTax || 0)}</span>
            </div>

            {/* Round Off (if any) */}
            {Math.abs(totals.roundOff) > 0 && (
              <div className="flex justify-between items-center text-[#888]">
                <span>Round Off:</span>
                <span className="font-mono">
                  {totals.roundOff > 0 ? '+' : ''}{formatINR(totals.roundOff)}
                </span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#2a2a2a] my-1.5" />

            {/* Grand Total */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#e2e8f0]">Grand Total:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {formatINR(totals.grandTotal || 0)}
              </span>
            </div>
          </div>

          {/* Amount in words */}
          <div className="text-[11px] text-[#888] italic text-right mt-1.5 break-words leading-relaxed border-t border-[#2a2a2a]/40 pt-3">
            {numberToWords(totals.grandTotal || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
