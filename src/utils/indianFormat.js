// /src/utils/indianFormat.js

/**
 * Format a number using Indian number system with ₹ symbol.
 * e.g. 1234567.89 → "₹12,34,567.89"
 * @param {number|string} amount
 * @param {number} decimals
 * @returns {string}
 */
export function formatINR(amount, decimals = 2) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0.00';

  const fixed = Math.abs(num).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  // Indian grouping: last 3 digits, then groups of 2
  let result = '';
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    const last3  = intPart.slice(-3);
    const rest   = intPart.slice(0, intPart.length - 3);
    const groups = [];
    for (let i = rest.length; i > 0; i -= 2) {
      groups.unshift(rest.slice(Math.max(0, i - 2), i));
    }
    result = groups.join(',') + ',' + last3;
  }

  const sign = num < 0 ? '-' : '';
  return `${sign}₹${result}${decimals > 0 ? '.' + decPart : ''}`;
}

/**
 * Format a plain number without currency symbol, Indian style.
 * e.g. 1234567.89 → "12,34,567.89"
 */
export function formatIndianNumber(amount, decimals = 2) {
  return formatINR(amount, decimals).replace('₹', '').trim();
}

// ── numberToWords ─────────────────────────────────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/**
 * Convert an integer (0–999) to words.
 */
function threeDigitsToWords(n) {
  if (n === 0) return '';
  if (n < 20)  return ones[n];
  if (n < 100) {
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return o ? `${t}-${o}` : t;
  }
  // 100–999
  const h    = Math.floor(n / 100);
  const rest = n % 100;
  const tail = rest > 0 ? ' ' + threeDigitsToWords(rest) : '';
  return `${ones[h]} Hundred${tail}`;
}

/**
 * Convert a non-negative integer to Indian-system words (crores, lakhs, thousands).
 */
function integerToWords(n) {
  if (n === 0) return 'Zero';

  const parts = [];

  const crore    = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh     = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;
  const remainder = n;

  if (crore)    parts.push(threeDigitsToWords(crore)    + ' Crore');
  if (lakh)     parts.push(threeDigitsToWords(lakh)     + ' Lakh');
  if (thousand) parts.push(threeDigitsToWords(thousand) + ' Thousand');
  if (remainder) parts.push(threeDigitsToWords(remainder));

  return parts.join(' ');
}

/**
 * Convert a rupee amount to Indian words.
 *
 * Test cases:
 *   0           → "Zero Rupees Only"
 *   1000        → "Rupees One Thousand Only"
 *   100000      → "Rupees One Lakh Only"
 *   10000000    → "Rupees One Crore Only"
 *   12345.50    → "Rupees Twelve Thousand Three Hundred Forty-Five and Fifty Paise Only"
 *   9999999.99  → "Rupees Ninety-Nine Lakh Ninety-Nine Thousand Nine Hundred
 *                   Ninety-Nine and Ninety-Nine Paise Only"
 *
 * @param {number|string} amount
 * @returns {string}
 */
export function numberToWords(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || num < 0) return 'Invalid Amount';

  // Split rupees and paise
  const fixed  = num.toFixed(2);
  const [rupeePart, paisePart] = fixed.split('.');
  const rupees = parseInt(rupeePart,  10);
  const paise  = parseInt(paisePart,  10);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  let result = '';

  if (rupees > 0) {
    result = `Rupees ${integerToWords(rupees)}`;
  }

  if (paise > 0) {
    const paiseWords = threeDigitsToWords(paise);
    if (rupees > 0) {
      result += ` and ${paiseWords} Paise`;
    } else {
      result = `${paiseWords} Paise`;
    }
  }

  return result + ' Only';
}
