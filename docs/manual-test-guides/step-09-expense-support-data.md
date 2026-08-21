# Step 09 — Expense support data (manual test guide)

**Goal:** Confirm tenant-scoped Categories, Departments, and Vendors (CRUD + soft delete + audit), and optional linking on expense create/edit.

**Maps to:** Phase 3 — Monthly Expenses (support data)  
**Do not start Step 10 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-09-expense-support-data.md`  
- PDF: `docs/manual-test-guides/step-09-expense-support-data.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Categories / Departments / Vendors folders)  
- Depends on Step 08 (`/api/v1/expenses`)

---

## Prerequisites

- [ ] Steps 01–08 already passing
- [ ] PostgreSQL running; migrations applied (includes `step09_expense_support_data`)
- [ ] Super Admin bootstrap env set in `server/.env.local`
- [ ] At least one company with a **company admin**
- [ ] A **normal user** in that company
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

### A. Route access (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Home as company admin | Shows **Categories & vendors** link | [ ] |
| A2 | Open `/expense-support` as company admin | Tabs for Categories / Departments / Vendors; add form visible | [ ] |
| A3 | Open `/expense-support` as normal user | Redirects to home | [ ] |
| A4 | Open `/expense-support` as Super Admin | Redirects to home (no tenant) | [ ] |
| A5 | Open `/expense-support` signed out | Redirects to login | [ ] |

### B. Manage lookups (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Add category `Travel` | Row appears Active | [ ] |
| B2 | Add department `Ops` and vendor `Uber` | Both appear | [ ] |
| B3 | Edit category name / notes | Row updates | [ ] |
| B4 | Deactivate a category | Status Inactive; disappears from expense pickers | [ ] |
| B5 | Soft-delete a vendor | Leaves the support list | [ ] |
| B6 | Duplicate name (same tab) | Error; not created | [ ] |

### C. Expense wiring (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Expenses form shows Category / Department / Vendor selects | Active options only | [ ] |
| C2 | Create expense with category + vendor | Row shows names in list | [ ] |
| C3 | Edit expense and clear category | Category column shows — | [ ] |
| C4 | Soft-deleted vendor still shows name on older expense if FK kept | Name visible or — if SetNull after hard delete (soft keeps name) | [ ] |

### D. API (Postman or curl as company admin)

Login as company admin first (`Auth → Login (company admin)`).

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | POST `/api/v1/categories` `{ "name": "Meals" }` | HTTP 201; `category.name` is `Meals` | [ ] |
| D2 | POST `/api/v1/departments` + POST `/api/v1/vendors` | HTTP 201 each; save ids | [ ] |
| D3 | GET `/api/v1/categories` | Active list includes new row | [ ] |
| D4 | PATCH category `{ "active": false }` then GET `?active=true` | Inactive row absent | [ ] |
| D5 | POST `/api/v1/expenses` with `categoryId`, `departmentId`, `vendorId` | HTTP 201; nested `{ id, name }` present | [ ] |
| D6 | DELETE `/api/v1/vendors/:id` then GET by id | HTTP 200 then HTTP 404 `VENDOR_NOT_FOUND` | [ ] |
| D7 | Audit: GET `/api/v1/audit?entityType=ExpenseCategory` | CREATE / UPDATE / DELETE entries | [ ] |

Example:

```bash
curl -s -b cookies.txt -H "Content-Type: application/json" \
  -d '{"name":"Meals","notes":"Food"}' \
  http://localhost:4000/api/v1/categories | jq
```

### E. Negative cases

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | POST category as **normal user** | HTTP 403 `FORBIDDEN` | [ ] |
| E2 | GET `/api/v1/categories` as **Super Admin** | HTTP 403 `TENANT_REQUIRED` | [ ] |
| E3 | GET `/api/v1/vendors` without cookie | HTTP 401 | [ ] |
| E4 | POST expense with another tenant’s `categoryId` | HTTP 404 `CATEGORY_NOT_FOUND` | [ ] |
| E5 | POST expense with soft-deleted `categoryId` | HTTP 404 `CATEGORY_NOT_FOUND` | [ ] |

---

## Pass criteria for Step 09

- [ ] All **required** checklist items above pass  
- [ ] Categories, departments, and vendors are tenant-scoped  
- [ ] Soft delete hides lookups from lists/get; expense FKs use `onDelete: SetNull` for hard DB deletes  
- [ ] Expense create/update accept optional support ids and return `{ id, name }`  
- [ ] Company admin can manage lookups; normal user is read-only on lists (and cannot open management UI)

**When all required items pass:** mark related Notion tasks Done, then start **Step 10 — Attachments + list UX**.

---

## Quick manual flow

1. Login as company admin  
2. Home → **Categories & vendors**  
3. Add one category, department, and vendor  
4. Open **Expenses**, create an expense using those selects  
5. Deactivate a category and confirm it leaves the picker  
6. Soft-delete a vendor; confirm audit entries  
7. Login as normal user: expenses list readable, no support management link  

---

`docs/manual-test-guides/step-09-expense-support-data.pdf`
