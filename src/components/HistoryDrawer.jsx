'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, Download, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatINR } from '@/utils/indianFormat';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { generatePDF } from '@/utils/pdfGenerator';

/**
 * HistoryDrawer - Slide-in panel displaying recently saved invoices.
 * 
 * Props:
 * - isOpen (boolean): Controlled open state
 * - onClose (function): Callback to close the drawer
 * - onLoadInvoice (function): Callback to populate editor state with selected invoice data
 */
export default function HistoryDrawer({ isOpen, onClose, onLoadInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch invoices list on mount when opened
  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices?limit=20');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      } else {
        toast.error('Failed to load invoice history');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      toast.error('Error connecting to the database');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId, invoiceNumber, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/invoices/${invoiceId}?permanent=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Invoice ${invoiceNumber} deleted permanently`);
        // Filter out of local state list
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      } else {
        toast.error('Failed to delete invoice');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error deleting invoice from database');
    }
  };

  const handleDownload = async (invoice, e) => {
    e.stopPropagation();
    const downloadToastId = toast.loading(`Preparing PDF for ${invoice.invoice_number}...`);
    try {
      // First load the invoice into the editor to mount the values in the A4 preview DOM
      onLoadInvoice(invoice);
      
      // Let the DOM update in a brief timeout, then trigger html2canvas capture
      setTimeout(async () => {
        try {
          // Re-map db snake_case JSON objects to camelCase for the PDF metadata builder
          const mappedInvoice = {
            seller: invoice.seller_data || {},
            buyer: invoice.buyer_data || {},
            meta: {
              invoiceNumber: invoice.invoice_number,
              invoiceType: invoice.invoice_type,
              invoiceDate: invoice.invoice_date,
              dueDate: invoice.due_date,
              financialYear: invoice.financial_year,
              placeOfSupply: invoice.place_of_supply,
              paymentTerms: invoice.payment_terms,
              status: invoice.status,
              notes: invoice.notes,
              terms: invoice.terms,
            },
            lineItems: invoice.line_items || [],
            additionalCharges: invoice.additional_charges || {},
            bankDetails: invoice.bank_details || {},
            customization: invoice.customization || {},
          };
          
          await generatePDF(mappedInvoice, 'invoice-preview-content');
          toast.success(`PDF downloaded successfully!`, { id: downloadToastId });
        } catch (err) {
          console.error(err);
          toast.error('Failed to generate PDF capture.', { id: downloadToastId });
        }
      }, 200);
    } catch (err) {
      console.error(err);
      toast.error('Error preparation failed.', { id: downloadToastId });
    }
  };

  const formatDateString = (dateInput) => {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* 1. Backdrop Blur Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        />
      )}

      {/* 2. Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none text-slate-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="font-bold text-slate-900 tracking-tight text-sm">Invoice History</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            title="Close History Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-xs text-slate-400 font-medium">Fetching history records...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileText size={48} className="text-slate-200 mb-3" />
              <span className="text-sm font-semibold text-slate-700">No invoices yet</span>
              <span className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Create your first invoice above to see records here
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {invoices.map((inv) => {
                const buyer = inv.buyer_data || inv.buyerData || {};
                const buyerName = buyer.business_name || buyer.businessName || 'Unnamed Buyer';
                const totalAmount = parseFloat(inv.grand_total) || 0;

                return (
                  <div
                    key={inv.id}
                    className="group border border-slate-100 rounded-lg p-3 bg-white hover:bg-slate-50/50 hover:border-slate-200 transition-all shadow-sm flex flex-col gap-2 relative"
                  >
                    {/* Invoice Meta header */}
                    <div className="flex justify-between items-start">
                      <span className="font-bold font-mono text-blue-600 text-xs">
                        {inv.invoice_number}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>

                    {/* Buyer & Date details */}
                    <div className="flex flex-col text-[11px] text-slate-500">
                      <span className="text-slate-700 font-medium truncate text-xs">
                        {buyerName}
                      </span>
                      <span className="text-[10px] mt-0.5">
                        Date: {formatDateString(inv.invoice_date)}
                      </span>
                    </div>

                    {/* Grand Total */}
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Total:</span>
                      <span className="font-mono font-semibold text-slate-900 text-xs">
                        {formatINR(totalAmount)}
                      </span>
                    </div>

                    {/* Hover Actions Bar */}
                    <div className="absolute inset-0 bg-slate-50/95 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-6 z-10">
                      {/* Edit Eye */}
                      <button
                        type="button"
                        onClick={() => {
                          onLoadInvoice(inv);
                          onClose();
                        }}
                        className="p-2 bg-white hover:bg-blue-50 text-blue-600 border border-slate-100 rounded-lg shadow-sm hover:scale-105 transition-all"
                        title="Load for Editing"
                      >
                        <Eye size={15} />
                      </button>

                      {/* Download */}
                      <button
                        type="button"
                        onClick={(e) => handleDownload(inv, e)}
                        className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-100 rounded-lg shadow-sm hover:scale-105 transition-all"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>

                      {/* Trash */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(inv.id, inv.invoice_number, e)}
                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-100 rounded-lg shadow-sm hover:scale-105 transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-[10px] text-slate-400">
          Showing up to 20 recent records
        </div>
      </div>
    </>
  );
}
