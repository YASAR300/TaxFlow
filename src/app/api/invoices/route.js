import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions } from '@/utils/apiHelper';
import { calculateInvoiceTotals } from '@/utils/taxCalculations';
import { getCurrentFinancialYear, getDueDate } from '@/utils/invoiceHelpers';
import { numberToWords } from '@/utils/indianFormat';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(invoice_number ILIKE $${params.length} OR buyer_data->>'business_name' ILIKE $${params.length})`);
    }

    if (from) {
      params.push(from);
      conditions.push(`invoice_date >= $${params.length}`);
    }

    if (to) {
      params.push(to);
      conditions.push(`invoice_date <= $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*)::integer as total,
        COALESCE(SUM(grand_total), 0)::float as total_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END)::integer as paid_count,
        COUNT(CASE WHEN status = 'draft' THEN 1 END)::integer as draft_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END)::integer as overdue_count
      FROM invoices
      ${whereClause}
    `;

    const summaryResult = await sql(summaryQuery, params);
    const summaryRow = summaryResult[0] || { total: 0, total_amount: 0, paid_count: 0, draft_count: 0, overdue_count: 0 };

    const total = summaryRow.total;
    const limitNum = parseInt(limit, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;

    // Fetch invoices
    const invoicesQuery = `
      SELECT * FROM invoices
      ${whereClause}
      ORDER BY invoice_date DESC, created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const invoices = await sql(invoicesQuery, params);

    return getCorsResponse({
      invoices,
      total,
      page: pageNum,
      totalPages,
      summary: {
        totalAmount: summaryRow.total_amount,
        paidCount: summaryRow.paid_count,
        draftCount: summaryRow.draft_count,
        overdueCount: summaryRow.overdue_count,
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const invoice_number = body.invoice_number || body.invoiceNumber;
    const invoice_type = body.invoice_type || body.invoiceType || 'Tax Invoice';
    const invoice_date = body.invoice_date || body.invoiceDate;
    const payment_terms = body.payment_terms || body.paymentTerms;
    const tax_mode = body.tax_mode || body.taxMode || 'intrastate';
    const status = body.status || 'draft';
    const seller_data = body.seller_data || body.sellerData;
    const buyer_data = body.buyer_data || body.buyerData;
    const line_items = body.line_items || body.lineItems || [];
    const additional_charges = body.additional_charges || body.additionalCharges || {};
    const bank_details = body.bank_details || body.bankDetails || {};
    const customization = body.customization || {};
    const notes = body.notes;
    const terms = body.terms;

    // Validation
    if (!invoice_number) return getErrorResponse('Invoice number is required', 400);
    if (!invoice_date) return getErrorResponse('Invoice date is required', 400);
    if (!line_items || line_items.length === 0) return getErrorResponse('At least one line item is required', 400);
    if (!seller_data || !seller_data.business_name) return getErrorResponse('Seller business name is required', 400);
    if (!buyer_data || !buyer_data.business_name) return getErrorResponse('Buyer business name is required', 400);

    // Uniqueness
    const duplicate = await sql`SELECT id FROM invoices WHERE invoice_number = ${invoice_number} LIMIT 1`;
    if (duplicate.length > 0) {
      return getErrorResponse('Invoice number already exists', 400);
    }

    // Calculations
    const totals = calculateInvoiceTotals(line_items, additional_charges, tax_mode);
    const amount_in_words = numberToWords(totals.grandTotal);
    const financial_year = getCurrentFinancialYear();
    const due_date = body.due_date || body.dueDate || getDueDate(invoice_date, payment_terms);

    // Save invoice
    const invoiceResult = await sql`
      INSERT INTO invoices (
        invoice_number, invoice_type, invoice_date, due_date, financial_year,
        place_of_supply, payment_terms, tax_mode, status,
        seller_data, buyer_data, line_items, additional_charges, bank_details, customization,
        sub_total, total_discount, taxable_amount, total_cgst, total_sgst, total_igst,
        total_tax, grand_total, amount_in_words, notes, terms
      ) VALUES (
        ${invoice_number}, ${invoice_type}, ${invoice_date}, ${due_date || null}, ${financial_year},
        ${buyer_data.state || null}, ${payment_terms || null}, ${tax_mode}, ${status},
        ${JSON.stringify(seller_data)}, ${JSON.stringify(buyer_data)}, ${JSON.stringify(totals.calculatedItems)},
        ${JSON.stringify(additional_charges)}, ${JSON.stringify(bank_details)}, ${JSON.stringify(customization)},
        ${totals.subTotal}, ${totals.overallDiscountAmount + totals.lineItemsDiscount}, ${totals.taxableAmount},
        ${totals.totalCGST}, ${totals.totalSGST}, ${totals.totalIGST},
        ${totals.totalTax}, ${totals.grandTotal}, ${amount_in_words}, ${notes || null}, ${terms || null}
      )
      RETURNING *
    `;

    const createdInvoice = invoiceResult[0];

    // Insert line items
    for (let i = 0; i < totals.calculatedItems.length; i++) {
      const item = totals.calculatedItems[i];
      await sql`
        INSERT INTO invoice_items (
          invoice_id, sr_no, description, hsn_code, quantity, unit, rate,
          discount_percent, gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_amount
        ) VALUES (
          ${createdInvoice.id}, ${i + 1}, ${item.description}, ${item.hsnCode || item.hsn_code || null},
          ${item.quantity || 0}, ${item.unit || 'PCS'}, ${item.rate || 0},
          ${item.discountPercent || item.discount_percent || 0}, ${item.gstRate || item.gst_rate || 0},
          ${item.taxableAmount}, ${item.cgstAmount}, ${item.sgstAmount}, ${item.igstAmount}, ${item.totalAmount}
        )
      `;
    }

    // Update client total invoiced and invoice count
    let clientMatch = null;
    if (buyer_data.gstin && buyer_data.gstin.trim()) {
      const res = await sql`SELECT id FROM clients WHERE gstin = ${buyer_data.gstin.trim()} LIMIT 1`;
      if (res.length > 0) clientMatch = res[0];
    }
    if (!clientMatch && buyer_data.email && buyer_data.email.trim()) {
      const res = await sql`SELECT id FROM clients WHERE email = ${buyer_data.email.trim()} LIMIT 1`;
      if (res.length > 0) clientMatch = res[0];
    }

    if (clientMatch) {
      const invoiceVal = status === 'cancelled' ? 0 : totals.grandTotal;
      const invoiceCountInc = status === 'cancelled' ? 0 : 1;
      await sql`
        UPDATE clients
        SET
          invoice_count = invoice_count + ${invoiceCountInc},
          total_invoiced = total_invoiced + ${invoiceVal},
          updated_at = NOW()
        WHERE id = ${clientMatch.id}
      `;
    }

    return getCorsResponse(createdInvoice, 201);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
