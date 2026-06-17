// /src/constants/gstData.js

// ── GST Rate slabs ────────────────────────────────────────────────────────────
export const GST_RATES = [
  { value: 0,  label: '0% (Exempt)' },
  { value: 5,  label: '5%'          },
  { value: 12, label: '12%'         },
  { value: 18, label: '18%'         },
  { value: 28, label: '28%'         },
];

// ── Common HSN / SAC codes ────────────────────────────────────────────────────
// Covers software, consulting, design, manufacturing, retail, food, textiles,
// construction — relevant to Indian freelancers and small businesses.
export const HSN_SAC_COMMON = [
  // ── IT / Software / Digital Services (SAC 99) ──────────────────────────────
  { code: '998311', type: 'SAC', description: 'IT Consulting & Software Development Services', gstRate: 18 },
  { code: '998312', type: 'SAC', description: 'Software Implementation & Customisation Services', gstRate: 18 },
  { code: '998313', type: 'SAC', description: 'IT Support & Help Desk Services', gstRate: 18 },
  { code: '998314', type: 'SAC', description: 'Information Technology Infrastructure Services', gstRate: 18 },
  { code: '998315', type: 'SAC', description: 'Mobile App Development Services', gstRate: 18 },
  { code: '998316', type: 'SAC', description: 'Cloud Services & Web Hosting', gstRate: 18 },

  // ── Professional & Consulting Services ─────────────────────────────────────
  { code: '998211', type: 'SAC', description: 'Legal Advisory & Consulting Services', gstRate: 18 },
  { code: '998221', type: 'SAC', description: 'Accounting, Auditing & Tax Consulting', gstRate: 18 },
  { code: '998231', type: 'SAC', description: 'Management Consulting Services', gstRate: 18 },
  { code: '998391', type: 'SAC', description: 'Market Research & Public Opinion Polling', gstRate: 18 },

  // ── Design & Creative Services ──────────────────────────────────────────────
  { code: '998361', type: 'SAC', description: 'Graphic Design & Visual Communication Services', gstRate: 18 },
  { code: '998363', type: 'SAC', description: 'UI/UX Design & Product Design Services', gstRate: 18 },
  { code: '998364', type: 'SAC', description: 'Photography & Videography Services', gstRate: 18 },
  { code: '998366', type: 'SAC', description: 'Advertising & Brand Design Services', gstRate: 18 },

  // ── Digital Marketing & Content ─────────────────────────────────────────────
  { code: '998371', type: 'SAC', description: 'Digital Marketing & SEO Services', gstRate: 18 },
  { code: '998372', type: 'SAC', description: 'Social Media Management Services', gstRate: 18 },
  { code: '998399', type: 'SAC', description: 'Content Writing & Copywriting Services', gstRate: 18 },

  // ── Construction & Engineering ──────────────────────────────────────────────
  { code: '995411', type: 'SAC', description: 'General Construction Services — Residential Buildings', gstRate: 12 },
  { code: '995412', type: 'SAC', description: 'General Construction Services — Commercial Buildings', gstRate: 18 },
  { code: '995428', type: 'SAC', description: 'Electrical Installation & Wiring Services', gstRate: 18 },
  { code: '995429', type: 'SAC', description: 'Plumbing & HVAC Installation Services', gstRate: 18 },

  // ── Manufacturing — Electronics (HSN 85) ───────────────────────────────────
  { code: '8471',   type: 'HSN', description: 'Computers, Laptops & Computing Machines', gstRate: 18 },
  { code: '8517',   type: 'HSN', description: 'Telephones, Smartphones & Mobile Phones', gstRate: 18 },
  { code: '8523',   type: 'HSN', description: 'Flash Memory, USB Drives & Storage Media', gstRate: 18 },

  // ── Retail — General Goods ──────────────────────────────────────────────────
  { code: '8414',   type: 'HSN', description: 'Air Conditioners, Fans & Air Purifiers', gstRate: 28 },
  { code: '8450',   type: 'HSN', description: 'Washing Machines & Household Laundry Appliances', gstRate: 28 },
  { code: '9403',   type: 'HSN', description: 'Furniture — Office & Household', gstRate: 18 },
  { code: '4901',   type: 'HSN', description: 'Books, Printed Publications & Journals', gstRate: 0  },
  { code: '3304',   type: 'HSN', description: 'Beauty, Skin Care & Cosmetic Products', gstRate: 18 },

  // ── Textiles ────────────────────────────────────────────────────────────────
  { code: '5208',   type: 'HSN', description: 'Woven Cotton Fabrics', gstRate: 5  },
  { code: '6101',   type: 'HSN', description: "Men's Overcoats, Jackets & Blazers (Knitted)", gstRate: 5  },
  { code: '6201',   type: 'HSN', description: "Men's Overcoats, Jackets & Blazers (Woven)", gstRate: 5  },
  { code: '6301',   type: 'HSN', description: 'Blankets, Travelling Rugs & Bed Linen', gstRate: 5  },

  // ── Food & Beverages ────────────────────────────────────────────────────────
  { code: '1901',   type: 'HSN', description: 'Bakery Products — Bread, Biscuits, Cakes', gstRate: 5  },
  { code: '2106',   type: 'HSN', description: 'Processed Food Preparations & Food Supplements', gstRate: 18 },
  { code: '0901',   type: 'HSN', description: 'Coffee — Roasted, Unroasted, Decaffeinated', gstRate: 5  },
  { code: '0902',   type: 'HSN', description: 'Tea — Green, Black, Flavoured', gstRate: 5  },

  // ── Transport / Freight ─────────────────────────────────────────────────────
  { code: '996511', type: 'SAC', description: 'Road Transport Services — Goods', gstRate: 5  },
  { code: '996521', type: 'SAC', description: 'Freight Air Transport Services', gstRate: 18 },
];

// ── Invoice types ─────────────────────────────────────────────────────────────
export const INVOICE_TYPES = [
  { value: 'Tax Invoice',    label: 'Tax Invoice'    },
  { value: 'Proforma Invoice', label: 'Proforma Invoice' },
  { value: 'Credit Note',    label: 'Credit Note'    },
  { value: 'Debit Note',     label: 'Debit Note'     },
  { value: 'Bill of Supply', label: 'Bill of Supply' },
  { value: 'Delivery Challan', label: 'Delivery Challan' },
];

// ── Payment terms ─────────────────────────────────────────────────────────────
export const PAYMENT_TERMS = [
  { value: 'immediate', label: 'Due Immediately',    days: 0   },
  { value: 'net7',      label: 'Net 7 Days',         days: 7   },
  { value: 'net15',     label: 'Net 15 Days',        days: 15  },
  { value: 'net30',     label: 'Net 30 Days',        days: 30  },
  { value: 'net45',     label: 'Net 45 Days',        days: 45  },
  { value: 'net60',     label: 'Net 60 Days',        days: 60  },
  { value: 'net90',     label: 'Net 90 Days',        days: 90  },
  { value: 'custom',    label: 'Custom Date',        days: null },
];

// ── Bank account types ────────────────────────────────────────────────────────
export const ACCOUNT_TYPES = [
  { value: 'savings',  label: 'Savings Account'  },
  { value: 'current',  label: 'Current Account'  },
  { value: 'od',       label: 'Overdraft Account' },
  { value: 'cc',       label: 'Cash Credit Account' },
];

// ── Unit types ────────────────────────────────────────────────────────────────
export const UNIT_TYPES = [
  { value: 'NOS',  label: 'Numbers (NOS)'       },
  { value: 'PCS',  label: 'Pieces (PCS)'         },
  { value: 'KGS',  label: 'Kilograms (KGS)'      },
  { value: 'GMS',  label: 'Grams (GMS)'          },
  { value: 'LTR',  label: 'Litres (LTR)'         },
  { value: 'MTR',  label: 'Metres (MTR)'         },
  { value: 'SQM',  label: 'Square Metres (SQM)'  },
  { value: 'CBM',  label: 'Cubic Metres (CBM)'   },
  { value: 'HRS',  label: 'Hours (HRS)'          },
  { value: 'DAYS', label: 'Days (DAYS)'           },
  { value: 'MON',  label: 'Months (MON)'         },
  { value: 'BOX',  label: 'Box (BOX)'            },
  { value: 'PKT',  label: 'Packet (PKT)'         },
  { value: 'SET',  label: 'Set (SET)'            },
  { value: 'PAIR', label: 'Pair (PAIR)'          },
  { value: 'DZN',  label: 'Dozen (DZN)'          },
  { value: 'TON',  label: 'Tonnes (TON)'         },
  { value: 'ROLL', label: 'Roll (ROLL)'          },
  { value: 'UNIT', label: 'Unit (UNIT)'          },
];
