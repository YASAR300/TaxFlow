// /src/utils/taxCalculations.js

/**
 * Round a number to 2 decimal places.
 */
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Detect tax mode based on seller and buyer state.
 * @param {string} sellerState — state name or code
 * @param {string} buyerState  — state name or code
 * @returns {'intrastate'|'interstate'}
 */
export function detectTaxMode(sellerState, buyerState) {
  if (!sellerState || !buyerState) return 'intrastate';
  const normalize = (s) => String(s).trim().toLowerCase();
  return normalize(sellerState) === normalize(buyerState) ? 'intrastate' : 'interstate';
}

/**
 * Calculate all tax fields for a single line item.
 *
 * @param {object} item     — line item object (quantity, rate, discountPercent, gstRate, …)
 * @param {string} taxMode  — 'intrastate' | 'interstate'
 * @returns {object}        — item with updated taxableAmount, cgst/sgst/igst/totalAmount
 */
export function calculateLineItem(item, taxMode = 'intrastate') {
  const qty      = parseFloat(item.quantity)       || 0;
  const rate     = parseFloat(item.rate)           || 0;
  const discount = parseFloat(item.discountPercent) || 0;
  const gstRate  = parseFloat(item.gstRate)        || 0;

  const grossAmount    = r2(qty * rate);
  const discountAmount = r2(grossAmount * discount / 100);
  const taxableAmount  = r2(grossAmount - discountAmount);
  const gstAmount      = r2(taxableAmount * gstRate / 100);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxMode === 'interstate') {
    igstAmount = gstAmount;
  } else {
    cgstAmount = r2(gstAmount / 2);
    sgstAmount = r2(gstAmount - cgstAmount); // avoids floating-point split error
  }

  const totalAmount = r2(taxableAmount + gstAmount);

  return {
    ...item,
    taxableAmount,
    discountAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    gstAmount,
    totalAmount,
  };
}

/**
 * Calculate full invoice totals from line items and additional charges.
 *
 * @param {object[]} lineItems         — array of raw line item objects
 * @param {object}   additionalCharges — from DEFAULT_ADDITIONAL_CHARGES shape
 * @param {string}   taxMode           — 'intrastate' | 'interstate'
 * @returns {object}                   — complete invoice totals breakdown
 */
export function calculateInvoiceTotals(lineItems = [], additionalCharges = {}, taxMode = 'intrastate') {
  const {
    shippingCharges     = 0,
    packagingCharges    = 0,
    otherCharges        = 0,
    shippingGstRate     = 18,
    packagingGstRate    = 18,
    otherGstRate        = 18,
    overallDiscountType = 'flat',
    overallDiscount     = 0,
    roundOff            = true,
  } = additionalCharges;

  // ── Step 1: Calculate each line item ────────────────────────────────────────
  const calculatedItems = lineItems.map((item) => calculateLineItem(item, taxMode));

  // ── Step 2: Sum line item totals ─────────────────────────────────────────────
  let subTotal          = 0;
  let lineItemsDiscount = 0;
  let taxableAmount     = 0;
  let totalCGST         = 0;
  let totalSGST         = 0;
  let totalIGST         = 0;

  for (const item of calculatedItems) {
    subTotal          = r2(subTotal + (item.quantity * item.rate || 0));
    lineItemsDiscount = r2(lineItemsDiscount + (item.discountAmount || 0));
    taxableAmount     = r2(taxableAmount + item.taxableAmount);
    totalCGST         = r2(totalCGST + item.cgstAmount);
    totalSGST         = r2(totalSGST + item.sgstAmount);
    totalIGST         = r2(totalIGST + item.igstAmount);
  }

  // ── Step 3: Additional charges with their own GST ───────────────────────────
  const calcCharge = (amount, gstRate) => {
    const base = parseFloat(amount) || 0;
    const gst  = r2(base * gstRate / 100);
    let cgst = 0, sgst = 0, igst = 0;
    if (taxMode === 'interstate') {
      igst = gst;
    } else {
      cgst = r2(gst / 2);
      sgst = r2(gst - cgst);
    }
    return { base, gst, cgst, sgst, igst, total: r2(base + gst) };
  };

  const shipping  = calcCharge(shippingCharges,  shippingGstRate);
  const packaging = calcCharge(packagingCharges, packagingGstRate);
  const other     = calcCharge(otherCharges,     otherGstRate);

  const additionalTaxable = r2(shipping.base + packaging.base + other.base);
  taxableAmount = r2(taxableAmount + additionalTaxable);
  totalCGST     = r2(totalCGST + shipping.cgst + packaging.cgst + other.cgst);
  totalSGST     = r2(totalSGST + shipping.sgst + packaging.sgst + other.sgst);
  totalIGST     = r2(totalIGST + shipping.igst + packaging.igst + other.igst);

  // ── Step 4: Overall invoice discount ────────────────────────────────────────
  let overallDiscountAmount = 0;
  const discountVal = parseFloat(overallDiscount) || 0;
  if (discountVal > 0) {
    if (overallDiscountType === 'percent') {
      overallDiscountAmount = r2(taxableAmount * discountVal / 100);
    } else {
      overallDiscountAmount = r2(discountVal);
    }
    // Proportionally reduce taxable and taxes
    const ratio = taxableAmount > 0 ? (taxableAmount - overallDiscountAmount) / taxableAmount : 1;
    taxableAmount = r2(taxableAmount * ratio);
    totalCGST     = r2(totalCGST * ratio);
    totalSGST     = r2(totalSGST * ratio);
    totalIGST     = r2(totalIGST * ratio);
  }

  const totalTax  = r2(totalCGST + totalSGST + totalIGST);
  const preTaxTotal = r2(taxableAmount + totalTax);

  // ── Step 5: Round-off ────────────────────────────────────────────────────────
  let roundOffAmount = 0;
  let grandTotal     = preTaxTotal;
  if (roundOff) {
    const rounded   = Math.round(preTaxTotal);
    roundOffAmount  = r2(rounded - preTaxTotal);
    grandTotal      = rounded;
  }

  // ── Step 6: Tax slabs (grouped by GST rate) ──────────────────────────────────
  const slabMap = {};

  const addToSlab = (item) => {
    const rate = item.gstRate || 0;
    if (!slabMap[rate]) {
      slabMap[rate] = { rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    }
    slabMap[rate].taxable = r2(slabMap[rate].taxable + item.taxableAmount);
    slabMap[rate].cgst    = r2(slabMap[rate].cgst    + item.cgstAmount);
    slabMap[rate].sgst    = r2(slabMap[rate].sgst    + item.sgstAmount);
    slabMap[rate].igst    = r2(slabMap[rate].igst    + item.igstAmount);
    slabMap[rate].total   = r2(slabMap[rate].total   + item.gstAmount);
  };

  calculatedItems.forEach(addToSlab);

  // Add additional charges to their respective slabs
  const addChargeSlab = (base, gstRate, cgst, sgst, igst, gst) => {
    if (base <= 0) return;
    if (!slabMap[gstRate]) slabMap[gstRate] = { rate: gstRate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    slabMap[gstRate].taxable = r2(slabMap[gstRate].taxable + base);
    slabMap[gstRate].cgst    = r2(slabMap[gstRate].cgst    + cgst);
    slabMap[gstRate].sgst    = r2(slabMap[gstRate].sgst    + sgst);
    slabMap[gstRate].igst    = r2(slabMap[gstRate].igst    + igst);
    slabMap[gstRate].total   = r2(slabMap[gstRate].total   + gst);
  };

  addChargeSlab(shipping.base,  shippingGstRate,  shipping.cgst,  shipping.sgst,  shipping.igst,  shipping.gst);
  addChargeSlab(packaging.base, packagingGstRate, packaging.cgst, packaging.sgst, packaging.igst, packaging.gst);
  addChargeSlab(other.base,     otherGstRate,     other.cgst,     other.sgst,     other.igst,     other.gst);

  const taxSlabs = Object.values(slabMap).sort((a, b) => a.rate - b.rate);

  return {
    calculatedItems,
    subTotal,
    lineItemsDiscount,
    additionalChargesBreakdown: { shipping, packaging, other },
    overallDiscountAmount,
    taxableAmount,
    taxSlabs,
    totalCGST,
    totalSGST,
    totalIGST,
    totalTax,
    preTaxTotal,
    roundOff: roundOffAmount,
    grandTotal,
  };
}
