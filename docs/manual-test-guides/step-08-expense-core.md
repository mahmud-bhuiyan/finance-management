# Step 08 — Expense core (manual test guide)

**Goal:** Confirm expense CRUD on the shared `financial_transactions` model (date + amount + custom field values), with soft delete, audit, and role-aware UI.

**Maps to:** Phase 3 — Monthly Expenses (core only; categories/vendors are Step 09)  
**Do not start Step 09 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-08-expense-core.md`  
- PDF: `docs/manual-test-guides/step-08-expense-core.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Expenses folder)  
- Depends on Steps 06–07 (`/api/v1/fields` + field builder)

---

## Prerequisites

- [ ] Steps 01–07 already passing
- [ ] PostgreSQL running; migrations applied (includes `step08_expense_core`)
- [ ] Super Admin bootstrap env set in `server/.env.local`
- [ ] At least one company with a **company admin** (Step 03)
- [ ] A self-registered **normal user** in that company (or create one via register + Super Admin assigning tenant — if the normal user has no tenant, use a company member with `NORMAL_USER`)
- [ ] Optional: an enabled Expense custom field (text or dropdown) from Step 07
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
| A1 | Home as company admin | Shows **Expenses** link | [ ] |
| A2 | Open `/expenses` as company admin | Page loads; add form visible | [ ] |
| A3 | Open `/expenses` as normal user (same company) | List loads; **no** add/edit/delete | [ ] |
| A4 | Open `/expenses` as Super Admin | Redirects to home (no tenant) | [ ] |
| A5 | Open `/expenses` signed out | Redirects to login | [ ] |

### B. Create + list (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Month/year picker defaults to current month | List filtered to that month | [ ] |
| B2 | Add expense: date in current month, amount `12.50`, optional notes | Row appears with date and `12.50` | [ ] |
| B3 | Custom fields from Step 07 render under the form | Values saved and shown as table columns | [ ] |
| B4 | Required custom field left empty | Error shown; expense not created | [ ] |
| B5 | Switch month in the picker | List shows only that month’s dates | [ ] |

### C. Update + soft delete (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | **Edit** amount/notes | Row updates; form can be cancelled | [ ] |
| C2 | **Delete** (confirm) | Row leaves the list | [ ] |
| C3 | Recreate is a new record | Deleted row does not come back | [ ] |

### D. API (Postman or curl as company admin)

Login as company admin first (`Auth → Login (company admin)`).

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | POST `/api/v1/expenses` `{ "occurredOn": "2026-08-15", "amount": "20.00" }` | HTTP 201; `expense.amount` is `"20.00"`; `type` is `EXPENSE` | [ ] |
| D2 | GET `/api/v1/expenses?year=2026&month=8` | Includes the new row; `fields` array present | [ ] |
| D3 | PATCH `/api/v1/expenses/:id` `{ "amount": "25.50" }` | HTTP 200; amount `"25.50"` | [ ] |
| D4 | DELETE `/api/v1/expenses/:id` then GET by id | HTTP 200 then HTTP 404 `EXPENSE_NOT_FOUND` | [ ] |
| D5 | GET list after delete | Deleted id is absent | [ ] |
| D6 | Audit: GET `/api/v1/audit?entityType=FinancialTransaction` | CREATE / UPDATE / DELETE entries | [ ] |

Example:

```bash
curl -s -b cookies.txt -H "Content-Type: application/json" \
  -d '{"occurredOn":"2026-08-15","amount":"20.00","notes":"Taxi"}' \
  http://localhost:4000/api/v1/expenses | jq
```

### E. Negative cases

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | POST amount `0` or `-1` | HTTP 400 validation error | [ ] |
| E2 | POST as **normal user** | HTTP 403 `FORBIDDEN` | [ ] |
| E3 | GET `/api/v1/expenses` as **Super Admin** | HTTP 403 `TENANT_REQUIRED` | [ ] |
| E4 | GET `/api/v1/expenses` without cookie | HTTP 401 | [ ] |
| E5 | GET another tenant’s expense id (if two companies exist) | HTTP 404 | [ ] |

---

## Pass criteria for Step 08

- [ ] All **required** checklist items above pass  
- [ ] Amounts are stored/returned as decimal strings (not JS floats)  
- [ ] Delete is soft (`deleted_at`); row disappears from list/get  
- [ ] Custom field values persist on the expense (JSONB)  
- [ ] Company admin can write; normal user is read-only; Super Admin cannot access  

**When all required items pass:** mark related Notion tasks Done, then start **Step 09 — Expense support data**.

---

## Quick manual flow

1. Login as company admin  
2. Home → **Expenses**  
3. Add an expense for this month (amount + optional custom field)  
4. Edit it, then soft-delete it  
5. Confirm it is gone from the list and GET-by-id is 404  
6. Check audit trail for `FinancialTransaction`  
7. Login as normal user: list visible, no write controls  

---

`docs/manual-test-guides/step-08-expense-core.pdf`
