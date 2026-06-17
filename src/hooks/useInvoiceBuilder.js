'use client';

import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import {
  DEFAULT_SELLER,
  DEFAULT_BUYER,
  DEFAULT_INVOICE_META,
  DEFAULT_LINE_ITEM,
  DEFAULT_ADDITIONAL_CHARGES,
  DEFAULT_BANK_DETAILS,
  DEFAULT_CUSTOMIZATION,
} from '@/constants/defaultValues';
import { calculateInvoiceTotals, detectTaxMode } from '@/utils/taxCalculations';
import { generateInvoiceNumber } from '@/utils/invoiceHelpers';
import { generatePDF } from '@/utils/pdfGenerator';

/**
 * Utility to map camelCase objects to snake_case for backend compatibility.
 */
const mapToSnakeCase = (obj) => {
  if (!obj) return {};
  const mapped = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    mapped[snakeKey] = obj[key];
  });
  return mapped;
};

/**
 * Custom hook managing all state, logic, validations, and operations for building GST invoices.
 */
export default function useInvoiceBuilder() {
  // 1. State declarations
  const [sellerInfo, setSellerInfo] = useState(DEFAULT_SELLER);
  const [buyerInfo, setBuyerInfo] = useState(DEFAULT_BUYER);
  const [invoiceMeta, setInvoiceMeta] = useState(DEFAULT_INVOICE_META());
  const [lineItems, setLineItems] = useState([]);
  const [additionalCharges, setAdditionalCharges] = useState(DEFAULT_ADDITIONAL_CHARGES);
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK_DETAILS);
  const [customization, setCustomization] = useState(DEFAULT_CUSTOMIZATION);

  const [taxMode, setTaxMode] = useState('intrastate');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // States for banner notification management
  const [draftTimestamp, setDraftTimestamp] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  // Initialize line items with one default item
  useEffect(() => {
    setLineItems([{ ...DEFAULT_LINE_ITEM(), id: uuidv4() }]);
  }, []);

  // 2. Computed totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals(lineItems, additionalCharges, taxMode);
  }, [lineItems, additionalCharges, taxMode]);

  // 3. Side Effect: Auto-detect tax mode from seller/buyer state changes
  useEffect(() => {
    const mode = detectTaxMode(sellerInfo.state, buyerInfo.state);
    setTaxMode(mode);
  }, [sellerInfo.state, buyerInfo.state]);

  // 4. Side Effect: Sequence auto-generator for new invoices
  useEffect(() => {
    if (!invoiceMeta.invoiceNumber) {
      const getNextNumber = async () => {
        try {
          const res = await fetch('/api/invoices?limit=100');
          if (res.ok) {
            const data = await res.json();
            const existing = data.invoices?.map((i) => i.invoice_number) || [];
            const nextNum = generateInvoiceNumber(existing);
            setInvoiceMeta((prev) => ({ ...prev, invoiceNumber: nextNum }));
          }
        } catch (err) {
          console.error('Failed to pre-fetch invoice number:', err);
        }
      };
      getNextNumber();
    }
  }, [invoiceMeta.invoiceNumber]);

  // 5. Side Effect: Check for existing draft in localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('invoice_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.timestamp) {
          setDraftTimestamp(parsed.timestamp);
          setShowBanner(true);
        }
      } catch (err) {
        console.error('Failed to parse active draft:', err);
      }
    }
  }, []);

  // 6. Side Effect: Periodic draft auto-saver (every 30 seconds if dirty)
  useEffect(() => {
    if (!isDirty) return;

    const interval = setInterval(() => {
      const draftData = {
        sellerInfo,
        buyerInfo,
        invoiceMeta,
        lineItems,
        additionalCharges,
        bankDetails,
        customization,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('invoice_draft', JSON.stringify(draftData));
      toast.success('Draft auto-saved', { id: 'autosave-toast' });
      setIsDirty(false); // Reset flag on successful save
    }, 30000);

    return () => clearInterval(interval);
  }, [sellerInfo, buyerInfo, invoiceMeta, lineItems, additionalCharges, bankDetails, customization, isDirty]);

  // 7. Operations & change handlers
  const handleSellerChange = (field, value) => {
    setSellerInfo((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBuyerChange = (field, value) => {
    setBuyerInfo((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleMetaChange = (field, value) => {
    setInvoiceMeta((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleLineItemsChange = (updatedItems) => {
    setLineItems(updatedItems);
    setIsDirty(true);
  };

  const handleAdditionalChargesChange = (field, value) => {
    setAdditionalCharges((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleCustomizationChange = (field, value) => {
    setCustomization((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // 8. Validation checker
  const validateForm = () => {
    const errs = {};

    if (!sellerInfo.businessName) errs.sellerBusinessName = 'Business Name is required';
    if (!buyerInfo.businessName) errs.buyerBusinessName = 'Business Name is required';
    if (!invoiceMeta.invoiceNumber) errs.invoiceNumber = 'Invoice Number is required';
    if (!invoiceMeta.invoiceDate) errs.invoiceDate = 'Invoice Date is required';

    if (lineItems.length === 0) {
      errs.lineItems = 'At least one line item is required';
    } else {
      lineItems.forEach((item, idx) => {
        if (!item.description) {
          errs[`item_${idx}_description`] = 'Description is required';
        }
        if (parseFloat(item.quantity) <= 0) {
          errs[`item_${idx}_quantity`] = 'Qty must be > 0';
        }
        if (parseFloat(item.rate) < 0) {
          errs[`item_${idx}_rate`] = 'Rate must be >= 0';
        }
      });
    }

    if (customization.showBankDetails) {
      if (!bankDetails.bankName) errs.bankName = 'Bank name is required';
      if (!bankDetails.accountName) errs.accountName = 'Holder name is required';
      if (!bankDetails.accountNumber) errs.accountNumber = 'Account number is required';
      if (!bankDetails.ifscCode) errs.ifscCode = 'IFSC code is required';
    }

    if (customization.showQrCode && !bankDetails.upiId) {
      errs.upiId = 'UPI ID is required to render payment QR';
    }

    // Check overall discount rules
    const subTotal = totals.subTotal || 0;
    const discountVal = parseFloat(additionalCharges.overallDiscount) || 0;
    if (additionalCharges.overallDiscountType === 'percent' && discountVal > 100) {
      errs.overallDiscount = 'Discount cannot exceed 100%';
    } else if (additionalCharges.overallDiscountType === 'flat' && discountVal > subTotal) {
      errs.overallDiscount = 'Discount cannot exceed subtotal';
    }

    setErrors(errs);
    return {
      isValid: Object.keys(errs).length === 0,
      errors: errs,
    };
  };

  // 9. API submission
  const handleSaveInvoice = async () => {
    const { isValid } = validateForm();
    if (!isValid) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    setIsSaving(true);
    const savingToastId = toast.loading('Saving invoice draft...');

    try {
      const payload = {
        invoiceNumber: invoiceMeta.invoiceNumber,
        invoiceType: invoiceMeta.invoiceType,
        invoiceDate: invoiceMeta.invoiceDate,
        dueDate: invoiceMeta.dueDate,
        paymentTerms: invoiceMeta.paymentTerms,
        taxMode,
        status: invoiceMeta.status || 'draft',
        sellerData: mapToSnakeCase(sellerInfo),
        buyerData: mapToSnakeCase(buyerInfo),
        lineItems,
        additionalCharges,
        bankDetails,
        customization,
        notes: invoiceMeta.notes,
        terms: invoiceMeta.terms,
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Invoice ${invoiceMeta.invoiceNumber} saved successfully!`, { id: savingToastId });
        setIsDirty(false);
        // Clear active draft from local storage since it's saved in the DB
        localStorage.removeItem('invoice_draft');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to save invoice.', { id: savingToastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error contacting server endpoint.', { id: savingToastId });
    } finally {
      setIsSaving(false);
    }
  };

  // 10. PDF generator runner
  const handleDownloadPDF = async () => {
    const { isValid } = validateForm();
    if (!isValid) {
      toast.error('Please fix the validation errors before exporting.');
      return;
    }

    setIsGeneratingPDF(true);
    const pdfToastId = toast.loading('Generating PDF...');

    try {
      const invoiceData = {
        seller: sellerInfo,
        buyer: buyerInfo,
        meta: invoiceMeta,
        lineItems,
        additionalCharges,
        bankDetails,
        customization,
        totals,
      };

      const result = await generatePDF(invoiceData, 'invoice-preview-content');
      toast.success(`Downloaded: ${result.filename}`, { id: pdfToastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Make sure preview element exists.', { id: pdfToastId });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 11. Create new blank form
  const handleNewInvoice = async () => {
    setSellerInfo(DEFAULT_SELLER);
    setBuyerInfo(DEFAULT_BUYER);
    setInvoiceMeta(DEFAULT_INVOICE_META());
    setLineItems([{ ...DEFAULT_LINE_ITEM(), id: uuidv4() }]);
    setAdditionalCharges(DEFAULT_ADDITIONAL_CHARGES);
    setBankDetails(DEFAULT_BANK_DETAILS);
    setCustomization(DEFAULT_CUSTOMIZATION);
    setErrors({});
    setIsDirty(false);

    try {
      const res = await fetch('/api/invoices?limit=100');
      if (res.ok) {
        const data = await res.json();
        const existing = data.invoices?.map((i) => i.invoice_number) || [];
        const nextNum = generateInvoiceNumber(existing);
        setInvoiceMeta((prev) => ({ ...prev, invoiceNumber: nextNum }));
      }
    } catch (err) {
      console.error(err);
    }

    toast.success('Fields reset to defaults.');
  };

  // 12. Load local saved draft
  const handleLoadDraft = () => {
    const draft = localStorage.getItem('invoice_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        if (data.sellerInfo) setSellerInfo(data.sellerInfo);
        if (data.buyerInfo) setBuyerInfo(data.buyerInfo);
        if (data.invoiceMeta) setInvoiceMeta(data.invoiceMeta);
        if (data.lineItems) setLineItems(data.lineItems);
        if (data.additionalCharges) setAdditionalCharges(data.additionalCharges);
        if (data.bankDetails) setBankDetails(data.bankDetails);
        if (data.customization) setCustomization(data.customization);

        setIsDirty(false);
        setShowBanner(false);
        toast.success('Draft restored successfully.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to restore draft.');
      }
    }
  };

  // 12.5 Load invoice from database (maps snake_case to camelCase)
  const handleLoadInvoice = (invoice) => {
    if (!invoice) return;

    // Helper to map snake_case to camelCase
    const mapToCamelCase = (obj) => {
      if (!obj) return {};
      const mapped = {};
      Object.keys(obj).forEach((key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        mapped[camelKey] = obj[key];
      });
      return mapped;
    };

    try {
      const sellerData = invoice.seller_data || invoice.sellerData || {};
      const buyerData = invoice.buyer_data || invoice.buyerData || {};
      const lineItemsData = invoice.line_items || invoice.lineItems || [];
      const chargesData = invoice.additional_charges || invoice.additionalCharges || {};
      const bankData = invoice.bank_details || invoice.bankDetails || {};
      const customizationData = invoice.customization || {};

      setSellerInfo(mapToCamelCase(sellerData));
      setBuyerInfo(mapToCamelCase(buyerData));
      
      setInvoiceMeta({
        invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || '',
        invoiceType: invoice.invoice_type || invoice.invoiceType || 'Tax Invoice',
        invoiceDate: invoice.invoice_date || invoice.invoiceDate || '',
        dueDate: invoice.due_date || invoice.dueDate || '',
        financialYear: invoice.financial_year || invoice.financialYear || '',
        placeOfSupply: invoice.place_of_supply || invoice.placeOfSupply || '',
        paymentTerms: invoice.payment_terms || invoice.paymentTerms || '',
        status: invoice.status || 'draft',
        notes: invoice.notes || '',
        terms: invoice.terms || '',
      });

      const mappedItems = lineItemsData.map((item) => ({
        ...mapToCamelCase(item),
        id: item.id || uuidv4(),
        hsnCode: item.hsnCode || item.hsn_code || '',
        discountPercent: item.discountPercent !== undefined ? item.discountPercent : (item.discount_percent || 0),
        gstRate: item.gstRate !== undefined ? item.gstRate : (item.gst_rate || 0),
        isDescriptionOnly: !!item.isDescriptionOnly || !!item.is_description_only,
      }));
      setLineItems(mappedItems);

      setAdditionalCharges({
        ...DEFAULT_ADDITIONAL_CHARGES,
        ...chargesData
      });

      setBankDetails({
        ...DEFAULT_BANK_DETAILS,
        ...bankData
      });

      setCustomization({
        ...DEFAULT_CUSTOMIZATION,
        ...customizationData
      });

      setErrors({});
      setIsDirty(false);
      toast.success('Invoice loaded for editing');
    } catch (err) {
      console.error('Failed to load invoice:', err);
      toast.error('Error loading invoice');
    }
  };

  // 13. Duplicate current invoice config
  const handleDuplicateInvoice = async () => {
    try {
      const res = await fetch('/api/invoices?limit=100');
      let nextNum = 'INV-' + new Date().getFullYear().toString().slice(-2) + '01-001';
      if (res.ok) {
        const data = await res.json();
        const existing = data.invoices?.map((i) => i.invoice_number) || [];
        nextNum = generateInvoiceNumber(existing);
      }
      setInvoiceMeta((prev) => ({
        ...prev,
        invoiceNumber: nextNum,
      }));
      setIsDirty(true);
      toast.success(`Duplicated current layout. New Invoice Number: ${nextNum}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate invoice.');
    }
  };

  const handleDismissDraft = () => {
    setShowBanner(false);
  };

  return {
    // states
    sellerInfo,
    buyerInfo,
    invoiceMeta,
    lineItems,
    additionalCharges,
    bankDetails,
    customization,
    taxMode,
    isSaving,
    isGeneratingPDF,
    errors,
    isDirty,
    showBanner,
    draftTimestamp,

    // totals
    totals,

    // handlers
    handleSellerChange,
    handleBuyerChange,
    handleMetaChange,
    handleLineItemsChange,
    handleAdditionalChargesChange,
    handleBankDetailsChange,
    handleCustomizationChange,

    // operations
    validateForm,
    handleSaveInvoice,
    handleDownloadPDF,
    handleNewInvoice,
    handleLoadDraft,
    handleLoadInvoice,
    handleDuplicateInvoice,
    handleDismissDraft,
  };
}
