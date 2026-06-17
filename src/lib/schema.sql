-- ============================================================
--  GST Invoice Generator — PostgreSQL Schema
--  Safe to run multiple times (CREATE TABLE IF NOT EXISTS)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
--  TABLE 1: seller_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS seller_profiles (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255)  NOT NULL,
  owner_name    VARCHAR(255),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  state_code    VARCHAR(5),
  pin_code      VARCHAR(10),
  gstin         VARCHAR(15),
  pan           VARCHAR(10),
  email         VARCHAR(255),
  phone         VARCHAR(20),
  website       VARCHAR(255),
  logo_url      TEXT,
  is_default    BOOLEAN       DEFAULT true,
  created_at    TIMESTAMP     DEFAULT NOW(),
  updated_at    TIMESTAMP     DEFAULT NOW()
);

-- ============================================================
--  TABLE 2: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name   VARCHAR(255)   NOT NULL,
  contact_name    VARCHAR(255),
  address         TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  state_code      VARCHAR(5),
  pin_code        VARCHAR(10),
  gstin           VARCHAR(15),
  pan             VARCHAR(10),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  total_invoiced  DECIMAL(15,2)  DEFAULT 0,
  invoice_count   INTEGER        DEFAULT 0,
  created_at      TIMESTAMP      DEFAULT NOW(),
  updated_at      TIMESTAMP      DEFAULT NOW()
);

-- ============================================================
--  TABLE 3: invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number      VARCHAR(50)    NOT NULL UNIQUE,
  invoice_type        VARCHAR(50)    DEFAULT 'Tax Invoice',
  invoice_date        DATE           NOT NULL,
  due_date            DATE,
  financial_year      VARCHAR(10),
  place_of_supply     VARCHAR(100),
  payment_terms       VARCHAR(50),
  tax_mode            VARCHAR(20)    DEFAULT 'intrastate',
  status              VARCHAR(20)    DEFAULT 'draft'
                        CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  seller_data         JSONB          NOT NULL,
  buyer_data          JSONB          NOT NULL,
  line_items          JSONB          NOT NULL DEFAULT '[]',
  additional_charges  JSONB          DEFAULT '{}',
  bank_details        JSONB          DEFAULT '{}',
  customization       JSONB          DEFAULT '{}',
  sub_total           DECIMAL(15,2)  DEFAULT 0,
  total_discount      DECIMAL(15,2)  DEFAULT 0,
  taxable_amount      DECIMAL(15,2)  DEFAULT 0,
  total_cgst          DECIMAL(15,2)  DEFAULT 0,
  total_sgst          DECIMAL(15,2)  DEFAULT 0,
  total_igst          DECIMAL(15,2)  DEFAULT 0,
  total_tax           DECIMAL(15,2)  DEFAULT 0,
  grand_total         DECIMAL(15,2)  DEFAULT 0,
  amount_in_words     TEXT,
  notes               TEXT,
  terms               TEXT,
  pdf_url             TEXT,
  created_at          TIMESTAMP      DEFAULT NOW(),
  updated_at          TIMESTAMP      DEFAULT NOW()
);

-- ============================================================
--  TABLE 4: invoice_items (denormalized for reporting)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id       UUID           REFERENCES invoices(id) ON DELETE CASCADE,
  sr_no            INTEGER,
  description      TEXT           NOT NULL,
  hsn_code         VARCHAR(20),
  quantity         DECIMAL(10,3),
  unit             VARCHAR(20),
  rate             DECIMAL(15,2),
  discount_percent DECIMAL(5,2)   DEFAULT 0,
  gst_rate         DECIMAL(5,2),
  taxable_amount   DECIMAL(15,2),
  cgst_amount      DECIMAL(15,2),
  sgst_amount      DECIMAL(15,2),
  igst_amount      DECIMAL(15,2),
  total_amount     DECIMAL(15,2)
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_date
  ON invoices(invoice_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_invoices_buyer_gstin
  ON invoices((buyer_data->>'gstin'));

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id
  ON invoice_items(invoice_id);

-- ============================================================
--  AUTO-UPDATE updated_at via trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: seller_profiles
DROP TRIGGER IF EXISTS trg_seller_profiles_updated_at ON seller_profiles;
CREATE TRIGGER trg_seller_profiles_updated_at
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: clients
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: invoices
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
