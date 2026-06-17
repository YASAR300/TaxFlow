import sql from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { FileText, Users, TrendingUp, Clock, ArrowUpRight, Plus } from 'lucide-react';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 hover:border-[#3a3a3a] transition-colors">
      <p className="text-[11px] text-[#555] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-[22px] font-semibold ${color ?? 'text-[#e2e8f0]'} leading-none`}>{value}</p>
      {sub && <p className="text-[11px] text-[#555] mt-1">{sub}</p>}
    </div>
  );
}

function ActivityItem({ href, icon, title, desc, time, status }) {
  const statusColors = {
    paid:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    unpaid:    'bg-orange-500/20 text-orange-400 border-orange-500/30',
    sent:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
    overdue:   'bg-rose-500/20 text-rose-400 border-rose-500/30',
    draft:     'bg-[#2a2a2a] text-[#888] border-[#333]',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <a href={href} className="flex items-start gap-3 py-3 border-b border-[#1e1e1e] last:border-0 hover:bg-[#141414] -mx-4 px-4 transition-colors cursor-pointer group">
      <div className="w-7 h-7 rounded-full bg-[#252525] border border-[#2a2a2a] flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[#ccc] font-medium truncate">{title}</span>
          {status && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColors[status] ?? statusColors.draft}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#555] mt-0.5 truncate">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-[#444]">{time}</span>
        <ArrowUpRight size={12} className="text-[#333] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
}

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // DB queries executed in parallel on the server
  const [statsRes, clientsRes, recentInvoices] = await Promise.all([
    sql`
      SELECT 
        COUNT(*)::integer AS total_invoices,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END), 0)::float AS total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN grand_total ELSE 0 END), 0)::float AS pending_revenue
      FROM invoices
      WHERE status != 'cancelled'
    `,
    sql`SELECT COUNT(*)::integer AS total_clients FROM clients`,
    sql`
      SELECT id, invoice_number, invoice_date, grand_total::float, status, buyer_data->>'business_name' AS client_name
      FROM invoices
      ORDER BY invoice_date DESC, created_at DESC
      LIMIT 5
    `
  ]);

  const stats = statsRes[0] || { total_invoices: 0, total_revenue: 0, pending_revenue: 0 };
  const totalClients = clientsRes[0]?.total_clients || 0;

  const totalInvoicesStr = stats.total_invoices > 0 ? stats.total_invoices.toString() : '0';
  const totalClientsStr = totalClients > 0 ? totalClients.toString() : '0';
  const revenueStr = '₹' + (stats.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const pendingStr = '₹' + (stats.pending_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-[#e2e8f0] overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-[13px] text-[#555]">
            <span>TaxFlow</span>
            <span>/</span>
            <span className="text-[#999]">Dashboard</span>
          </div>
          <a href="/?new=true" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5e6ad2] hover:bg-[#4f5abf] text-white text-[12px] font-medium transition-colors">
            <Plus size={13} strokeWidth={2.5} />
            New Invoice
          </a>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="mb-6">
              <h1 className="text-[22px] font-semibold text-[#e2e8f0] leading-tight">Dashboard</h1>
              <p className="text-[13px] text-[#555] mt-1">{today}</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Invoices" value={totalInvoicesStr} sub={`${totalInvoicesStr} generated`} />
              <StatCard label="Total Clients" value={totalClientsStr} sub={`${totalClientsStr} registered`} />
              <StatCard label="Revenue (Paid)" value={revenueStr} sub="Received earnings" color="text-emerald-400" />
              <StatCard label="Pending" value={pendingStr} sub="Unpaid balance" color="text-orange-400" />
            </div>

            {/* Recent activity block */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
                <h2 className="text-[13px] font-semibold text-[#e2e8f0]">Activity Feed</h2>
                <a href="/invoices" className="text-[12px] text-[#555] hover:text-[#999] transition-colors">View all</a>
              </div>
              <div className="px-4">
                {recentInvoices && recentInvoices.length > 0 ? (
                  recentInvoices.map((inv) => (
                    <ActivityItem 
                      key={inv.id}
                      href={`/?id=${inv.id}`}
                      icon={<FileText size={13} className="text-[#5e6ad2]" />}
                      title={`Invoice ${inv.invoice_number}`}
                      desc={`Billed ₹${inv.grand_total.toLocaleString('en-IN')} to ${inv.client_name}`}
                      time={new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      status={inv.status}
                    />
                  ))
                ) : (
                  <>
                    <ActivityItem href="/" icon={<FileText size={13} className="text-[#5e6ad2]" />} title="Welcome to TaxFlow GST" desc="Start by creating your first GST invoice" time="just now" status="draft" />
                    <ActivityItem href="/clients" icon={<Users size={13} className="text-[#888]" />} title="Add your first client" desc="Go to Clients → Add client to get started" time="" />
                    <ActivityItem href="/seller" icon={<TrendingUp size={13} className="text-emerald-400" />} title="Configure your business details" desc="Set your GSTIN, business name, and address in Business settings" time="" />
                  </>
                )}
              </div>
              
              {(!recentInvoices || recentInvoices.length === 0) && (
                <div className="border-t border-[#1e1e1e] px-4 py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-3">
                    <Clock size={16} className="text-[#444]" />
                  </div>
                  <p className="text-[13px] text-[#555] mb-3">No invoices created yet</p>
                  <a href="/?new=true" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#2a2a2a] hover:border-[#3a3a3a] text-[12px] text-[#888] hover:text-[#ccc] transition-all">
                    <Plus size={12} />
                    Create your first invoice
                  </a>
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {[
                { label: 'New Invoice', desc: 'Generate a GST invoice', href: '/', color: 'text-[#5e6ad2]', icon: <FileText size={15} /> },
                { label: 'Add Client', desc: 'Save client details', href: '/clients', color: 'text-emerald-400', icon: <Users size={15} /> },
                { label: 'Business Setup', desc: 'Your seller info & GSTIN', href: '/seller', color: 'text-orange-400', icon: <TrendingUp size={15} /> },
              ].map((item) => (
                <a key={item.href} href={item.href} className="bg-[#111111] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3a3a3a] hover:bg-[#141414] transition-all group">
                  <div className={`${item.color} mb-2`}>{item.icon}</div>
                  <p className="text-[13px] font-medium text-[#ccc] group-hover:text-[#e2e8f0] transition-colors">{item.label}</p>
                  <p className="text-[12px] text-[#555] mt-0.5">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
