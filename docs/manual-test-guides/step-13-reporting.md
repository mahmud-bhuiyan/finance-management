# Step 13 — Reporting (manual test guide)

**Goal:** Confirm report summary (monthly + category/department/vendor/payment breakdowns), filters, CSV export, and role access for `/reports`.

**Maps to:** Phase 5 — Reporting (CSV first; Excel/PDF later)  
**Do not start Step 14 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-13-reporting.md`  
- PDF: `docs/manual-test-guides/step-13-reporting.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Reports folder)  
- Depends on Steps 08–12 (expenses + dashboard filters)

---

## Prerequisites

- [ ] Steps 01–12 already passing (or Step 12 checklist completed)
- [ ] PostgreSQL running; migrations applied
- [ ] Company admin + normal user in the same company
- [ ] Expenses across at least two months, with categories / departments / vendors / payment methods on some rows
- [ ] Optional: a custom expense field with **Show in reports** enabled (and one with it disabled)
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

### A. Reports UI

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Open `/reports` from home | Summary cards + monthly table + by-category/department/vendor/payment tables | [ ] |
| A2 | Period **This year** (or multi-month custom range) | `byMonth` shows more than one month when data spans months | [ ] |
| A3 | Filter by category | Totals shrink; tables match filtered expenses | [ ] |
| A4 | Filter by department / vendor / payment method | Same for each dimension | [ ] |
| A5 | Custom range with from > to | Validation error (API 400 / UI stays or shows error) | [ ] |
| A6 | Empty future custom range | Zero totals; empty/zero tables | [ ] |

### B. CSV export

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Click **Download CSV** (this month) | Browser downloads a `.csv` file | [ ] |
| B2 | Open CSV | Columns include id, type, occurredOn, amount, notes, paymentMethod, category, department, vendor | [ ] |
| B3 | CSV type = **Expenses only** | Only `EXPENSE` rows | [ ] |
| B4 | Custom field with show-in-reports | Extra column with that field key appears when values exist | [ ] |
| B5 | Field with show-in-reports off | That key is **not** a CSV column | [ ] |

### C. Roles

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Normal user `/reports` | Read-only summary + can download CSV | [ ] |
| C2 | Normal user CSV | Custom columns only for fields marked visible to normal users (and show-in-reports) | [ ] |
| C3 | Super Admin `/reports` | Redirects home (no tenant) | [ ] |

### D. API (Postman or curl)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | `GET /api/v1/reports/summary?preset=this_month` (admin cookie) | 200; `summary`, `byMonth`, `byCategory`, … | [ ] |
| D2 | `GET /api/v1/reports/export.csv?preset=this_month` | 200; `Content-Type: text/csv`; attachment disposition | [ ] |
| D3 | `preset=custom` without from/to | 400 | [ ] |
| D4 | Invalid `paymentMethod` | 400 | [ ] |
| D5 | Unauthenticated | 401 | [ ] |

---

## Pass criteria

All **required** rows above pass. Excel/PDF export remains out of scope here — covered in **Step 15**.

**When all required items pass:** mark related Notion tasks Done (FMS-38, FMS-39, FMS-40, FMS-41, FMS-42, FMS-43, FMS-46), then start **Step 14 — Income module**. Excel (FMS-44) and PDF (FMS-45) are Step 15.

---

## Printable PDF

`docs/manual-test-guides/step-13-reporting.pdf`
