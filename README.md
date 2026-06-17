<div align="center">

<br />

<img src="./public/logo.png" alt="TaxFlow Logo" width="72" height="72" style="border-radius: 12px;" />

<h1>TaxFlow</h1>

<p><strong>Premium GST Invoicing & Compliance Platform for Modern Indian Businesses</strong></p>

<p>
  <a href="https://tax-flow-xi.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_App-tax--flow--xi.vercel.app-5e6ad2?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E5FF?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel" />
</p>

<p>
  <img src="https://img.shields.io/badge/GST-Compliant-green?style=flat-square" />
  <img src="https://img.shields.io/badge/GSTR--1-Ready-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/India-Localized-FF6B35?style=flat-square" />
  <img src="https://img.shields.io/badge/Dark_Mode-Native-1a1a1a?style=flat-square" />
</p>

<br/>

> *"The invoicing system for teams and freelancers — built for India's modern tax framework."*

<br/>

</div>

---

## 📸 Application Preview

<div align="center">

### 🏠 Marketing Landing Page
*The first impression — a sleek, animated dark mode landing page with live auth detection*

![Landing Page](./public/landing.png)

<br/>

### 🖥️ Dashboard Workspace
*Real-time financial health overview with live database stats and an activity feed*

![Dashboard](./public/dash.png)

<br/>

### ✏️ GST Invoice Editor
*Generate fully compliant GST invoices with auto-calculated CGST/SGST/IGST splits and PDF export*

![Invoice Editor](./public/create.png)

<br/>

### 📋 Invoice Ledger
*Paginated invoice management with instant status updates, search & PDF download*

![Invoice Ledger](./public/invoices.png)

<br/>

### 👥 Client Directory
*Centralized client CRM with live GSTIN validation and automatic state code detection*

![Clients](./public/clients.png)

<br/>

### 📊 GSTR-1 Analytics
*GST slab breakdowns, monthly trends, top billed items and client revenue distribution*

![Analytics](./public/analytics.png)

<br/>

### 🏢 Business Profile Setup
*Configure your GSTIN, bank account details, signature, and compliance preferences*

![Business Setup](./public/business.png)

</div>

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 🧾 Invoice Builder
- Auto-computed **CGST + SGST** (intra-state) or **IGST** (inter-state) based on supply state
- Smart **HSN code pre-population** for software, consulting, and retail
- **Amount-in-Words** auto-conversion (Lakhs / Crores Indian system)
- **GSTIN checksum validation** with state code extraction
- High-fidelity **A4 PDF export** via html2canvas
- **WhatsApp share** for instant client communication
- **Draft auto-recovery** — never lose unsaved work
- **Keyboard shortcut** `Ctrl+S` / `Cmd+S` to save

</td>
<td width="50%">

### 📂 Invoice Management
- Paginated **Invoices Ledger** with 5 status types: `Draft` → `Sent` → `Paid` → `Overdue` → `Cancelled`
- **Instant status updates** (Mark as Paid, Mark as Sent) without page reload
- One-click **direct PDF generation** from the list view
- **Bulk filter** by status and debounced text search
- Individual invoice **duplication** with auto-incremented number
- **History Drawer** — quickly reload any recent invoice into the editor

</td>
</tr>
<tr>
<td width="50%">

### 👤 Client CRM
- **Client registration modal** with PAN + GSTIN validation
- Automatic Indian **state name ↔ code** lookup
- Dynamic client stats: invoice count, total billed, pending amounts
- **Self-healing data** — stats computed live via SQL joins (never stale)
- Fast client search and instant re-binding to invoice buyer fields

</td>
<td width="50%">

### 📈 Analytics & Reporting
- **GSTR-1 Slab Table**: tax collected per slab (5% / 12% / 18% / 28%)
- **Monthly Sales Trend** — proportional bar charts for the past 6 months
- **Top Invoiced Items** — revenue by item description
- **Top Client Distribution** — billing concentration by buyer
- Primary KPI cards: Total Sales, Taxable Amount, CGST, SGST, IGST

</td>
</tr>
<tr>
<td width="50%">

### 🔍 Command Palette Search
- **Spotlight-style overlay** triggered by `Ctrl+K` / `Cmd+K`
- Parallel debounced API calls for invoices + clients
- Fully keyboard navigable (`↑` `↓` `Enter` `Esc`)
- Categorized results: Navigation, GST Invoices, Clients

</td>
<td width="50%">

### ⭐ Favorites Bookmarks
- Bookmark **any page state** (including filters like `/invoices?status=unpaid`)
- Inline color-coded dot indicators with **9 HSL accent colors**
- Inline rename + recolor without leaving the sidebar
- Persisted to `localStorage` — survives sessions

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Authentication
- **Google OAuth** one-click login
- **Email + Password** sign-in and sign-up
- Supabase SSR session management with JWT refresh
- **Avatar upload** (Base64, < 200KB) with live sync to sidebar
- **Display name update** synced across all UI surfaces
- **Danger Zone**: complete data wipe + sign-out

</td>
<td width="50%">

### ⚡ Performance & UX
- **Instant nav spinners** — sidebar icons animate immediately on click
- **Skeleton loaders** — form-matched placeholders while loading invoices
- **Synchronized settings skeletons** — no layout flashes
- **Guest "Sign In to Save"** CTA when not authenticated
- 100% **production build** with zero warnings (`npm run build`)

</td>
</tr>
</table>

---

## 🏗️ System Architecture

TaxFlow separates concerns across three clear layers: **Client UI**, **Next.js API Routes**, and **External Services**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌─────────────────┐   ┌──────────────────┐  ┌─────────────┐  │
│  │  Landing Page   │   │  Invoice Editor  │  │  Dashboard  │  │
│  │      (/)        │   │ (/invoices/new)  │  │    Clients  │  │
│  └────────┬────────┘   └────────┬─────────┘  │  Analytics  │  │
│           │                     │             │  Settings   │  │
│           └──────────┬──────────┘             └──────┬──────┘  │
│                      │                               │          │
│              ┌───────▼───────────────────────────────▼───────┐ │
│              │          Sidebar + Command Palette             │ │
│              │   (Navigation / Favorites / Auth Session)     │ │
│              └───────────────────────┬───────────────────────┘ │
│                                      │                          │
└──────────────────────────────────────┼──────────────────────────┘
                                       │  HTTP Requests
┌──────────────────────────────────────▼──────────────────────────┐
│                     Next.js App Router (Server)                  │
│                                                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ /api/invoices │  │ /api/clients  │  │  /api/dashboard   │   │
│  │ GET POST PUT  │  │  GET POST     │  │  /api/seller      │   │
│  │  PATCH DELETE │  │  DELETE       │  │  /api/analytics   │   │
│  └───────┬───────┘  └───────┬───────┘  └──────────┬────────┘   │
│          │                  │                       │            │
│          └──────────────────┼───────────────────────┘            │
│                             │                                    │
│              ┌──────────────▼───────────────┐                   │
│              │      Neon PostgreSQL          │                   │
│              │  (Serverless Connection Pool) │                   │
│              └──────────────────────────────┘                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Supabase SSR Auth Middleware               │     │
│  │        (JWT Session · OAuth · Row-Level Security)      │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | 🌍 Public | Marketing landing page with feature showcase |
| `/invoices/new` | 🌍 Public | Invoice Builder Editor (guest + auth) |
| `/dashboard` | 🔐 Auth | Live stats dashboard and activity feed |
| `/invoices` | 🔐 Auth | Invoice Ledger with filtering and actions |
| `/clients` | 🔐 Auth | Client CRM with modal registration |
| `/analytics` | 🔐 Auth | GSTR-1 reporting and trend charts |
| `/seller` | 🔐 Auth | Business profile and bank details setup |
| `/settings` | 🔐 Auth | Account, security, preferences, history |
| `/login` | 🌍 Public | Email / Google authentication |
| `/api/invoices` | 🔐 API | CRUD for invoices (GET, POST, PUT, PATCH, DELETE) |
| `/api/clients` | 🔐 API | CRUD for clients |
| `/api/dashboard` | 🔐 API | Aggregated stats for dashboard |
| `/api/analytics` | 🔐 API | GSTR-1 tax slab aggregation queries |
| `/auth/callback` | 🔄 OAuth | Supabase OAuth token exchange |

---

## 🗄️ Database Schema

The data model is structured around four core entities, all linked to the authenticated Supabase user:

```
seller_profiles                    clients
─────────────────────────         ────────────────────────────
id           UUID (PK)            id           UUID (PK)
user_id      UUID (FK → auth)     user_id      UUID (FK → auth)
business_name  TEXT               business_name  TEXT
owner_name     TEXT               email          TEXT
address        TEXT               phone          TEXT
state          TEXT               address        TEXT
gstin          TEXT               state          TEXT
pan            TEXT               gstin          TEXT
bank_details   JSONB              pan            TEXT
signature      TEXT
created_at     TIMESTAMP


invoices                           invoice_items
─────────────────────────────     ─────────────────────────────
id             UUID (PK)          id             UUID (PK)
user_id        UUID (FK → auth)   invoice_id     UUID (FK → invoices)
invoice_number TEXT               description    TEXT
invoice_date   DATE               quantity       INTEGER
due_date       DATE               rate           DECIMAL
client_id      UUID (FK → clients)hsn_code       TEXT
status         TEXT               gst_rate       DECIMAL
taxable_amount DECIMAL            taxable_amount DECIMAL
tax_amount     DECIMAL            tax_amount     DECIMAL
grand_total    DECIMAL            amount         DECIMAL
seller_data    JSONB
buyer_data     JSONB
bank_details   JSONB
customization  JSONB
created_at     TIMESTAMP
```

---

## 🔄 Invoice Save & Load Flow

```
User fills form fields
        │
        ▼
useInvoiceBuilder hook updates state
        │
        ├──────────────────────────────────────────────┐
        │                                              │
        ▼                                              ▼
LocalStorage autosave (draft)             Ctrl+S / "Save Invoice" button
                                                       │
                                                       ▼
                                          New invoice?  Existing invoice?
                                               │               │
                                               ▼               ▼
                                    POST /api/invoices   PUT /api/invoices/[id]
                                               │               │
                                               └───────┬───────┘
                                                       │
                                                       ▼
                                            Neon PostgreSQL persists
                                                       │
                                                       ▼
                                        Return { id, invoice_number }
                                                       │
                                                       ▼
                                    URL replaced → /invoices/new?id=UUID
                                                       │
                                                       ▼
                                           ✅ Success toast shown
```

---

## 🔐 Authentication & Authorization Flow

```
User visits app
      │
      ▼
Middleware checks JWT session (Supabase SSR)
      │
      ├── Public path? (/, /login, /invoices/new)
      │         │
      │         └── ✅ Allow through
      │
      ├── Protected path? (/dashboard, /invoices, ...)
      │         │
      │         ├── Authenticated? ──── ✅ Allow through
      │         │
      │         └── Not authenticated? → Redirect to /login?next=<path>
      │
      └── /login while authenticated? → Redirect to /dashboard
```

---

## 🧱 Project Structure

```
TaxFlow/
├── public/                      # Static assets (images, logo)
│   ├── logo.png
│   ├── landing.png
│   ├── dash.png
│   ├── create.png
│   ├── invoices.png
│   ├── clients.png
│   ├── analytics.png
│   └── business.png
│
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.js              # 🏠 Marketing landing page (/)
│   │   ├── layout.js            # Root layout with Toaster
│   │   ├── globals.css          # Global styles + custom scrollbar
│   │   │
│   │   ├── invoices/
│   │   │   ├── new/page.js      # ✏️  Invoice Builder Editor (/invoices/new)
│   │   │   └── page.js          # 📋 Invoice Ledger (/invoices)
│   │   │
│   │   ├── dashboard/page.js    # 🖥️  Dashboard (/dashboard)
│   │   ├── clients/page.js      # 👥 Clients CRM (/clients)
│   │   ├── analytics/page.js    # 📊 GSTR-1 Analytics (/analytics)
│   │   ├── seller/page.js       # 🏢 Business Profile (/seller)
│   │   ├── settings/page.js     # ⚙️  Account Settings (/settings)
│   │   ├── login/page.js        # 🔐 Auth Page (/login)
│   │   │
│   │   ├── api/                 # REST API routes
│   │   │   ├── invoices/
│   │   │   │   ├── route.js     # GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.js          # GET + PUT + DELETE
│   │   │   │       └── duplicate/route.js # POST (copy invoice)
│   │   │   ├── clients/route.js
│   │   │   ├── dashboard/route.js
│   │   │   ├── seller/route.js
│   │   │   └── auth/
│   │   │       ├── signout/route.js
│   │   │       └── delete-account/route.js
│   │   │
│   │   └── auth/callback/route.js  # OAuth token exchange
│   │
│   ├── components/
│   │   ├── Sidebar.js           # Navigation, search, favorites, auth footer
│   │   ├── DraftBanner.jsx      # Auto-recovery banner
│   │   ├── HistoryDrawer.jsx    # Recent invoices slide-over
│   │   ├── forms/               # Invoice form sections
│   │   │   ├── InvoiceMetaForm.js
│   │   │   ├── SellerForm.js
│   │   │   ├── BuyerForm.js
│   │   │   ├── LineItemsTable.js
│   │   │   ├── AdditionalCharges.js
│   │   │   ├── BankDetails.js
│   │   │   └── CustomizationPanel.js
│   │   ├── preview/
│   │   │   └── InvoicePreview.js  # A4 pixel-perfect invoice render
│   │   └── ui/
│   │       ├── Button.js
│   │       └── Skeleton.js
│   │
│   ├── hooks/
│   │   └── useInvoiceBuilder.js  # Master invoice state manager
│   │
│   ├── utils/
│   │   ├── pdfGenerator.js       # html2canvas → jsPDF export
│   │   └── supabase/
│   │       ├── client.js         # Browser Supabase client
│   │       └── server.js         # SSR Supabase client
│   │
│   ├── constants/
│   │   └── defaultValues.js      # Default invoice / seller templates
│   │
│   └── middleware.js             # Route protection + session refresh
│
├── .env.local                    # Environment variables (not committed)
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **UI Library** | React 18 | Component-based rendering |
| **Styling** | Tailwind CSS | Utility-first dark design system |
| **Authentication** | Supabase Auth | OAuth + JWT session management |
| **Database** | Neon PostgreSQL (Serverless) | Invoices, clients, profiles |
| **PDF Export** | html2canvas + jsPDF | High-fidelity A4 PDF generation |
| **Icons** | lucide-react | Consistent icon set |
| **Toasts** | react-hot-toast | Non-blocking notifications |
| **Drag & Drop** | @hello-pangea/dnd | Line item reordering |
| **Deployment** | Vercel | Edge-optimized hosting |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js **v18+**
- A [Supabase](https://supabase.com) project with Google OAuth enabled
- A [Neon](https://neon.tech) PostgreSQL database

### 1 — Clone
```bash
git clone https://github.com/your-username/TaxFlow.git
cd TaxFlow
```

### 2 — Install Dependencies
```bash
npm install
```

### 3 — Configure Environment
Create a `.env.local` file in the project root:

```env
# ── Neon PostgreSQL ─────────────────────────────────
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# ── Supabase ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4 — Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5 — Build for Production
```bash
npm run build
```
Produces a fully optimized `.next/` output. Zero warnings, zero errors. ✅

---

## 📦 Deployment

TaxFlow is deployed on **Vercel** with automatic CI/CD from the `main` branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/TaxFlow)

1. Push to `main` → Vercel auto-deploys
2. Set the same `.env.local` variables in **Vercel → Settings → Environment Variables**
3. Configure Supabase redirect URLs to include `https://your-app.vercel.app/auth/callback`

---

## 🧪 Key API Endpoints

<details>
<summary><strong>📑 Invoices API</strong></summary>

```http
GET    /api/invoices?search=&status=&page=&limit=
POST   /api/invoices
PUT    /api/invoices/:id
PATCH  /api/invoices/:id          { status: "paid" | "sent" | "cancelled" }
DELETE /api/invoices/:id
POST   /api/invoices/:id/duplicate
GET    /api/invoices/:id
```
</details>

<details>
<summary><strong>👥 Clients API</strong></summary>

```http
GET    /api/clients?search=
POST   /api/clients               { business_name, gstin, email, ... }
DELETE /api/clients/:id
```
</details>

<details>
<summary><strong>📊 Dashboard & Analytics</strong></summary>

```http
GET    /api/dashboard             → { totalInvoices, totalClients, revenue, pending, recentInvoices }
GET    /analytics                 → Server-rendered GSTR-1 aggregation page
```
</details>

<details>
<summary><strong>🏢 Seller Profile</strong></summary>

```http
GET    /api/seller
POST   /api/seller                { business_name, gstin, bank_details, ... }
```
</details>

---

## 🌟 GST Compliance Features

| Feature | Specification |
|---------|---------------|
| **Tax Modes** | Intra-State (CGST + SGST) & Inter-State (IGST) |
| **Tax Slabs** | 0%, 5%, 12%, 18%, 28% |
| **HSN / SAC Codes** | 40+ pre-loaded codes with descriptions |
| **GSTIN Validation** | 15-character format + checksum verification |
| **State Code Mapping** | All 37 Indian states and UTs |
| **Amount in Words** | Indian numbering system (Lakhs / Crores) |
| **GSTR-1 Summary** | Slab-wise taxable amount + tax collected table |
| **Invoice Numbering** | Custom prefix + auto-incremented serial |
| **Payment Terms** | Due on Receipt, Net 7, Net 15, Net 30 |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss changes before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

© 2026 **TaxFlow Technologies Private Limited**

---

<div align="center">

<br/>

**Built with ❤️ for modern Indian businesses**

<br/>

[🌐 Live App](https://tax-flow-xi.vercel.app/) · [🐛 Report Bug](https://github.com/your-username/TaxFlow/issues) · [💡 Request Feature](https://github.com/your-username/TaxFlow/issues)

<br/>

<img src="https://img.shields.io/badge/Made_with-Next.js-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/Hosted_on-Vercel-black?style=flat-square&logo=vercel" />
<img src="https://img.shields.io/badge/Database-Neon_PostgreSQL-00E5FF?style=flat-square&logo=postgresql" />
<img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=flat-square&logo=supabase" />

</div>
