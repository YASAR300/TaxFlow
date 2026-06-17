'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatINR, numberToWords } from '@/utils/indianFormat';
import { formatDate } from '@/utils/invoiceHelpers';
import TaxBreakupTable from './TaxBreakupTable';

/**
 * Helper to mask account number leaving only the last 4 digits visible.
 */
const maskAccountNumber = (num) => {
  if (!num) return '';
  const str = String(num).trim();
  if (str.length <= 4) return str;
  return '•'.repeat(str.length - 4) + ' ' + str.slice(-4);
};

/**
 * InvoicePreview - Visual invoice preview component.
 * Rendered to match printed A4 scale and styling.
 * 
 * Props:
 * - invoiceData (object): Entire invoice configuration
 */
export default function InvoicePreview({ invoiceData = {} }) {
  // Destructure with default fallback objects
  const seller = invoiceData.seller || {};
  const buyer = invoiceData.buyer || {};
  const meta = invoiceData.meta || {};
  const lineItems = invoiceData.lineItems || [];
  const additionalCharges = invoiceData.additionalCharges || {};
  const bankDetails = invoiceData.bankDetails || {};
  const customization = invoiceData.customization || {};
  const totals = invoiceData.totals || {};

  // Customization settings
  const accentColor = customization.accentColor || '#1a56db';
  const showLogo = customization.showLogo ?? true;
  const showSignature = customization.showSignature ?? true;
  const showBankDetails = customization.showBankDetails ?? true;
  const showQrCode = customization.showQrCode ?? true;
  const showItemSerialNumbers = customization.showItemSerialNumbers ?? true;
  const showWatermark = customization.showWatermark ?? false;

  // Font mapping
  const fontStyleMap = {
    Arial: 'Arial, Helvetica, sans-serif',
    Inter: '"Inter", sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  };
  const fontFamilyStyle = fontStyleMap[customization.fontFamily] || 'sans-serif';

  // Dynamic calculations & format checks
  const hasLineItems = lineItems.length > 0;
  const upiId = bankDetails.upiId || '';
  const grandTotal = totals.grandTotal || 0;
  const accountHolder = bankDetails.accountName || seller.businessName || '';
  
  // UPI payment URI
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountHolder)}&am=${grandTotal}&cu=INR`;

  return (
    <div className="w-full overflow-x-auto p-4 flex justify-center bg-[#181818] border border-[#2a2a2a] rounded-xl">
      {/* A4 Container Wrapper */}
      <div
        id="invoice-preview-content"
        className="w-[794px] min-h-[1123px] bg-white text-slate-800 shadow-2xl p-8 md:p-10 relative flex flex-col justify-between select-none rounded-[2px]"
        style={{
          fontFamily: fontFamilyStyle,
          fontSize: '13px',
          lineHeight: '1.45',
        }}
      >
        {/* WATERMARK */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
            <span className="text-slate-200 text-6xl font-black rotate-45 uppercase opacity-[0.14] whitespace-nowrap tracking-[0.2em]">
              ORIGINAL FOR RECIPIENT
            </span>
          </div>
        )}

        {/* Outer content block (prevents overlaps on printing) */}
        <div className="relative z-10 flex flex-col gap-6">
          
          {/* 1. Header Section */}
          <div className="flex justify-between items-start gap-4">
            {/* Logo/Business Name */}
            <div>
              {showLogo && seller.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.logoUrl}
                  alt="Business Logo"
                  className="max-h-[70px] max-w-[200px] object-contain"
                />
              ) : (
                <span className="text-xl font-bold tracking-tight uppercase" style={{ color: accentColor }}>
                  {seller.businessName || 'Your Business Name'}
                </span>
              )}
            </div>

            {/* Document Type details */}
            <div className="text-right">
              <h1 className="text-xl font-black tracking-wider uppercase mb-1" style={{ color: accentColor }}>
                {meta.invoiceType || 'TAX INVOICE'}
              </h1>
              <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">Invoice #: </span>
                  <span className="font-bold text-slate-800">{meta.invoiceNumber || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold">Date: </span>
                  <span className="text-slate-700">{meta.invoiceDate ? formatDate(meta.invoiceDate) : '—'}</span>
                </div>
                {meta.dueDate && (
                  <div>
                    <span className="font-semibold">Due Date: </span>
                    <span className="text-slate-700">{formatDate(meta.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Seller & Buyer Info Row */}
          <div className="grid grid-cols-2 gap-8 mt-2">
            {/* Seller Column */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                From:
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-[14px]">
                  {seller.businessName || 'Your Business Name'}
                </span>
                {seller.ownerName && <span className="text-slate-600">{seller.ownerName}</span>}
                <span className="text-slate-500 whitespace-pre-line leading-relaxed">{seller.address || 'Business Address'}</span>
                {(seller.city || seller.state) && (
                  <span className="text-slate-500">
                    {seller.city && `${seller.city}, `}
                    {seller.state}
                    {seller.pinCode && ` - ${seller.pinCode}`}
                  </span>
                )}
                {seller.gstin && (
                  <div className="text-xs text-slate-700 mt-1">
                    <span className="font-bold">GSTIN: </span>
                    <span className="font-mono">{seller.gstin}</span>
                  </div>
                )}
                {seller.pan && (
                  <div className="text-xs text-slate-700">
                    <span className="font-bold">PAN: </span>
                    <span className="font-mono">{seller.pan}</span>
                  </div>
                )}
                {(seller.phone || seller.email) && (
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-col">
                    {seller.phone && <span>Ph: {seller.phone}</span>}
                    {seller.email && <span>Email: {seller.email}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Column */}
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Bill To:
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 text-[14px]">
                  {buyer.businessName || 'Buyer Business Name'}
                </span>
                {buyer.contactName && <span className="text-slate-600">{buyer.contactName}</span>}
                <span className="text-slate-500 whitespace-pre-line leading-relaxed">{buyer.address || 'Billing Address'}</span>
                {(buyer.city || buyer.state) && (
                  <span className="text-slate-500">
                    {buyer.city && `${buyer.city}, `}
                    {buyer.state}
                    {buyer.pinCode && ` - ${buyer.pinCode}`}
                  </span>
                )}
                {buyer.gstin && (
                  <div className="text-xs text-slate-700 mt-1">
                    <span className="font-bold">GSTIN: </span>
                    <span className="font-mono">{buyer.gstin}</span>
                  </div>
                )}
                {buyer.pan && (
                  <div className="text-xs text-slate-700">
                    <span className="font-bold">PAN: </span>
                    <span className="font-mono">{buyer.pan}</span>
                  </div>
                )}
                {(buyer.phone || buyer.email) && (
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-col">
                    {buyer.phone && <span>Ph: {buyer.phone}</span>}
                    {buyer.email && <span>Email: {buyer.email}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accent Horizontal Border Divider */}
          <div className="border-b-2" style={{ borderColor: accentColor }} />

          {/* 3. Invoice Meta Row */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Place of Supply</span>
              <span className="font-semibold text-slate-700">{meta.placeOfSupply || '—'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Financial Year</span>
              <span className="font-semibold text-slate-700">{meta.financialYear || '—'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Payment Terms</span>
              <span className="font-semibold text-slate-700 capitalize">{meta.paymentTerms || '—'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Due Date</span>
              <span className="font-semibold text-slate-700">{meta.dueDate ? formatDate(meta.dueDate) : 'Immediate'}</span>
            </div>
          </div>

          {/* 4. Line Items Table */}
          <div className="border border-slate-200 rounded overflow-hidden mt-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-bold" style={{ backgroundColor: accentColor, color: '#ffffff' }}>
                  {showItemSerialNumbers && <th className="p-2 text-center w-[35px]">#</th>}
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center w-[80px]">HSN/SAC</th>
                  <th className="p-2 text-right w-[50px]">Qty</th>
                  <th className="p-2 text-center w-[50px]">Unit</th>
                  <th className="p-2 text-right w-[80px]">Rate</th>
                  <th className="p-2 text-right w-[50px]">Disc%</th>
                  <th className="p-2 text-right w-[75px]">GST%</th>
                  <th className="p-2 text-right w-[90px]">Taxable</th>
                  <th className="p-2 text-right w-[80px]">GST</th>
                  <th className="p-2 text-right w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {hasLineItems ? (
                  lineItems.map((item, idx) => {
                    const isEven = idx % 2 === 1;
                    const taxModeLabel = meta.taxMode === 'interstate' ? 'I:' : 'C+S:';
                    const gstRateLabel = `${taxModeLabel} ${item.gstRate || 0}%`;

                    return (
                      <tr
                        key={item.id || idx}
                        className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40 text-xs ${
                          isEven ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        {showItemSerialNumbers && (
                          <td className="p-2 text-center border-r border-slate-100 font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                        )}
                        <td className="p-2 border-r border-slate-100 font-medium text-slate-800">
                          {item.description || '—'}
                        </td>
                        <td className="p-2 text-center border-r border-slate-100 font-mono text-[11px]">
                          {item.hsnCode || '—'}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-mono">
                          {item.quantity || 0}
                        </td>
                        <td className="p-2 text-center border-r border-slate-100 text-[#555]">
                          {item.unit || 'NOS'}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-mono text-[11px]">
                          {formatINR(item.rate || 0).replace('₹', '')}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-mono text-[11px]">
                          {item.discountPercent ? `${item.discountPercent}%` : '0%'}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-medium text-[10px] whitespace-nowrap">
                          {gstRateLabel}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-mono text-[11px]">
                          {formatINR(item.taxableAmount || 0).replace('₹', '')}
                        </td>
                        <td className="p-2 text-right border-r border-slate-100 font-mono text-[11px]">
                          {formatINR(item.gstAmount || 0).replace('₹', '')}
                        </td>
                        <td className="p-2 text-right font-semibold font-mono text-[11px] text-slate-900">
                          {formatINR(item.totalAmount || 0).replace('₹', '')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showItemSerialNumbers ? 11 : 10} className="p-8 text-center text-slate-400 italic">
                      No line items added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Totals & Tax Breakup Section */}
          <div className="flex justify-end mt-4">
            <div className="w-[380px] flex flex-col gap-2">
              
              {/* Calculations list */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800">{formatINR(totals.subTotal || 0)}</span>
                </div>

                {totals.lineItemsDiscount > 0 && (
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Less: Item Discounts:</span>
                    <span className="font-mono">- {formatINR(totals.lineItemsDiscount)}</span>
                  </div>
                )}

                {additionalCharges.shippingCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping Charges:</span>
                    <span className="font-mono text-slate-800">{formatINR(additionalCharges.shippingCharges)}</span>
                  </div>
                )}

                {additionalCharges.packagingCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Packing Charges:</span>
                    <span className="font-mono text-slate-800">{formatINR(additionalCharges.packagingCharges)}</span>
                  </div>
                )}

                {additionalCharges.otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Handling Charges:</span>
                    <span className="font-mono text-slate-800">{formatINR(additionalCharges.otherCharges)}</span>
                  </div>
                )}

                {totals.overallDiscountAmount > 0 && (
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Less: Overall Discount:</span>
                    <span className="font-mono">- {formatINR(totals.overallDiscountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100">
                  <span>Taxable Amount:</span>
                  <span className="font-mono">{formatINR(totals.taxableAmount || 0)}</span>
                </div>
              </div>

              {/* Tax Breakup Table placement */}
              {hasLineItems && totals.taxSlabs && (
                <TaxBreakupTable
                  taxSlabs={totals.taxSlabs}
                  taxMode={meta.taxMode || 'intrastate'}
                  totalCGST={totals.totalCGST || 0}
                  totalSGST={totals.totalSGST || 0}
                  totalIGST={totals.totalIGST || 0}
                  totalTax={totals.totalTax || 0}
                />
              )}

              {/* Total Tax */}
              <div className="flex justify-between text-xs font-semibold text-slate-700 mt-1">
                <span>Total Tax Amount:</span>
                <span className="font-mono">{formatINR(totals.totalTax || 0)}</span>
              </div>

              {/* Grand Total accent divider */}
              <div className="border-t-2 my-1" style={{ borderColor: accentColor }} />

              {/* Grand Total details */}
              <div className="flex flex-col items-end">
                <div className="flex justify-between w-full items-baseline">
                  <span className="text-sm font-bold text-slate-800">Grand Total:</span>
                  <span className="text-lg font-black font-mono" style={{ color: accentColor }}>
                    {formatINR(grandTotal)}
                  </span>
                </div>
                {totals.roundOff !== 0 && (
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    (Round Off: {totals.roundOff > 0 ? '+' : ''}
                    {formatINR(totals.roundOff)})
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* 6. Amount in Words */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-600 italic text-[11px] mt-2 font-medium">
            <span className="font-semibold text-slate-400 uppercase tracking-wide text-[9px] block mb-0.5">Amount In Words:</span>
            {numberToWords(grandTotal)}
          </div>

          {/* 7. Bottom Details Row: Bank details & UPI QR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
            
            {/* Bank details info */}
            <div className="md:col-span-7">
              {showBankDetails && bankDetails.bankName && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-100 pb-1">
                    Bank Details
                  </span>
                  <div className="grid grid-cols-3 gap-y-0.5 text-xs text-slate-600 mt-1">
                    <span className="font-medium text-slate-400">Bank Name:</span>
                    <span className="col-span-2 font-semibold text-slate-800">{bankDetails.bankName}</span>

                    <span className="font-medium text-slate-400">Account Type:</span>
                    <span className="col-span-2 capitalize">{bankDetails.accountType || 'Current'}</span>

                    <span className="font-medium text-slate-400">Account No:</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-800">
                      {maskAccountNumber(bankDetails.accountNumber)}
                    </span>

                    <span className="font-medium text-slate-400">IFSC Code:</span>
                    <span className="col-span-2 font-mono font-semibold text-slate-800">{bankDetails.ifscCode}</span>

                    {bankDetails.branchName && (
                      <>
                        <span className="font-medium text-slate-400">Branch Name:</span>
                        <span className="col-span-2 text-slate-600">{bankDetails.branchName}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* UPI QR Placement */}
            <div className="md:col-span-5 flex justify-end">
              {showBankDetails && showQrCode && upiId && (
                <div className="flex items-center gap-3 border border-slate-100 bg-slate-50 p-2.5 rounded-lg">
                  <div className="bg-white p-1 rounded border border-slate-200">
                    <QRCodeSVG value={upiLink} size={76} level="M" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700">Scan to Pay</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                      Use any UPI app to pay ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 bg-slate-100 px-1 py-0.5 rounded max-w-[130px] truncate" title={upiId}>
                      {upiId}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 8. Signature Section */}
          {showSignature && (
            <div className="grid grid-cols-2 gap-12 mt-8">
              {/* Left Box */}
              <div className="flex flex-col justify-end min-h-[70px]">
                <div className="border-t border-dashed border-slate-300 w-full mb-1" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold text-center">
                  Receiver's Signature
                </span>
              </div>

              {/* Right Box */}
              <div className="flex flex-col items-center justify-end min-h-[70px] text-center">
                <span className="text-[11px] text-slate-700 font-semibold mb-6">
                  For {seller.businessName || 'Your Business Name'}
                </span>
                <div className="border-t border-dashed border-slate-300 w-full mb-1" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Authorised Signatory
                </span>
              </div>
            </div>
          )}

        </div>

        {/* 9. Footer Section */}
        <div className="mt-8 border-t border-slate-100 pt-6 relative z-10 flex flex-col gap-3">
          <div className="text-center text-slate-400 font-medium text-xs">
            Thank you for your business!
          </div>

          {/* Notes Container */}
          {meta.notes && (
            <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-500">
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] block mb-0.5">Notes:</span>
              <div className="whitespace-pre-line leading-relaxed">{meta.notes}</div>
            </div>
          )}

          {/* Terms Container */}
          {meta.terms && (
            <div className="text-[10px] text-slate-400 leading-relaxed">
              <span className="font-semibold block uppercase tracking-wider text-[8px] mb-0.5 text-slate-300">Terms & Conditions:</span>
              <div className="whitespace-pre-line">{meta.terms}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
