import sql from '@/lib/db';
import { getCorsResponse, getErrorResponse, handleOptions, isValidUUID } from '@/utils/apiHelper';
import { calculateInvoiceTotals } from '@/utils/taxCalculations';
import { getCurrentFinancialYear, getDueDate } from '@/utils/invoiceHelpers';
import { numberToWords } from '@/utils/indianFormat';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      return getErrorResponse('Invalid invoice ID format', 400);
    }

    const invoices = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (invoices.length === 0) {
      return getErrorResponse('Invoice not found', 404);
    }

    return getCorsResponse(invoices[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      return getErrorResponse('Invalid invoice ID format', 400);
    }

    // Check existence
    const existingResult = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (existingResult.length === 0) {
      return getErrorResponse('Invoice not found', 404);
    }

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

    // Uniqueness (except current ID)
    const duplicate = await sql`SELECT id FROM invoices WHERE invoice_number = ${invoice_number} AND id != ${id} LIMIT 1`;
    if (duplicate.length > 0) {
      return getErrorResponse('Invoice number already exists on another invoice', 400);
    }

    // Calculations
    const totals = calculateInvoiceTotals(line_items, additional_charges, tax_mode);
    const amount_in_words = numberToWords(totals.grandTotal);
    const financial_year = getCurrentFinancialYear();
    const due_date = body.due_date || body.dueDate || getDueDate(invoice_date, payment_terms);

    // Update invoice
    const updateResult = await sql`
      UPDATE invoices
      SET
        invoice_number = ${invoice_number},
        invoice_type = ${invoice_type},
        invoice_date = ${invoice_date},
        due_date = ${due_date || null},
        financial_year = ${financial_year},
        place_of_supply = ${buyer_data.state || null},
        payment_terms = ${payment_terms || null},
        tax_mode = ${tax_mode},
        status = ${status},
        seller_data = ${JSON.stringify(seller_data)},
        buyer_data = ${JSON.stringify(buyer_data)},
        line_items = ${JSON.stringify(totals.calculatedItems)},
        additional_charges = ${JSON.stringify(additional_charges)},
        bank_details = ${JSON.stringify(bank_details)},
        customization = ${JSON.stringify(customization)},
        sub_total = ${totals.subTotal},
        total_discount = ${totals.overallDiscountAmount + totals.lineItemsDiscount},
        taxable_amount = ${totals.taxableAmount},
        total_cgst = ${totals.totalCGST},
        total_sgst = ${totals.totalSGST},
        total_igst = ${totals.totalIGST},
        total_tax = ${totals.totalTax},
        grand_total = ${totals.grandTotal},
        amount_in_words = ${amount_in_words},
        notes = ${notes || null},
        terms = ${terms || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    const updatedInvoice = updateResult[0];

    // Delete old items
    await sql`DELETE FROM invoice_items WHERE invoice_id = ${id}`;

    // Insert new items
    for (let i = 0; i < totals.calculatedItems.length; i++) {
      const item = totals.calculatedItems[i];
      await sql`
        INSERT INTO invoice_items (
          invoice_id, sr_no, description, hsn_code, quantity, unit, rate,
          discount_percent, gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_amount
        ) VALUES (
          ${id}, ${i + 1}, ${item.description}, ${item.hsnCode || item.hsn_code || null},
          ${item.quantity || 0}, ${item.unit || 'PCS'}, ${item.rate || 0},
          ${item.discountPercent || item.discount_percent || 0}, ${item.gstRate || item.gst_rate || 0},
          ${item.taxableAmount}, ${item.cgstAmount}, ${item.sgstAmount}, ${item.igstAmount}, ${item.totalAmount}
        )
      `;
    }

    return getCorsResponse(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      return getErrorResponse('Invalid invoice ID format', 400);
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Check existence
    const existing = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) {
      return getErrorResponse('Invoice not found', 404);
    }

    if (permanent) {
      // Hard delete (CASCADE handles items automatically)
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      return getCorsResponse({ message: 'Invoice permanently deleted successfully' });
    } else {
      // Soft delete
      const updated = await sql`
        UPDATE invoices
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return getCorsResponse({ message: 'Invoice soft-deleted (cancelled) successfully', invoice: updated[0] });
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;

    if (!isValidUUID(id)) {
      return getErrorResponse('Invalid invoice ID format', 400);
    }

    // Check existence
    const existing = await sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) {
      return getErrorResponse('Invoice not found', 404);
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return getErrorResponse(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await sql`
      UPDATE invoices
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return getCorsResponse(updated[0]);
  } catch (error) {
    console.error('Error updating status field:', error);
    return getErrorResponse('Internal Server Error', 500);
  }
}
