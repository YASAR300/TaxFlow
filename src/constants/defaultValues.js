// /src/constants/defaultValues.js
import { getCurrentFinancialYear, todayISO } from '@/utils/invoiceHelpers';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_SELLER = {
  businessName : '',
  ownerName    : '',
  address      : '',
  city         : '',
  state        : '',
  stateCode    : '',
  pinCode      : '',
  gstin        : '',
  pan          : '',
  email        : '',
  phone        : '',
  website      : '',
  logoUrl      : null,
};

export const DEFAULT_BUYER = {
  businessName : '',
  contactName  : '',
  address      : '',
  city         : '',
  state        : '',
  stateCode    : '',
  pinCode      : '',
  gstin        : '',
  pan          : '',
  email        : '',
  phone        : '',
};

export const DEFAULT_LINE_ITEM = () => ({
  id              : uuidv4(),
  srNo            : 1,
  description     : '',
  hsnCode         : '',
  quantity        : 1,
  unit            : 'NOS',
  rate            : 0,
  discountPercent : 0,
  gstRate         : 18,
  taxableAmount   : 0,
  cgstAmount      : 0,
  sgstAmount      : 0,
  igstAmount      : 0,
  totalAmount     : 0,
});

export const DEFAULT_INVOICE_META = () => ({
  invoiceNumber  : '',
  invoiceType    : 'Tax Invoice',
  invoiceDate    : todayISO(),
  dueDate        : '',
  financialYear  : getCurrentFinancialYear(),
  placeOfSupply  : '',
  paymentTerms   : 'net30',
  taxMode        : 'intrastate', // 'intrastate' | 'interstate'
  status         : 'draft',
  notes          : '',
  terms          : 'Payment is due within 30 days of the invoice date.\nPlease make cheques payable to the business name above.',
  amountInWords  : '',
});

export const DEFAULT_ADDITIONAL_CHARGES = {
  shippingCharges     : 0,
  packagingCharges    : 0,
  otherCharges        : 0,
  otherChargesLabel   : 'Other Charges',
  shippingGstRate     : 18,
  packagingGstRate    : 18,
  otherGstRate        : 18,
  overallDiscountType : 'flat',  // 'flat' | 'percent'
  overallDiscount     : 0,
  roundOff            : true,
};

export const DEFAULT_BANK_DETAILS = {
  bankName      : '',
  accountName   : '',
  accountNumber : '',
  ifscCode      : '',
  accountType   : 'current',
  branchName    : '',
  upiId         : '',
};

export const DEFAULT_CUSTOMIZATION = {
  showLogo          : true,
  showSignature     : false,
  showBankDetails   : true,
  showQrCode        : false,
  showHsnColumn     : true,
  showDiscountColumn: true,
  primaryColor      : '#2563EB',
  accentColor       : '#1E40AF',
  fontFamily        : 'Inter',
  watermark         : '',
  footerText        : '',
};
