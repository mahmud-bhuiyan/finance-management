# Step 11 — Thin dashboard (manual test guide)

**Goal:** Confirm KPI cards, 2–3 expense charts, and basic filters (presets + custom range + category/department/vendor) for company admins and normal users.

**Maps to:** Phase 4 — Dashboard (MVP / thin)  
**Do not start Step 12 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-11-thin-dashboard.md`  
- PDF: `docs/manual-test-guides/step-11-thin-dashboard.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Dashboard folder)  
- Depends on Steps 08–10 (expenses + support data)

---

## Prerequisites

- [ ] Steps 01–10 already passing (or Step 10 checklist completed)
- [ ] PostgreSQL running; migrations applied
- [ ] Company admin + normal user in the same company
- [ ] Several expenses in the current month with categories / vendors (and preferably different dates)
- [ ] Server + client dev servers running (`recharts` installed on client)

---

## Setup commands

Server:

```bash
cd finance-management/server
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

Client:

```bash
cd finance-management/client
npm install
npm run dev
```

Open http://localhost:5173 and sign in as a **company admin**.

---

## Checklist

### A. Route access

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Home as company admin | Shows **Dashboard** link | [ ] |
| A2 | Open `/dashboard` as company admin | Page loads; filters + KPI cards + charts | [ ] |
| A3 | Open `/dashboard` as normal user (same company) | Same read-only dashboard (no expense edit UI here) | [ ] |
| A4 | Open `/dashboard` as Super Admin | Redirects to home (no tenant) | [ ] |
| A5 | Open `/dashboard` signed out | Redirects to login | [ ] |

### B. KPI cards (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Default **This month** | Total expense matches month’s expenses; count > 0 if data exists | [ ] |
| B2 | Total income | Shows `$0.00` (income module is Step 14) | [ ] |
| B3 | Net balance | Equals income − expense (negative when only expenses) | [ ] |
| B4 | Avg daily expense | Total expense ÷ inclusive days in range | [ ] |
| B5 | Highest expense | Shows largest amount in range (or — if empty) | [ ] |

### C. Charts + filters (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Charts present | Expense by day (line), by category (doughnut), by vendor (bar) | [ ] |
| C2 | Switch to **Last month** | KPIs/charts refresh for last month | [ ] |
| C3 | Switch to **Custom range** with from/to | Data limited to that range | [ ] |
| C4 | Filter by category | Totals and charts shrink to that category | [ ] |
| C5 | Filter by vendor | Same for vendor | [ ] |
| C6 | Empty range (future dates) | KPIs zero / — ; charts show empty state | [ ] |

### D. API (Postman or curl)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | `GET /api/v1/dashboard/summary?preset=this_month` as company admin | 200; `ok`, `kpis`, `charts`, `filters` | [ ] |
| D2 | Same as normal user | 200 | [ ] |
| D3 | `preset=custom` without from/to | 400 | [ ] |
| D4 | Super Admin (no tenant) | 403 / tenant required | [ ] |
| D5 | Soft-deleted expenses | Not included in totals | [ ] |

### E. Negative / security

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | Tenant A admin cannot see Tenant B totals | Only own-tenant aggregation | [ ] |
| E2 | No write endpoints on dashboard | Only `GET /summary` | [ ] |

---

## Pass criteria

All **required** rows (A–E) pass. Soft-deleted expenses stay out of KPIs. Normal users can view; Super Admin cannot without a tenant.

**When all required items pass:** mark related Notion tasks Done (FMS-30, FMS-31, and thin-slice of FMS-32 / FMS-33 / FMS-36 / FMS-37), then start **Step 12 — Full dashboard**.
