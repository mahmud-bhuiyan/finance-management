# Step 15 — Report Excel & PDF exports (manual test guide)

**Goal:** Confirm Excel (`.xlsx`) and PDF exports for `/reports`, same filters/roles as CSV, and that downloads work from the Reports UI.

**Maps to:** Phase 5 — Reporting (FMS-44 Excel, FMS-45 PDF)  
**Depends on:** Step 13 (summary + CSV). Step 14 income data is useful for PDF net-balance lines.

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-15-report-excel-pdf.md`  
- PDF: `docs/manual-test-guides/step-15-report-excel-pdf.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Reports folder — export.xlsx / export.pdf)  
- Depends on Steps 08–13 (and ideally Step 14 for income totals)

---

## Prerequisites

- [ ] Steps 01–13 implemented (Step 14 optional but recommended)
- [ ] PostgreSQL running; migrations applied
- [ ] Company admin + normal user in the same company
- [ ] Expenses (and ideally income) in the current month
- [ ] Server + client dev servers running (`npm install` in `server/` picks up `exceljs` + `pdfkit`)

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

### A. Reports UI — Excel

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Open `/reports` | Buttons: Download CSV, Download Excel, Download PDF | [ ] |
| A2 | Click **Download Excel** (this month) | Browser downloads a `.xlsx` file | [ ] |
| A3 | Open Excel | Sheet **Transactions**; header row matches CSV columns (id, type, occurredOn, amount, …) | [ ] |
| A4 | Filter type **Expenses only**, download Excel | Only `EXPENSE` rows | [ ] |
| A5 | Custom range with data | Filename / rows cover that range | [ ] |

### B. Reports UI — PDF

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Click **Download PDF** | Browser downloads a `.pdf` file | [ ] |
| B2 | Open PDF | Title **FMS Report**, period, summary totals (expense / income / net) | [ ] |
| B3 | PDF body | By month + category/department/vendor/payment sections present | [ ] |
| B4 | Transactions preview | Short list of matching rows (or “No matching transactions”) | [ ] |
| B5 | Empty future custom range | PDF still downloads; zeros / empty sections | [ ] |

### C. Roles

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Normal user Excel + PDF | Both downloads succeed (read-only reports) | [ ] |
| C2 | Super Admin `/reports` | Still redirects home (no tenant) | [ ] |

### D. API (Postman or curl)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | `GET /api/v1/reports/export.xlsx?preset=this_month&type=ALL` | 200; spreadsheet content-type; `.xlsx` disposition | [ ] |
| D2 | `GET /api/v1/reports/export.pdf?preset=this_month` | 200; `application/pdf`; `.pdf` disposition | [ ] |
| D3 | Same filters as CSV (`type`, categoryId, …) | 200; file reflects filters | [ ] |
| D4 | Unauthenticated export.xlsx / export.pdf | 401 | [ ] |

---

## Pass criteria

All **required** rows above pass.

**When all required items pass:** mark Notion tasks **FMS-44** (Excel) and **FMS-45** (PDF) Done. Phase 5 reporting exports are complete.

---

## Printable PDF

`docs/manual-test-guides/step-15-report-excel-pdf.pdf`
