'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  FileText, Search, Download, Edit2, Trash2, Check, 
  Send, Plus, ChevronLeft, ChevronRight, Calendar, Info, Loader2, ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import InvoicePreview from '@/components/preview/InvoicePreview';
import { generatePDF } from '@/utils/pdfGenerator';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3">
      <p className="text-[11px] text-[#555] uppercase tracking-wider font-semibold mb-1">{label}</p>
      <p className={`text-[20px] font-bold ${color ?? 'text-[#e2e8f0]'}`}>{value}</p>
    </div>
  );
}

export default function InvoicesListPage() {
  const router = useRouter();
  const mockUser = { email: 'developer@example.com' };

  // Query & state
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalAmount: 0, paidCount: 0, draftCount: 0, overdueCount: 0 });
  const [totalCount, setTotalCount] = useState(0);

  // PDF Generation State for List-download
  const [pdfGeneratingId, setPdfGeneratingId] = useState(null);
  const [tempInvoiceData, setTempInvoiceData] = useState(null);

  // Fetch invoices on mount & filter/page changes
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchInvoices();
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Mark invoice status (Paid/Sent)
  const handleUpdateStatus = async (id, newStatus) => {
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Invoice marked as ${newStatus}`, { id: loadingToast });
        // Refresh list
        fetchInvoices();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status', { id: loadingToast });
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (id, num) => {
    if (!confirm(`Are you sure you want to permanently delete invoice ${num}?`)) return;

    const loadingToast = toast.loading('Deleting invoice...');
    try {
      const res = await fetch(`/api/invoices/${id}?permanent=true`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Invoice ${num} deleted`, { id: loadingToast });
        fetchInvoices();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete invoice', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting invoice', { id: loadingToast });
    }
  };

  // Load and download PDF directly from list
  const handleDownloadPDFDirect = async (id, num) => {
    setPdfGeneratingId(id);
    const pdfToast = toast.loading(`Fetching invoice ${num} data...`);
    try {
      // 1. Fetch full details
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error('Failed to fetch invoice details');
      const invoice = await res.json();

      // 2. Format to match InvoicePreview prop schema
      const mapToCamelCase = (obj) => {
        if (!obj) return {};
        const mapped = {};
        Object.keys(obj).forEach((key) => {
          const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          mapped[camelKey] = obj[key];
        });
        return mapped;
      };

      const lineItemsData = invoice.line_items || [];
      const mappedItems = lineItemsData.map((item) => ({
        ...mapToCamelCase(item),
        hsnCode: item.hsnCode || item.hsn_code || '',
        discountPercent: item.discountPercent !== undefined ? item.discountPercent : (item.discount_percent || 0),
        gstRate: item.gstRate !== undefined ? item.gstRate : (item.gst_rate || 0),
        isDescriptionOnly: !!item.isDescriptionOnly || !!item.is_description_only,
      }));

      // Calculate totals
      const subTotal = parseFloat(invoice.sub_total) || 0;
      const totalTax = parseFloat(invoice.total_tax) || 0;
      const grandTotal = parseFloat(invoice.grand_total) || 0;

      const formattedData = {
        seller: mapToCamelCase(invoice.seller_data),
        buyer: mapToCamelCase(invoice.buyer_data),
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
        lineItems: mappedItems,
        additionalCharges: invoice.additional_charges || {},
        bankDetails: invoice.bank_details || {},
        customization: invoice.customization || {},
        totals: {
          subTotal,
          totalTax,
          grandTotal,
          lineItemsDiscount: 0,
          overallDiscountAmount: parseFloat(invoice.total_discount) || 0,
          taxableAmount: parseFloat(invoice.taxable_amount) || 0,
          totalCGST: parseFloat(invoice.total_cgst) || 0,
          totalSGST: parseFloat(invoice.total_sgst) || 0,
          totalIGST: parseFloat(invoice.total_igst) || 0,
          roundOffDiff: 0,
        }
      };

      // 3. Set temp invoice data to trigger mount in hidden DOM
      setTempInvoiceData(formattedData);
      toast.loading('Rendering invoice document...', { id: pdfToast });

      // 4. Bounded timeout to let React finish rendering the hidden element
      setTimeout(async () => {
        try {
          const result = await generatePDF(formattedData, 'list-invoice-preview-content');
          toast.success(`Downloaded: ${result.filename}`, { id: pdfToast });
        } catch (pdfErr) {
          console.error(pdfErr);
          toast.error('Failed to render PDF. Please edit & download.', { id: pdfToast });
        } finally {
          setTempInvoiceData(null);
          setPdfGeneratingId(null);
        }
      }, 800);

    } catch (err) {
      console.error(err);
      toast.error('Error generating PDF', { id: pdfToast });
      setPdfGeneratingId(null);
      setTempInvoiceData(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      unpaid:    'bg-orange-500/10 text-orange-400 border-orange-500/20',
      sent:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
      overdue:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
      draft:     'bg-[#222] text-[#888] border-[#333]',
      cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border ${styles[status] ?? styles.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={mockUser} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Invoices</span>
          </div>
          <a href="/?new=true" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5e6ad2] hover:bg-[#4f5abf] text-white text-[12px] font-medium transition-colors">
            <Plus size={13} strokeWidth={2.5} />
            New Invoice
          </a>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            
            {/* Header info */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-[#e2e8f0]">GST Invoices</h1>
                <p className="text-xs text-[#555] mt-1">
                  Manage invoice listings, update payment status, and download records.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard 
                label="Invoiced Total" 
                value={loading ? <div className="h-6 bg-[#222] rounded w-24 my-0.5 animate-pulse" /> : `₹${(summary.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
              />
              <StatCard 
                label="Paid Status" 
                value={loading ? <div className="h-6 bg-[#222] rounded w-10 my-0.5 animate-pulse" /> : summary.paidCount || '0'} 
                color="text-emerald-400" 
              />
              <StatCard 
                label="Pending Sent" 
                value={loading ? <div className="h-6 bg-[#222] rounded w-10 my-0.5 animate-pulse" /> : totalCount - (summary.paidCount + summary.draftCount) || '0'} 
                color="text-blue-400" 
              />
              <StatCard 
                label="Drafts" 
                value={loading ? <div className="h-6 bg-[#222] rounded w-10 my-0.5 animate-pulse" /> : summary.draftCount || '0'} 
                color="text-[#999]" 
              />
            </div>

            {/* Filter bar */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-3 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-2.5 text-[#555]" />
                <input 
                  type="text"
                  placeholder="Search invoice number, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-[13px] text-[#ccc] focus:outline-none focus:border-[#3a3a3a] transition-all placeholder-[#555]"
                />
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[12px] text-[#555] font-medium shrink-0">Filter Status:</span>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="w-full sm:w-40 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md text-[13px] text-[#ccc] focus:outline-none focus:border-[#3a3a3a] transition-colors cursor-pointer"
                >
                  <option value="">All Invoices</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Invoices List Table */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2a2a2a] bg-[#141414] text-[11px] text-[#555] uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Invoice Number</th>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-24"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-32"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-20"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded w-20"></div></td>
                          <td className="px-4 py-4 text-right"><div className="h-4 bg-[#222] rounded w-16 ml-auto"></div></td>
                          <td className="px-4 py-4 text-center"><div className="h-5 bg-[#222] rounded-full w-14 mx-auto"></div></td>
                          <td className="px-4 py-4 text-center"><div className="h-4 bg-[#222] rounded w-16 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <Info size={24} className="text-[#333] mx-auto mb-2" />
                          <p className="text-xs text-[#555]">No invoices found matching criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="text-[13px] hover:bg-[#141414] transition-colors group">
                          {/* Invoice Num */}
                          <td className="px-4 py-3.5 font-medium text-[#ccc] group-hover:text-[#e2e8f0]">
                            <a href={`/?id=${inv.id}`} className="hover:underline flex items-center gap-1.5 font-mono text-blue-500">
                              {inv.invoice_number}
                              <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </td>

                          {/* Client Name */}
                          <td className="px-4 py-3.5 text-[#aaa] font-medium max-w-[150px] truncate" title={inv.buyer_data?.business_name}>
                            {inv.buyer_data?.business_name || 'No client name'}
                          </td>

                          {/* Invoice Date */}
                          <td className="px-4 py-3.5 text-[#555]">
                            {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>

                          {/* Due Date */}
                          <td className="px-4 py-3.5 text-[#555]">
                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Immediate'}
                          </td>

                          {/* Grand Total */}
                          <td className="px-4 py-3.5 text-right font-semibold text-[#ccc] group-hover:text-[#e2e8f0]">
                            ₹{(parseFloat(inv.grand_total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5 text-center">
                            {getStatusBadge(inv.status || 'draft')}
                          </td>

                          {/* Actions buttons */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit */}
                              <button
                                onClick={() => router.push(`/?id=${inv.id}`)}
                                className="p-1 rounded text-[#555] hover:text-[#ccc] hover:bg-[#222] transition-all"
                                title="Edit Invoice"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Download PDF */}
                              <button
                                onClick={() => handleDownloadPDFDirect(inv.id, inv.invoice_number)}
                                disabled={pdfGeneratingId === inv.id}
                                className="p-1 rounded text-[#555] hover:text-blue-400 hover:bg-[#222] transition-all disabled:opacity-50"
                                title="Download PDF"
                              >
                                {pdfGeneratingId === inv.id ? (
                                  <Loader2 size={13} className="animate-spin text-blue-500" />
                                ) : (
                                  <Download size={13} />
                                )}
                              </button>

                              {/* Mark as Paid */}
                              {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateStatus(inv.id, 'paid')}
                                  className="p-1 rounded text-[#555] hover:text-emerald-500 hover:bg-[#222] transition-all"
                                  title="Mark as Paid"
                                >
                                  <Check size={13} />
                                </button>
                              )}

                              {/* Mark as Sent */}
                              {inv.status === 'draft' && (
                                <button
                                  onClick={() => handleUpdateStatus(inv.id, 'sent')}
                                  className="p-1 rounded text-[#555] hover:text-blue-500 hover:bg-[#222] transition-all"
                                  title="Mark as Sent"
                                >
                                  <Send size={13} />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                                className="p-1 rounded text-[#555] hover:text-rose-500 hover:bg-[#222] transition-all"
                                title="Delete Invoice"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="bg-[#141414] border-t border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
                  <div className="text-[12px] text-[#555]">
                    Showing <span className="font-semibold text-[#888]">{invoices.length}</span> of <span className="font-semibold text-[#888]">{totalCount}</span> invoices
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-[#ccc] hover:bg-[#222] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[12px] text-[#888] px-2">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded border border-[#2a2a2a] text-[#888] hover:text-[#ccc] hover:bg-[#222] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Hidden Render Target for direct PDF downloads */}
      {tempInvoiceData && (
        <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none select-none bg-white">
          <div id="list-invoice-preview-content" style={{ width: '794px' }}>
            <InvoicePreview invoiceData={tempInvoiceData} />
          </div>
        </div>
      )}
    </div>
  );
}
