// /src/utils/invoiceHelpers.js

/**
 * Returns the current Indian financial year string, e.g. "2025-26".
 * Financial year runs April 1 → March 31.
 */
export function getCurrentFinancialYear() {
  const now   = new Date();
  const month = now.getMonth(); // 0 = Jan … 11 = Dec
  const year  = now.getFullYear();

  // April (month 3) starts new FY
  const startYear = month >= 3 ? year : year - 1;
  const endYear   = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYear}`;
}

/**
 * Generates the next invoice number in INV-FY-NNN format.
 * @param {string[]} existingNumbers — array of existing invoice numbers
 * @returns {string} e.g. "INV-2526-001"
 */
export function generateInvoiceNumber(existingNumbers = []) {
  const fy = getCurrentFinancialYear().replace('-', ''); // "202526"
  const fyShort = fy.slice(2); // "2526"
  const prefix  = `INV-${fyShort}-`;

  // Find the highest sequence number for this FY
  let maxSeq = 0;
  for (const num of existingNumbers) {
    if (typeof num === 'string' && num.startsWith(prefix)) {
      const seq = parseInt(num.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }

  const next = (maxSeq + 1).toString().padStart(3, '0');
  return `${prefix}${next}`;
}

/**
 * Format a date string or Date object as "15 Jan 2025".
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Calculate the due date from an invoice date and payment term value.
 * @param {string|Date} invoiceDate
 * @param {string} paymentTerms — one of the PAYMENT_TERMS values
 * @returns {string} ISO date string (YYYY-MM-DD) or empty string
 */
export function getDueDate(invoiceDate, paymentTerms) {
  if (!invoiceDate || !paymentTerms || paymentTerms === 'custom') return '';

  const termDaysMap = {
    immediate: 0,
    net7:      7,
    net15:     15,
    net30:     30,
    net45:     45,
    net60:     60,
    net90:     90,
  };

  const days = termDaysMap[paymentTerms];
  if (days === undefined) return '';

  const base = typeof invoiceDate === 'string' ? new Date(invoiceDate) : invoiceDate;
  if (isNaN(base.getTime())) return '';

  const due = new Date(base);
  due.setDate(due.getDate() + days);

  // Return as YYYY-MM-DD
  const y  = due.getFullYear();
  const m  = String(due.getMonth() + 1).padStart(2, '0');
  const d  = String(due.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
export function todayISO() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const d   = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
