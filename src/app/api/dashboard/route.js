import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions } from '@/utils/apiHelper';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const dashboardQuery = `
      WITH stats AS (
        SELECT 
          COUNT(*)::integer AS total_invoices,
          COALESCE(SUM(CASE WHEN status != 'cancelled' THEN grand_total ELSE 0 END), 0)::float AS total_revenue,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END), 0)::float AS paid_revenue,
          COALESCE(SUM(CASE WHEN status IN ('sent', 'overdue') THEN grand_total ELSE 0 END), 0)::float AS pending_revenue,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END)::integer AS overdue_count,
          COALESCE(SUM(CASE WHEN status != 'cancelled' AND date_trunc('month', invoice_date) = date_trunc('month', CURRENT_DATE) THEN grand_total ELSE 0 END), 0)::float AS this_month_revenue,
          COALESCE(SUM(CASE WHEN status != 'cancelled' AND date_trunc('month', invoice_date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') THEN grand_total ELSE 0 END), 0)::float AS last_month_revenue
        FROM invoices
      ),
      recent AS (
        SELECT COALESCE(json_agg(r), '[]'::json) AS recent_invoices
        FROM (
          SELECT id, invoice_number, invoice_date, grand_total::float, status, buyer_data->>'business_name' AS client_name
          FROM invoices
          ORDER BY invoice_date DESC, created_at DESC
          LIMIT 5
        ) r
      ),
      top_clients_cte AS (
        SELECT COALESCE(json_agg(tc), '[]'::json) AS top_clients
        FROM (
          SELECT id, business_name, total_invoiced::float, invoice_count
          FROM clients
          ORDER BY total_invoiced DESC, business_name ASC
          LIMIT 3
        ) tc
      )
      SELECT 
        s.total_invoices AS "totalInvoices",
        s.total_revenue AS "totalRevenue",
        s.paid_revenue AS "paidRevenue",
        s.pending_revenue AS "pendingRevenue",
        s.overdue_count AS "overdueCount",
        s.this_month_revenue AS "thisMonthRevenue",
        s.last_month_revenue AS "lastMonthRevenue",
        r.recent_invoices AS "recentInvoices",
        t.top_clients AS "topClients"
      FROM stats s
      CROSS JOIN recent r
      CROSS JOIN top_clients_cte t;
    `;

    const result = await sql(dashboardQuery);
    const data = result[0] || {
      totalInvoices: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      overdueCount: 0,
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      recentInvoices: [],
      topClients: []
    };

    return getCorsResponse(data);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
