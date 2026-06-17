'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import InvoiceMetaForm from '@/components/forms/InvoiceMetaForm';
import SellerForm from '@/components/forms/SellerForm';
import BuyerForm from '@/components/forms/BuyerForm';
import LineItemsTable from '@/components/forms/LineItemsTable';
import AdditionalCharges from '@/components/forms/AdditionalCharges';
import BankDetails from '@/components/forms/BankDetails';
import CustomizationPanel from '@/components/forms/CustomizationPanel';
import InvoicePreview from '@/components/preview/InvoicePreview';
import DraftBanner from '@/components/DraftBanner';
import HistoryDrawer from '@/components/HistoryDrawer';
import useInvoiceBuilder from '@/hooks/useInvoiceBuilder';
import { printInvoice } from '@/utils/pdfGenerator';
import Button from '@/components/ui/Button';
import { MessageCircle, Download, Printer, Save, FilePlus, Copy, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

function InvoiceBuilderContent() {
  const mockUser = { email: 'developer@example.com' };
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  
  // History Drawer state
  const [historyOpen, setHistoryOpen] = useState(false);
  // Preview mode toggle state
  const [showPreviewMode, setShowPreviewMode] = useState(false);

  // Load state and operations from our master state manager hook
  const {
    invoiceId,
    sellerInfo,
    buyerInfo,
    invoiceMeta,
    lineItems,
    additionalCharges,
    bankDetails,
    customization,
    taxMode,
    isSaving,
    isGeneratingPDF,
    errors,
    showBanner,
    draftTimestamp,
    totals,
    handleSellerChange,
    handleBuyerChange,
    handleMetaChange,
    handleLineItemsChange,
    handleAdditionalChargesChange,
    handleBankDetailsChange,
    handleCustomizationChange,
    handleSaveInvoice,
    handleDownloadPDF,
    handleNewInvoice,
    handleLoadDraft,
    handleLoadInvoice,
    handleDuplicateInvoice,
    handleDismissDraft,
  } = useInvoiceBuilder();

  // Load invoice if id query param exists on mount/change
  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          const res = await fetch(`/api/invoices/${id}`);
          if (res.ok) {
            const data = await res.json();
            handleLoadInvoice(data);
          } else {
            toast.error('Failed to load invoice');
          }
        } catch (err) {
          console.error(err);
          toast.error('Error loading invoice');
        }
      };
      fetchInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = React.useCallback(async () => {
    const saved = await handleSaveInvoice();
    if (saved && saved.id && !id) {
      router.replace(`/?id=${saved.id}`);
    }
  }, [handleSaveInvoice, id, router]);

  const handleNew = React.useCallback(() => {
    handleNewInvoice();
    if (id) {
      router.replace('/');
    }
  }, [handleNewInvoice, id, router]);

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSave]);

  // Create WhatsApp sharing payload
  const whatsappMessage = `Hi ${buyerInfo.businessName || 'Client'}, please find invoice ${
    invoiceMeta.invoiceNumber || 'Draft'
  } for ₹${totals.grandTotal?.toLocaleString('en-IN') || 0} attached. Due: ${
    invoiceMeta.dueDate || 'Immediate'
  }`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar user={mockUser} />

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Dynamic Draft Recovery Banner */}
        {showBanner && draftTimestamp && (
          <DraftBanner
            onRestore={handleLoadDraft}
            onDismiss={handleDismissDraft}
            timestamp={draftTimestamp}
          />
        )}

        {/* Top Header Bar */}
        <header className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          {!showPreviewMode ? (
            <>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#999] font-semibold">TaxFlow Editor</span>
                <span className="text-[#333]">•</span>
                <span className="text-[#555]">{invoiceId ? 'Edit Invoice' : 'Create New GST Invoice'}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Preview Trigger */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPreviewMode(true)}
                  icon={Eye}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Preview Invoice
                </Button>

                {/* History Trigger Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryOpen(true)}
                  className="text-[#888] hover:text-[#ccc] border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#252525]"
                >
                  History
                </Button>

                {/* Save Draft Action */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSave}
                  loading={isSaving}
                  icon={Save}
                  className="text-[#e2e8f0] border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#252525]"
                >
                  Save Invoice
                </Button>
                
                {/* Create New Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNew}
                  icon={FilePlus}
                  className="text-[#888] hover:text-[#ccc] border-[#2a2a2a]"
                >
                  New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewMode(false)}
                  className="text-[#e2e8f0] border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#252525] flex items-center gap-1"
                >
                  <span className="text-xs">← Back to Editor</span>
                </Button>
                <div className="hidden sm:flex items-center gap-2 text-[13px]">
                  <span className="text-[#999] font-semibold">Previewing</span>
                  <span className="text-[#555]">{invoiceMeta.invoiceNumber || 'Draft'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Download PDF Action */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadPDF}
                  loading={isGeneratingPDF}
                  icon={Download}
                  className="shadow-[0_4px_12px_rgba(94,106,210,0.15)] bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Download PDF
                </Button>

                {/* Print Action */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => printInvoice('invoice-preview-content')}
                  icon={Printer}
                  className="text-[#ccc] border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#252525]"
                >
                  Print
                </Button>

                {/* Share WhatsApp Action */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-transparent text-[#25d366] hover:bg-[#25d366]/10 border border-[#25d366]/20 transition-all cursor-pointer h-9"
                  title="Share Invoice details on WhatsApp"
                >
                  <MessageCircle size={14} className="shrink-0 text-[#25d366]" />
                  Share WhatsApp
                </a>
              </div>
            </>
          )}
        </header>

        {/* Main Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: Form Sections (Scrollable) */}
          {!showPreviewMode && (
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
              <div className="max-w-[850px] mx-auto px-6 py-8 flex flex-col gap-6">
                
                {/* Form title */}
                <div className="flex justify-between items-center pb-2 border-b border-[#1a1a1a]">
                  <div>
                    <h1 className="text-lg font-bold text-[#e2e8f0] tracking-tight">GST Invoice Generator</h1>
                    <p className="text-xs text-[#666] mt-0.5">
                      Configure details, items, bank options, and customizations.
                    </p>
                  </div>
                  
                  {/* Duplicate Invoice Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDuplicateInvoice}
                    icon={Copy}
                    className="text-[#666] hover:text-[#ccc]"
                  >
                    Duplicate
                  </Button>
                </div>

                {/* Stacked Cards */}
                <InvoiceMetaForm
                  metaData={invoiceMeta}
                  onChange={handleMetaChange}
                  errors={errors}
                />

                <SellerForm
                  sellerData={sellerInfo}
                  onChange={handleSellerChange}
                  errors={errors}
                />

                <BuyerForm
                  buyerData={buyerInfo}
                  sellerState={sellerInfo.state}
                  onChange={handleBuyerChange}
                  errors={errors}
                />

                <LineItemsTable
                  items={lineItems}
                  taxMode={taxMode}
                  onChange={handleLineItemsChange}
                  errors={errors}
                />

                <AdditionalCharges
                  charges={additionalCharges}
                  onChange={handleAdditionalChargesChange}
                  totals={totals}
                />

                <BankDetails
                  bankData={bankDetails}
                  onChange={handleBankDetailsChange}
                  errors={errors}
                  totals={totals}
                />

                <CustomizationPanel
                  customization={customization}
                  onChange={handleCustomizationChange}
                />

              </div>
            </div>
          )}

          {/* RIGHT PANEL: Live A4 PDF Preview (Sticky & Centered) */}
          {showPreviewMode && (
            <div className="flex-1 overflow-y-auto bg-[#141414] flex flex-col items-center py-8 px-6 custom-scrollbar">
              
              {/* Centered A4 Render */}
              <div className="w-full flex justify-center mb-6">
                <InvoicePreview
                  invoiceData={{
                    seller: sellerInfo,
                    buyer: buyerInfo,
                    meta: invoiceMeta,
                    lineItems,
                    additionalCharges,
                    bankDetails,
                    customization,
                    totals,
                  }}
                />
              </div>

              {/* Action Buttons below Preview */}
              <div className="w-full max-w-[794px] border-t border-[#2a2a2a] pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                  {/* Download PDF Action */}
                  <Button
                    variant="primary"
                    onClick={handleDownloadPDF}
                    loading={isGeneratingPDF}
                    icon={Download}
                    className="flex-1 sm:flex-none shadow-[0_4px_12px_rgba(94,106,210,0.15)] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6"
                  >
                    Download PDF
                  </Button>

                  {/* Print Action */}
                  <Button
                    variant="secondary"
                    onClick={() => printInvoice('invoice-preview-content')}
                    icon={Printer}
                    className="flex-1 sm:flex-none text-[#ccc] border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#252525] py-2 px-5"
                  >
                    Print
                  </Button>
                </div>

                {/* Share WhatsApp Action */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-lg bg-transparent text-[#25d366] hover:bg-[#25d366]/10 border border-[#25d366]/20 transition-all cursor-pointer"
                  title="Share Invoice details on WhatsApp"
                >
                  <MessageCircle size={14} className="shrink-0 text-[#25d366]" />
                  Share WhatsApp
                </a>
              </div>

            </div>
          )}

        </div>

        {/* History slide-over drawer */}
        <HistoryDrawer
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onLoadInvoice={handleLoadInvoice}
        />

        {/* Floating Mobile toggle preview widget */}
        <button
          type="button"
          onClick={() => {
            setShowPreviewMode(prev => !prev);
          }}
          className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg z-30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
          title={showPreviewMode ? "Back to Editor" : "Preview Invoice"}
        >
          {showPreviewMode ? <FilePlus size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
        </button>
      </div>
    </div>
  );
}

export default function InvoiceBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5e6ad2] border-t-transparent"></div>
      </div>
    }>
      <InvoiceBuilderContent />
    </Suspense>
  );
}

