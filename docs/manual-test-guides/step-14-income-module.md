# Step 14 — Income module (manual test guide)

**Goal:** Confirm income CRUD on the shared `financial_transactions` model (`type=INCOME`), dynamic income fields, soft delete + audit, reuse of categories/departments/vendors (customer/payor), and dashboard Net Balance = Income − Expense.

**Maps to:** Phase 6 — Income  
**Do not treat the MVP as complete until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-14-income-module.md`  
- PDF: `docs/manual-test-guides/step-14-income-module.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Incomes folder)  
- Depends on Steps 08–13 (expenses, support data, dashboard, reports)

---

## Prerequisites

- [ ] Steps 01–13 already implemented (Step 13 manual pass preferred)
- [ ] PostgreSQL running; migrations applied
- [ ] Company admin + normal user in the same company
- [ ] Optional: an enabled **Income** custom field from Step 07
- [ ] At least one category / vendor (customer) from Step 09
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

### A. Route access

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Home as company admin | Shows **Income** link | [ ] |
| A2 | Open `/incomes` as company admin | Page loads; add form visible | [ ] |
| A3 | Open `/incomes` as normal user (same company) | List loads; **no** add/edit/delete | [ ] |
| A4 | Open `/incomes` as Super Admin | Redirects to home (no tenant) | [ ] |
| A5 | Open `/incomes` signed out | Redirects to login | [ ] |

### B. Create + list (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Month/year picker defaults to current month | List filtered to that month | [ ] |
| B2 | Add income: date in current month, amount `500.00`, optional notes | Row appears with date and `500.00` | [ ] |
| B3 | Optional category + customer/payor (vendor) | Saved and shown in the table | [ ] |
| B4 | Income custom fields from Step 07 render under the form | Values saved and shown as table columns | [ ] |
| B5 | Required custom field left empty | Error shown; income not created | [ ] |
| B6 | Switch month in the picker | List shows only that month’s dates | [ ] |

### C. Update + soft delete + attachments (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | **Edit** amount/notes | Row updates; form can be cancelled | [ ] |
| C2 | While editing, upload a PDF/JPEG attachment | Attachment listed; count updates | [ ] |
| C3 | **Delete** (confirm) | Row leaves the list | [ ] |
| C4 | Recreate is a new record | Deleted row does not come back | [ ] |

### D. Dashboard Net Balance

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | With expenses and incomes in the filtered period | **Total income** > 0; **Net balance** = income − expense | [ ] |
| D2 | Income vs expense by month chart | Income bars match created income months | [ ] |
| D3 | Soft-delete all incomes in period | Total income returns to `$0.00` | [ ] |

### E. Roles + isolation

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | Normal user cannot create income (UI + API) | No form; `POST /incomes` → 403 | [ ] |
| E2 | Company A cannot see Company B incomes | Only own tenant rows | [ ] |

### F. API (Postman or curl)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| F1 | `POST /api/v1/incomes` (admin cookie) | 201; `income.type` = `INCOME` | [ ] |
| F2 | `GET /api/v1/incomes?year=&month=` | 200; `incomes`, `fields`, `meta` | [ ] |
| F3 | `PATCH /api/v1/incomes/:id` | 200; amount/notes updated | [ ] |
| F4 | `DELETE /api/v1/incomes/:id` then GET | Soft delete; GET → 404 | [ ] |
| F5 | Unauthenticated | 401 | [ ] |

---

## Pass criteria

All **required** rows above pass. Excel/PDF export remains out of scope (deferred from Step 13).

**When all required items pass:** mark related Notion tasks Done (FMS-47, FMS-48, FMS-49, FMS-50, FMS-51, FMS-52). Phase 6 / implementation steps 01–14 are complete for the planned MVP path.

---

## Printable PDF

`docs/manual-test-guides/step-14-income-module.pdf`
