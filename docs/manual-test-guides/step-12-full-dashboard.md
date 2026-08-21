# Step 12 — Full dashboard (manual test guide)

**Goal:** Confirm remaining chart types (pie, area, stacked bar), department + payment-method widgets, monthly / income-vs-expense series, and payment-method filter on dashboard and expenses.

**Maps to:** Phase 4 — Dashboard (full)  
**Do not start Step 13 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-12-full-dashboard.md`  
- PDF: `docs/manual-test-guides/step-12-full-dashboard.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Dashboard folder)  
- Depends on Step 11 (thin dashboard) + Steps 08–10 (expenses)

---

## Prerequisites

- [ ] Steps 01–11 already passing (or Step 11 checklist completed)
- [ ] PostgreSQL running; migrations applied (includes `step12_payment_method`)
- [ ] Company admin + normal user in the same company
- [ ] Expenses across **at least two months**, with categories, departments, vendors, and payment methods set on some rows
- [ ] Server + client dev servers running

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

### A. Payment method on expenses

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Create expense with payment method **Card** | Saves; list shows **Card** in Payment column | [ ] |
| A2 | Edit expense → change to **Bank transfer** | List updates | [ ] |
| A3 | Filter expenses by payment method | Only matching rows | [ ] |
| A4 | Clear payment method on edit | Shows **—** | [ ] |

### B. Dashboard charts (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Open `/dashboard` | KPI cards + chart grid load | [ ] |
| B2 | Chart types present | Line (by day), Area (monthly), Doughnut (category), Pie (department), Bar (vendor + payment), Stacked bar (month × category), Income vs expense | [ ] |
| B3 | Switch to **This year** (or range spanning months) | Area / stacked / income-vs-expense show monthly buckets | [ ] |
| B4 | Filter by department | KPIs and charts shrink | [ ] |
| B5 | Filter by payment method | Same for payment method | [ ] |
| B6 | Income vs expense | Expense bars match data; income stays `$0` until Step 14 | [ ] |
| B7 | Empty future custom range | Empty-state messages on charts; KPIs zero / — | [ ] |

### C. Roles

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Normal user `/dashboard` | Read-only full chart set + filters | [ ] |
| C2 | Super Admin `/dashboard` | Redirects home | [ ] |

### D. API (Postman or curl)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | `GET /api/v1/dashboard/summary?preset=this_month` | 200; charts include `expenseByDepartment`, `expenseByPaymentMethod`, `expenseByMonth`, `incomeVsExpenseByMonth`, `expenseStackedByMonthCategory` | [ ] |
| D2 | `…&paymentMethod=CARD` | Filters echoed; totals only for CARD expenses | [ ] |
| D3 | Invalid `paymentMethod=FOO` | 400 | [ ] |
| D4 | Soft-deleted expenses | Still excluded | [ ] |

### E. Negative / security

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | Tenant A cannot see Tenant B aggregates | Own-tenant only | [ ] |
| E2 | Dashboard remains read-only | Only `GET /summary` | [ ] |

---

## Pass criteria

All **required** rows (A–E) pass. All six chart families from the Phase 4 plan appear (bar, line, pie, doughnut, area, stacked bar). Payment method is optional on expenses and usable as a dashboard/list filter.

**When all required items pass:** mark related Notion tasks Done (FMS-32, FMS-33, FMS-34, FMS-35), then start **Step 13 — Reporting**.
