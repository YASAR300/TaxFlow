'use client';

import React, { useState } from 'react';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import { QRCodeSVG } from 'qrcode.react';

/**
 * BankDetails component for business bank account details and UPI QR code setup.
 * 
 * Props:
 * - bankData (object): Bank details model from state
 * - onChange (function): Callback when a bank field changes (field, value)
 * - errors (object): External validation errors from parent validation
 * - totals (object): Totals from calculateInvoiceTotals to get grandTotal
 */
export default function BankDetails({ bankData = {}, onChange, errors = {}, totals = {} }) {
  // Graceful fallback destructuring
  const bankName = bankData.bankName ?? '';
  const accountName = bankData.accountName ?? '';
  const accountNumber = bankData.accountNumber ?? '';
  const ifscCode = bankData.ifscCode ?? '';
  const accountType = bankData.accountType ?? 'current';
  const branchName = bankData.branchName ?? '';
  const upiId = bankData.upiId ?? '';

  const grandTotal = totals.grandTotal ?? 0;

  // Local state
  const [confirmAcc, setConfirmAcc] = useState(accountNumber);
  const [showAcc, setShowAcc] = useState(false);
  const [showConfirmAcc, setShowConfirmAcc] = useState(false);
  const [showUpi, setShowUpi] = useState(true); // Eye icon toggle for UPI ID
  const [showQrPreview, setShowQrPreview] = useState(false);
  
  // IFSC api validation state
  const [isLoadingIFSC, setIsLoadingIFSC] = useState(false);
  const [ifscError, setIfscError] = useState('');

  // Live confirmations
  const accMismatchError = confirmAcc && confirmAcc !== accountNumber ? 'Account numbers do not match' : '';
  const upiError = upiId && !upiId.includes('@') ? 'Invalid UPI ID format (must contain @)' : '';

  const handleIFSCBlur = async (e) => {
    const code = e.target.value.trim().toUpperCase();
    onChange('ifscCode', code);
    
    if (!code) {
      setIfscError('');
      return;
    }
    
    if (code.length !== 11) {
      setIfscError('IFSC code must be exactly 11 characters');
      return;
    }

    setIsLoadingIFSC(true);
    setIfscError('');
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.BANK) {
          onChange('bankName', data.BANK);
        }
        if (data.BRANCH) {
          onChange('branchName', data.BRANCH);
        }
        setIfscError('');
      } else {
        setIfscError('IFSC code not found. Please verify.');
      }
    } catch (err) {
      console.error('Error fetching IFSC details:', err);
      setIfscError('Unable to validate IFSC. Please enter details manually.');
    } finally {
      setIsLoadingIFSC(false);
    }
  };

  // QR value builder
  const qrValue = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&am=${grandTotal}&cu=INR`;

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div className="flex items-center gap-2.5 pl-2.5 border-l-2 border-[#5e6ad2]">
          <Landmark size={16} className="text-[#5e6ad2]" />
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider">
            Bank & Payment Details
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Bank Account Fields */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Account Type Select */}
            <Select
              label="Account Type"
              value={accountType}
              onChange={(e) => onChange('accountType', e.target.value)}
              error={errors.accountType}
              options={[
                { value: 'current', label: 'Current Account' },
                { value: 'savings', label: 'Savings Account' },
                { value: 'od', label: 'Overdraft (OD)' },
              ]}
              required
            />

            {/* Bank Name */}
            <Input
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
              value={bankName}
              onChange={(e) => onChange('bankName', e.target.value)}
              error={errors.bankName}
              required
            />

            {/* Account Holder Name (Full Width) */}
            <Input
              label="Account Holder Name"
              placeholder="Full name as in passbook"
              value={accountName}
              onChange={(e) => onChange('accountName', e.target.value)}
              error={errors.accountName}
              className="md:col-span-2"
              required
            />

            {/* Account Number with Eye Toggle */}
            <div className="relative">
              <Input
                label="Account Number"
                type={showAcc ? 'text' : 'password'}
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => {
                  onChange('accountNumber', e.target.value);
                  if (confirmAcc && e.target.value !== confirmAcc) {
                    // trigger mismatch check
                  }
                }}
                error={errors.accountNumber}
                required
              />
              <button
                type="button"
                onClick={() => setShowAcc(!showAcc)}
                className="absolute right-3 top-[32px] text-[#555] hover:text-[#888] transition-colors"
                title={showAcc ? 'Hide Account Number' : 'Show Account Number'}
              >
                {showAcc ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Account Number with Eye Toggle */}
            <div className="relative">
              <Input
                label="Confirm Account Number"
                type={showConfirmAcc ? 'text' : 'password'}
                placeholder="Re-enter account number"
                value={confirmAcc}
                onChange={(e) => setConfirmAcc(e.target.value)}
                error={accMismatchError || errors.confirmAccountNumber}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmAcc(!showConfirmAcc)}
                className="absolute right-3 top-[32px] text-[#555] hover:text-[#888] transition-colors"
                title={showConfirmAcc ? 'Hide Account Number' : 'Show Account Number'}
              >
                {showConfirmAcc ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* IFSC Code with Live Validation / Fetch */}
            <div className="relative">
              <Input
                label="IFSC Code"
                placeholder="e.g. HDFC0000123"
                value={ifscCode}
                onChange={(e) => onChange('ifscCode', e.target.value.toUpperCase())}
                onBlur={handleIFSCBlur}
                error={ifscError || errors.ifscCode}
                maxLength={11}
                required
              />
              {isLoadingIFSC && (
                <div className="absolute right-3 top-[32px] flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 text-[#5e6ad2]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Branch Name */}
            <Input
              label="Branch Name"
              placeholder="e.g. K.G. Road Branch"
              value={branchName}
              onChange={(e) => onChange('branchName', e.target.value)}
              error={errors.branchName}
              required
            />

          </div>
        </div>

        {/* Right Column: UPI & QR Preview */}
        <div className="flex flex-col gap-5 bg-[#141414] border border-[#2a2a2a] rounded-lg p-5">
          <span className="text-[12px] font-semibold text-[#888] uppercase tracking-wider">
            UPI QR Code Configuration
          </span>

          {/* UPI ID Field with Eye Show/Hide Toggle & Live Verification */}
          <div className="relative">
            <Input
              label="UPI ID (VPA)"
              type={showUpi ? 'text' : 'password'}
              placeholder="e.g. name@bank"
              value={upiId}
              onChange={(e) => onChange('upiId', e.target.value.trim())}
              error={upiError || errors.upiId}
              required
            />
            <button
              type="button"
              onClick={() => setShowUpi(!showUpi)}
              className="absolute right-3 top-[32px] text-[#555] hover:text-[#888] transition-colors"
              title={showUpi ? 'Hide UPI ID' : 'Show UPI ID'}
            >
              {showUpi ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Preview Toggle Switch */}
          <div className="pt-2 border-t border-[#2a2a2a]/50">
            <Toggle
              checked={showQrPreview}
              onChange={setShowQrPreview}
              label="Preview QR Code"
              description="Show how the payment QR will render on the invoice"
            />
          </div>

          {/* Render QR Code if toggled ON */}
          {showQrPreview && (
            <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mt-2 transition-all duration-300 animate-fadeIn">
              {upiId && !upiError ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-200">
                    <QRCodeSVG
                      value={qrValue}
                      size={120}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-emerald-500 block">
                      QR Generated Successfully
                    </span>
                    <span className="text-[11px] text-[#888] block mt-1">
                      Scan to pay <strong className="text-[#e2e8f0]">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-[#555] text-xs">
                  {upiId ? 'Please provide a valid UPI ID to generate QR Code' : 'Enter a UPI ID above to preview the QR code'}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
