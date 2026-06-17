import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions, isValidUUID } from '@/utils/apiHelper';
import { generateInvoiceNumber, getDueDate, todayISO } from '@/utils/invoiceHelpers';

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req, { params }) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      return getErrorResponse('Invalid invoice ID format', 400);
    }

    // Fetch source invoice
    const sourceResult = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (sourceResult.length === 0) {
      return getErrorResponse('Source invoice not found', 404);
    }

    const source = sourceResult[0];

    // Fetch existing invoice numbers to auto-increment
    const existing = await sql`SELECT invoice_number FROM invoices`;
    const existingNumbers = existing.map(inv => inv.invoice_number);
    const new_invoice_number = generateInvoiceNumber(existingNumbers);

    // Calculate dates
    const today = todayISO();
    const new_due_date = getDueDate(today, source.payment_terms);

    // Insert duplicated invoice
    const insertResult = await sql`
      INSERT INTO invoices (
        invoice_number, invoice_type, invoice_date, due_date, financial_year,
        place_of_supply, payment_terms, tax_mode, status,
        seller_data, buyer_data, line_items, additional_charges, bank_details, customization,
        sub_total, total_discount, taxable_amount, total_cgst, total_sgst, total_igst,
        total_tax, grand_total, amount_in_words, notes, terms
      ) VALUES (
        ${new_invoice_number}, ${source.invoice_type}, ${today}, ${new_due_date || null}, ${source.financial_year},
        ${source.place_of_supply}, ${source.payment_terms}, ${source.tax_mode}, 'draft',
        ${source.seller_data}, ${source.buyer_data}, ${source.line_items}, ${source.additional_charges}, 
        ${source.bank_details}, ${source.customization},
        ${source.sub_total}, ${source.total_discount}, ${source.taxable_amount}, 
        ${source.total_cgst}, ${source.total_sgst}, ${source.total_igst},
        ${source.total_tax}, ${source.grand_total}, ${source.amount_in_words}, ${source.notes}, ${source.terms}
      )
      RETURNING id, invoice_number
    `;

    const newInvoice = insertResult[0];

    // Insert items in invoice_items table
    const lineItemsArray = Array.isArray(source.line_items) ? source.line_items : JSON.parse(source.line_items || '[]');
    for (let i = 0; i < lineItemsArray.length; i++) {
      const item = lineItemsArray[i];
      await sql`
        INSERT INTO invoice_items (
          invoice_id, sr_no, description, hsn_code, quantity, unit, rate,
          discount_percent, gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_amount
        ) VALUES (
          ${newInvoice.id}, ${i + 1}, ${item.description}, ${item.hsnCode || item.hsn_code || null},
          ${item.quantity || 0}, ${item.unit || 'PCS'}, ${item.rate || 0},
          ${item.discountPercent || item.discount_percent || 0}, ${item.gstRate || item.gst_rate || 0},
          ${item.taxableAmount || 0}, ${item.cgstAmount || 0}, ${item.sgstAmount || 0}, ${item.igstAmount || 0}, ${item.totalAmount || 0}
        )
      `;
    }

    return getCorsResponse(newInvoice, 201);
  } catch (error) {
    console.error('Error duplicating invoice:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
