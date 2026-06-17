import sql from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  BarChart3, TrendingUp, IndianRupee, FileSpreadsheet, 
  ArrowUpRight, Landmark, Tag, Users, CheckCircle, Percent
} from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] text-[#555] uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className={`text-[22px] font-bold ${color ?? 'text-[#e2e8f0]'}`}>{value}</p>
        {sub && <p className="text-[11px] text-[#555] mt-1">{sub}</p>}
      </div>
      <div className={`w-8 h-8 rounded bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center ${color ?? 'text-[#888]'}`}>
        <Icon size={15} />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Execute database analytics queries in parallel on the server
  const [
    revenueRes,
    taxBrakdownRes,
    monthlyTrendRes,
    topItemsRes,
    topClientsRes
  ] = await Promise.all([
    // Total Sales & Tax (All active invoices)
    sql`
      SELECT 
        COALESCE(SUM(grand_total), 0)::float AS total_sales,
        COALESCE(SUM(taxable_amount), 0)::float AS taxable_sales,
        COALESCE(SUM(total_tax), 0)::float AS total_tax,
        COALESCE(SUM(total_cgst), 0)::float AS cgst,
        COALESCE(SUM(total_sgst), 0)::float AS sgst,
        COALESCE(SUM(total_igst), 0)::float AS igst
      FROM invoices
      WHERE status != 'cancelled'
    `,
    // GST Tax Slab Breakdown (Filtered to non-cancelled invoices)
    sql`
      SELECT 
        ii.gst_rate::float AS slab,
        COUNT(ii.id)::integer AS item_count,
        COALESCE(SUM(ii.taxable_amount), 0)::float AS taxable_amount,
        COALESCE(SUM(ii.cgst_amount + ii.sgst_amount + ii.igst_amount), 0)::float AS tax_amount
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.status != 'cancelled'
      GROUP BY ii.gst_rate
      ORDER BY ii.gst_rate ASC
    `,
    // Monthly Sales & Tax Trends (6-Month list)
    sql`
      SELECT 
        to_char(invoice_date, 'Mon YYYY') AS month_label,
        date_trunc('month', invoice_date) AS month_date,
        COALESCE(SUM(grand_total), 0)::float AS sales,
        COALESCE(SUM(total_tax), 0)::float AS tax
      FROM invoices
      WHERE status != 'cancelled'
      GROUP BY month_label, month_date
      ORDER BY month_date ASC
      LIMIT 6
    `,
    // Top Selling products / services (Filtered to non-cancelled invoices)
    sql`
      SELECT 
        ii.description,
        COUNT(ii.id)::integer AS sales_count,
        COALESCE(SUM(ii.quantity), 0)::float AS total_qty,
        COALESCE(SUM(ii.taxable_amount), 0)::float AS revenue
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.status != 'cancelled'
      GROUP BY ii.description
      ORDER BY revenue DESC
      LIMIT 5
    `,
    // Top invoiced Clients (Computed dynamically to ensure real-time accuracy)
    sql`
      SELECT 
        c.business_name,
        COALESCE(COUNT(CASE WHEN i.status != 'cancelled' THEN 1 END), 0)::integer AS invoice_count,
        COALESCE(SUM(CASE WHEN i.status != 'cancelled' THEN i.grand_total ELSE 0 END), 0)::float AS total_invoiced
      FROM clients c
      LEFT JOIN invoices i ON 
        (c.gstin IS NOT NULL AND c.gstin = i.buyer_data->>'gstin') 
        OR (c.email IS NOT NULL AND c.email = i.buyer_data->>'email') 
        OR (c.business_name = i.buyer_data->>'business_name')
      GROUP BY c.id, c.business_name
      ORDER BY total_invoiced DESC
      LIMIT 5
    `
  ]);

  const summary = revenueRes[0] || { total_sales: 0, taxable_sales: 0, total_tax: 0, cgst: 0, sgst: 0, igst: 0 };
  const taxSlabs = taxBrakdownRes || [];
  const monthlyTrend = monthlyTrendRes || [];
  const topItems = topItemsRes || [];
  const topClients = topClientsRes || [];

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Analytics</span>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-[#e2e8f0]">GST Reporting & Analytics</h1>
              <p className="text-xs text-[#555] mt-1">
                Overview of total collections, GST slab summaries, and client revenue distributions.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <StatCard 
                label="Total Sales" 
                value={`₹${summary.total_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                sub="All active invoices sales"
                icon={IndianRupee}
                color="text-[#5e6ad2]"
              />
              <StatCard 
                label="Taxable Amount" 
                value={`₹${summary.taxable_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                sub="Excluding taxes"
                icon={TrendingUp}
                color="text-[#5e6ad2]"
              />
              <StatCard 
                label="GST Collected" 
                value={`₹${summary.total_tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                sub="CGST + SGST + IGST"
                icon={FileSpreadsheet}
                color="text-orange-400"
              />
            </div>

            {/* Split GST Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-center">
                <span className="text-[10px] text-[#555] font-bold uppercase tracking-wider block mb-1">CGST (Central Tax)</span>
                <span className="text-base font-mono font-bold text-[#ccc]">₹{summary.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-center">
                <span className="text-[10px] text-[#555] font-bold uppercase tracking-wider block mb-1">SGST (State Tax)</span>
                <span className="text-base font-mono font-bold text-[#ccc]">₹{summary.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-center">
                <span className="text-[10px] text-[#555] font-bold uppercase tracking-wider block mb-1">IGST (Integrated Tax)</span>
                <span className="text-base font-mono font-bold text-[#ccc]">₹{summary.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* GST Slab Table (GSTR-1 Ready) */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[#e2e8f0] flex items-center gap-1.5">
                    <Percent size={13} className="text-orange-400" />
                    GST Slab Breakdown (GSTR-1)
                  </h3>
                </div>
                <div className="p-2">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="text-[#555] border-b border-[#2a2a2a] font-bold">
                        <th className="px-3 py-2">Slab Rate</th>
                        <th className="px-3 py-2 text-right">Items Count</th>
                        <th className="px-3 py-2 text-right">Taxable Amount (₹)</th>
                        <th className="px-3 py-2 text-right">Tax Collected (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {taxSlabs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-[#555]">No tax data recorded yet.</td>
                        </tr>
                      ) : (
                        taxSlabs.map((s, idx) => (
                          <tr key={idx} className="hover:bg-[#141414] transition-colors">
                            <td className="px-3 py-2.5 font-semibold text-[#ccc]">{s.slab}% GST</td>
                            <td className="px-3 py-2.5 text-right text-[#888]">{s.item_count}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-[#ccc]">₹{s.taxable_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-orange-400 font-medium">₹{s.tax_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Sales Performance */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold text-[#e2e8f0] flex items-center gap-1.5">
                    <Landmark size={13} className="text-[#5e6ad2]" />
                    Monthly Sales Trend (Past 6 Months)
                  </h3>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  {monthlyTrend.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#555]">No trends data available.</p>
                  ) : (
                    monthlyTrend.map((m, idx) => {
                      // Compute basic percentage bar based on max values
                      const maxVal = Math.max(...monthlyTrend.map(x => x.sales)) || 1;
                      const widthPercent = Math.min(Math.max((m.sales / maxVal) * 100, 4), 100);

                      return (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-[#ccc] font-medium">{m.month_label}</span>
                            <div className="flex gap-2">
                              <span className="text-[#888]">Sales: <b className="text-[#ccc]">₹{m.sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b></span>
                              <span className="text-[#555]">Tax: <b className="text-orange-400/80">₹{m.tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b></span>
                            </div>
                          </div>
                          <div className="w-full bg-[#1c1c1c] h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#5e6ad2] to-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Selling Items */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center gap-1.5">
                  <Tag size={13} className="text-yellow-500" />
                  <h3 className="text-[12px] font-semibold text-[#e2e8f0]">Top Invoiced Items / Services</h3>
                </div>
                <div className="p-2">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="text-[#555] border-b border-[#2a2a2a] font-bold">
                        <th className="px-3 py-2">Item Description</th>
                        <th className="px-3 py-2 text-right">Invoiced Qty</th>
                        <th className="px-3 py-2 text-right">Revenue (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {topItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-[#555]">No item logs registered.</td>
                        </tr>
                      ) : (
                        topItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#141414] transition-colors">
                            <td className="px-3 py-2.5 font-medium text-[#ccc] truncate max-w-[200px]" title={item.description}>
                              {item.description}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#888] font-mono">{item.total_qty}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-[#ccc]">₹{item.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Client Accounts */}
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e1e1e] flex items-center gap-1.5">
                  <Users size={13} className="text-emerald-500" />
                  <h3 className="text-[12px] font-semibold text-[#e2e8f0]">Top Client Billing Distribution</h3>
                </div>
                <div className="p-2">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="text-[#555] border-b border-[#2a2a2a] font-bold">
                        <th className="px-3 py-2">Client Business Name</th>
                        <th className="px-3 py-2 text-right">Invoice Count</th>
                        <th className="px-3 py-2 text-right">Total Invoiced (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e]">
                      {topClients.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-[#555]">No clients registered.</td>
                        </tr>
                      ) : (
                        topClients.map((client, idx) => (
                          <tr key={idx} className="hover:bg-[#141414] transition-colors">
                            <td className="px-3 py-2.5 font-medium text-[#ccc] truncate max-w-[200px]" title={client.business_name}>
                              {client.business_name}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[#888] font-mono">{client.invoice_count}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-400">₹{client.total_invoiced.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
