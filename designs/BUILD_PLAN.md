# Arslan Logistics Dashboard — Build Plan

## Design Assets
10 screens provided (8 with HTML code, 2 screenshot-only):

| # | Page | HTML | Screenshot | Priority |
|---|------|------|------------|----------|
| 1 | Login Page | ✅ | ✅ | P0 |
| 2 | Main Dashboard Overview 1 | ✅ | ✅ | P0 |
| 3 | Main Dashboard Overview 2 | ❌ | ✅ | P0 (continuation of dashboard scroll) |
| 4 | Carrier Directory & Credentials | ✅ | ✅ | P0 |
| 5 | Shipment Tracking & Management | ✅ | ✅ | P1 |
| 6 | Live Container Tracker (Map) | ✅ | ✅ | P1 |
| 7 | Financial Analytics Spend 1 | ✅ | ✅ | P2 |
| 8 | Financial Analytics Spend 2 | ✅ | ✅ | P2 |
| 9 | New Quotation Request Form | ❌ | ✅ | P1 |
| 10 | Register Page (temporary) | already built | N/A | Done |

## Design System (extracted from HTML)

### Colors
- **Primary Blue:** `#137fec`
- **Background Light:** `#f6f7f8`
- **Background Dark:** `#101922`
- **Text Primary:** `slate-900` / `#0f172a`
- **Text Secondary:** `slate-500` / `#64748b`
- **Success Green:** `#38A169` / `emerald-500`
- **Danger Red:** `#E53E3E` / `red-500`
- **Warning Amber:** `amber-500`
- **Card Background:** `white` / `slate-900` (dark)
- **Border:** `slate-200` / `slate-700` (dark)

### Typography
- **Font:** Inter (400, 500, 600, 700, 800, 900)
- **Icons:** Material Symbols Outlined (Google)
- **Headings:** Bold/Extrabold, tracking-tight
- **Labels:** Uppercase, letter-spaced, text-xs, slate-500
- **Body:** Regular, text-sm, slate-700

### Components
- **Cards:** White bg, rounded-xl, border slate-200, p-5
- **Buttons Primary:** bg-primary, text-white, rounded-lg, px-5 py-2.5
- **Buttons Secondary:** border slate-300, text-slate-700, rounded-lg
- **Badges/Pills:** rounded-full, px-2.5 py-1, text-xs, font-semibold
- **Inputs:** border slate-300, rounded-lg, px-4 py-3, focus:ring-primary
- **Tables:** Header uppercase xs, rows with hover state, divider lines
- **Sidebar:** White bg, w-60, border-r, fixed left

### Dark Mode
- Full dark mode support via `dark:` classes
- Dark bg: `#101922` / `slate-900`
- Dark cards: `slate-800`
- Dark text: `slate-100`

## App Structure (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (font, providers)
│   ├── page.tsx                ← Redirect to /dashboard
│   ├── auth/
│   │   ├── layout.tsx          ← Auth layout (no sidebar)
│   │   ├── login/page.tsx      ← Login (split screen design)
│   │   └── register/page.tsx   ← Register (temporary, disable later)
│   ├── dashboard/
│   │   ├── layout.tsx          ← Dashboard layout (sidebar + topbar)
│   │   ├── page.tsx            ← Main Dashboard Overview
│   │   ├── carriers/
│   │   │   └── page.tsx        ← Carrier Directory & Credentials
│   │   ├── shipments/
│   │   │   └── page.tsx        ← Shipment Tracking & Management
│   │   ├── tracker/
│   │   │   └── page.tsx        ← Live Container Tracker (Map)
│   │   ├── quotes/
│   │   │   └── page.tsx        ← Quotation Request + History
│   │   ├── analytics/
│   │   │   └── page.tsx        ← Financial Analytics & Spend
│   │   ├── messages/
│   │   │   └── page.tsx        ← Messages/Inbox (future)
│   │   └── settings/
│   │       └── page.tsx        ← Settings (future)
│   └── api/
│       └── credentials/
│           └── route.ts        ← Server-side encrypt/decrypt endpoint
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         ← Left sidebar navigation
│   │   ├── TopBar.tsx          ← Top header bar
│   │   └── DashboardShell.tsx  ← Wraps sidebar + topbar + content
│   ├── ui/
│   │   ├── Card.tsx            ← Reusable card component
│   │   ├── Badge.tsx           ← Status badges (pill)
│   │   ├── Button.tsx          ← Primary/Secondary buttons
│   │   ├── Input.tsx           ← Form inputs
│   │   ├── Table.tsx           ← Data table
│   │   ├── Modal.tsx           ← Modal/Dialog
│   │   └── ProgressBar.tsx     ← Progress indicator
│   ├── dashboard/
│   │   ├── StatsCards.tsx      ← KPI stat cards row
│   │   ├── CarrierHubCards.tsx ← Carrier cards grid
│   │   ├── RecentReplies.tsx   ← Messages preview
│   │   └── ActiveShipments.tsx ← Shipments table
│   ├── carriers/
│   │   ├── CarrierCard.tsx     ← Individual carrier card
│   │   ├── CarrierGrid.tsx     ← Grid of all carriers
│   │   ├── CredentialModal.tsx ← Encrypted credential viewer
│   │   └── AddCarrierForm.tsx  ← Add new carrier form
│   ├── shipments/
│   │   ├── ShipmentTable.tsx   ← Full shipment management table
│   │   ├── ShipmentFilters.tsx ← Filter controls
│   │   └── ShipmentDetail.tsx  ← Single shipment detail view
│   ├── tracker/
│   │   ├── TrackerMap.tsx      ← Leaflet/Mapbox map component
│   │   ├── ShipmentList.tsx    ← Left panel shipment list
│   │   └── ShipmentPopup.tsx   ← Map popup with details
│   ├── quotes/
│   │   ├── QuoteForm.tsx       ← New quote request form
│   │   └── QuoteTable.tsx      ← Quotes comparison table
│   └── analytics/
│       ├── SpendChart.tsx      ← Bar chart (spending by carrier)
│       ├── CostBreakdown.tsx   ← Donut chart
│       ├── KPICards.tsx        ← Financial KPI cards
│       └── TransactionTable.tsx← Recent transactions
├── lib/
│   ├── supabase/               ← Already set up ✅
│   ├── encryption.ts           ← Already set up ✅
│   └── types.ts                ← Already set up ✅ (may need extensions)
└── middleware.ts               ← Already set up ✅
```

## Build Phases

### Phase 1 — Core Shell (1-2 hours)
- [ ] Root layout with Inter font + dark mode provider
- [ ] Sidebar component (from design HTML)
- [ ] TopBar component (from design HTML)
- [ ] DashboardShell layout wrapper
- [ ] Redirect `/` to `/dashboard`
- [ ] Login page reskin (use the split-screen design HTML)

### Phase 2 — Main Dashboard (2-3 hours)
- [ ] Stats cards (Active Shipments, Pending Quotes, Carriers, Revenue)
- [ ] Carrier Hub cards (top 4 carriers with status)
- [ ] Recent Replies/Messages section
- [ ] Active Shipments table
- [ ] Wire to Supabase data (forwarders, quotes, shipments)

### Phase 3 — Carrier Directory (2-3 hours)
- [ ] Carrier grid with category tabs (All, Global, Regional, Africa, RORO)
- [ ] Carrier cards with status badges (Authenticated, Pending, Not Linked)
- [ ] Add/Edit carrier modal form
- [ ] Encrypted credential storage (view/add/edit credentials)
- [ ] Server-side API route for encryption/decryption
- [ ] "Connect Carrier" / "Quotation Page" actions
- [ ] Search and filter

### Phase 4 — Shipment Tracking (2 hours)
- [ ] Shipment management table with filters
- [ ] Add/Edit shipment modal
- [ ] Status management (booked → in_transit → arrived → delivered)
- [ ] Export CSV functionality

### Phase 5 — Quotes (1-2 hours)
- [ ] New quotation request form (from design screenshot)
- [ ] Quotes table with comparison view
- [ ] Quote status management

### Phase 6 — Live Tracker Map (2-3 hours)
- [ ] Leaflet.js integration
- [ ] Left panel shipment list with filters
- [ ] Map markers for shipments
- [ ] Popup cards with shipment details
- [ ] Layer toggles (Standard, Weather, Currents)
- [ ] Carrier fleet legend

### Phase 7 — Financial Analytics (2 hours)
- [ ] KPI cards (Total Spend, Avg Cost, Outstanding)
- [ ] Spending Trends bar chart (Chart.js or Recharts)
- [ ] Cost Breakdown donut chart
- [ ] Recent Transactions table

### Phase 8 — Polish & Deploy
- [ ] Dark mode toggle
- [ ] Mobile responsive
- [ ] Loading states / skeletons
- [ ] Error handling
- [ ] Vercel deployment
- [ ] Seed database with forwarder data (all 17 companies)

## External Dependencies Needed
- `recharts` or `chart.js` — charts for analytics
- `leaflet` + `react-leaflet` — map for live tracker
- `lucide-react` or keep Material Symbols — icons

## Database Seeding
Pre-populate the 17 forwarders with all contact info collected today:
- 6 Global: DB Schenker, K+N, Maersk, MSC, CMA CGM, Hapag-Lloyd
- 5 Regional: Arkas, DFDS (ex-Ekol), Mars, Horoz, Omsan
- 2 Africa: Spedag, Freight In Time
- 2 RORO: Sallaum, EUKOR

## Notes
- Auth already working ✅
- Supabase schema deployed ✅
- Encryption module ready ✅
- Types defined ✅
- API layer built ✅
- Register page exists for testing (disable before production)
- No Prisma — Supabase client only ✅
