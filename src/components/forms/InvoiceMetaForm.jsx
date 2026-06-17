'use client';

import { useState, useEffect } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { generateInvoiceNumber, getDueDate } from '@/utils/invoiceHelpers';
import { INDIAN_STATES } from '@/constants/indianStates';

export default function InvoiceMetaForm({ metaData = {}, onChange }) {
  const [generating, setGenerating] = useState(false);

  // Auto-generate invoice number
  const handleAutoGenerateNumber = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/invoices?limit=100');
      let existingNumbers = [];
      if (res.ok) {
        const data = await res.json();
        if (data && data.invoices) {
          existingNumbers = data.invoices.map(inv => inv.invoice_number);
        }
      }
      const nextNum = generateInvoiceNumber(existingNumbers);
      onChange('invoiceNumber', nextNum);
      toast.success(`Generated: ${nextNum}`);
    } catch (err) {
      console.error(err);
      const nextNum = generateInvoiceNumber([]);
      onChange('invoiceNumber', nextNum);
      toast.success(`Generated: ${nextNum}`);
    } finally {
      setGenerating(false);
    }
  };

  // Auto-calculate financial year from invoiceDate
  const calculateFY = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const month = d.getMonth(); // 0 = Jan, 3 = Apr
    const year = d.getFullYear();
    const startYear = month >= 3 ? year : year - 1;
    const endYear = (startYear + 1).toString().slice(-2);
    return `${startYear}-${endYear}`;
  };

  // React to invoiceDate and update financialYear
  useEffect(() => {
    if (metaData.invoiceDate) {
      const computedFY = calculateFY(metaData.invoiceDate);
      if (computedFY && metaData.financialYear !== computedFY) {
        onChange('financialYear', computedFY);
      }
    }
  }, [metaData.invoiceDate, metaData.financialYear, onChange]);

  // React to invoiceDate / paymentTerms and update dueDate
  useEffect(() => {
    if (metaData.invoiceDate && metaData.paymentTerms && metaData.paymentTerms !== 'custom') {
      const calculatedDueDate = getDueDate(metaData.invoiceDate, metaData.paymentTerms);
      if (calculatedDueDate && metaData.dueDate !== calculatedDueDate) {
        onChange('dueDate', calculatedDueDate);
      }
    }
  }, [metaData.invoiceDate, metaData.paymentTerms, metaData.dueDate, onChange]);

  // Options lists
  const invoiceTypes = [
    { value: 'Tax Invoice', label: 'Tax Invoice' },
    { value: 'Bill of Supply', label: 'Bill of Supply' },
    { value: 'Export Invoice', label: 'Export Invoice' },
    { value: 'Delivery Challan', label: 'Delivery Challan' }
  ];

  const paymentTermsOptions = [
    { value: 'immediate', label: 'Immediate (Due on Receipt)' },
    { value: 'net7', label: 'Net 7 Days' },
    { value: 'net15', label: 'Net 15 Days' },
    { value: 'net30', label: 'Net 30 Days' },
    { value: 'net45', label: 'Net 45 Days' },
    { value: 'net60', label: 'Net 60 Days' },
    { value: 'net90', label: 'Net 90 Days' },
    { value: 'custom', label: 'Custom Due Date' }
  ];

  const stateOptions = INDIAN_STATES.map(state => ({
    value: state.name,
    label: `${state.name} (${state.gstCode})`
  }));

  const defaultTerms = 
    "1. Interest @ 18% per annum will be charged if payment is not made within the due date.\n" +
    "2. Any disputes arising out of this invoice shall be subject to local court jurisdiction.\n" +
    "3. Goods or services once billed cannot be returned or refunded.";

  const handleInsertDefaultTerms = () => {
    onChange('terms', defaultTerms);
    toast.success('Inserted default Terms & Conditions');
  };

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2] border-b border-[#2a2a2a] pb-4">
        <FileText size={16} className="text-[#5e6ad2]" />
        <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
          Invoice Details
        </h2>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 */}
        <Input 
          label="Invoice Number" 
          value={metaData.invoiceNumber || ''} 
          onChange={(e) => onChange('invoiceNumber', e.target.value)}
          placeholder="e.g. INV-2526-001"
          required
          icon={
            <button
              type="button"
              onClick={handleAutoGenerateNumber}
              disabled={generating}
              className="text-[#5e6ad2] hover:text-[#7b87e8] transition-colors p-1 rounded hover:bg-[#252525] focus:outline-none"
              title="Auto-generate invoice number"
            >
              <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
            </button>
          }
        />
        <Select 
          label="Invoice Type" 
          value={metaData.invoiceType || 'Tax Invoice'} 
          onChange={(e) => onChange('invoiceType', e.target.value)}
          options={invoiceTypes}
          placeholder=""
        />

        {/* Row 2 */}
        <Input 
          label="Invoice Date" 
          type="date"
          value={metaData.invoiceDate || ''} 
          onChange={(e) => onChange('invoiceDate', e.target.value)}
          required
        />
        <Input 
          label="Due Date" 
          type="date"
          value={metaData.dueDate || ''} 
          onChange={(e) => onChange('dueDate', e.target.value)}
          disabled={metaData.paymentTerms !== 'custom'}
          className={metaData.paymentTerms !== 'custom' ? 'opacity-70' : ''}
          placeholder="Auto-calculated"
        />

        {/* Row 3 */}
        <Select 
          label="Place of Supply" 
          value={metaData.placeOfSupply || ''} 
          onChange={(e) => onChange('placeOfSupply', e.target.value)}
          options={stateOptions}
          placeholder="Select Place of Supply"
        />
        <Input 
          label="Financial Year" 
          value={metaData.financialYear || ''} 
          readOnly
          disabled
          className="opacity-70 cursor-not-allowed"
          placeholder="Auto-calculated from date"
        />

        {/* Row 4 */}
        <Select 
          label="Payment Terms" 
          value={metaData.paymentTerms || 'net30'} 
          onChange={(e) => onChange('paymentTerms', e.target.value)}
          options={paymentTermsOptions}
          placeholder=""
        />
        <Input 
          label="Reference / PO Number" 
          value={metaData.referenceNumber || ''} 
          onChange={(e) => onChange('referenceNumber', e.target.value)}
          placeholder="e.g. PO-98234 (Optional)"
        />
      </div>

      {/* Notes & Terms Section */}
      <div className="flex flex-col gap-4 pt-4 border-t border-[#2a2a2a]">
        <div>
          <Input 
            label="Notes (visible on invoice)" 
            type="textarea"
            rows={3}
            value={metaData.notes || ''} 
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Thank you for your business! Please quote invoice number during payment."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">
              Terms & Conditions
            </label>
            <button
              type="button"
              onClick={handleInsertDefaultTerms}
              className="text-[10px] text-[#5e6ad2] hover:text-[#7b87e8] hover:underline focus:outline-none"
            >
              Insert Default
            </button>
          </div>
          <textarea
            rows={3}
            value={metaData.terms || ''} 
            onChange={(e) => onChange('terms', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-all resize-none"
            placeholder="Enter payment terms, late fee policy, and bank transfer terms."
          />
        </div>
      </div>
    </div>
  );
}
