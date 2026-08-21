# Step 10 — Attachments + list UX (manual test guide)

**Goal:** Confirm expense list filters / search / pagination / sorting, plus secure receipt upload, download, and soft-delete.

**Maps to:** Phase 3 — Monthly Expenses (attachments + list UX)  
**Do not start Step 11 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-10-attachments-list-ux.md`  
- PDF: `docs/manual-test-guides/step-10-attachments-list-ux.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Expenses folder — list query + Attachments)  
- Depends on Steps 08–09 (`/api/v1/expenses`, support data)

---

## Prerequisites

- [ ] Steps 01–09 already passing
- [ ] PostgreSQL running; migrations applied (includes `step10_attachments`)
- [ ] `server/.env.local` present (copy from `.env.local.example` if needed). Optional: `UPLOAD_DIR`, `UPLOAD_MAX_BYTES`, `UPLOAD_MAX_PER_EXPENSE`
- [ ] Company admin + normal user in the same company
- [ ] At least a few expenses with notes / category / vendor for filter checks
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

### A. List filters / search / pagination (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Open `/expenses` | Month picker + Filters panel + paginated table | [ ] |
| A2 | Search notes for a known substring | Only matching rows; page resets to 1 | [ ] |
| A3 | Filter by category (or department / vendor) | List narrows to that support id | [ ] |
| A4 | Sort by Amount ascending | Amounts increase down the list | [ ] |
| A5 | Create enough expenses to exceed page size (20) | Page controls appear; Next/Previous work; total count correct | [ ] |
| A6 | Clear filters / change month | List refreshes for that month | [ ] |

### B. Attachments (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Create expense, stay in edit | **Receipts** panel appears under the form | [ ] |
| B2 | Upload a JPEG or PDF | File listed; **Files** column shows `1` | [ ] |
| B3 | Download the file | Browser saves the original filename | [ ] |
| B4 | Upload until limit (5) | 6th upload shows error (`ATTACHMENT_LIMIT`) | [ ] |
| B5 | Remove an attachment | Leaves the receipts list; Files count decreases | [ ] |
| B6 | Reject `.exe` or other disallowed type | Error; not stored | [ ] |

### C. API (Postman or curl as company admin)

Login as company admin first (`Auth → Login (company admin)`).

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | GET `/api/v1/expenses?year=YYYY&month=M&page=1&pageSize=20&sortBy=occurredOn&sortDir=desc` | HTTP 200; `meta.total` / `meta.page` present; each expense has `attachmentCount` | [ ] |
| C2 | GET with `q=taxi` and/or `categoryId=…` | Filtered list | [ ] |
| C3 | POST `/api/v1/expenses/:id/attachments` multipart field `file` | HTTP 201; attachment metadata (no storage path leak beyond needed fields) | [ ] |
| C4 | GET `/api/v1/expenses/:id/attachments` | Array includes the upload | [ ] |
| C5 | GET `…/attachments/:attachmentId/download` | Binary file; `Content-Disposition` filename set | [ ] |
| C6 | DELETE `…/attachments/:attachmentId` | HTTP 200; GET list no longer includes it | [ ] |
| C7 | Audit: GET `/api/v1/audit?entityType=ExpenseAttachment` | CREATE / DELETE entries | [ ] |

Example upload:

```bash
curl -s -b cookies.txt -F "file=@./receipt.pdf;type=application/pdf" \
  http://localhost:4000/api/v1/expenses/EXPENSE_ID/attachments | jq
```

### D. Negative cases

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | POST attachment as **normal user** | HTTP 403 `FORBIDDEN` | [ ] |
| D2 | GET list / download as **normal user** | HTTP 200 (read allowed) | [ ] |
| D3 | Upload without cookie | HTTP 401 | [ ] |
| D4 | Upload to another tenant’s expense id | HTTP 404 `EXPENSE_NOT_FOUND` | [ ] |
| D5 | GET `/api/v1/expenses` as Super Admin | HTTP 403 `TENANT_REQUIRED` | [ ] |

---

## Pass criteria for Step 10

- [ ] All **required** checklist items above pass  
- [ ] List supports month + search + category/department/vendor + sort + pagination (`meta`)  
- [ ] Attachments are tenant-scoped; files are not publicly served; download requires auth  
- [ ] Soft-delete hides attachments; audit logs CREATE/DELETE  
- [ ] MIME / size / per-expense limits enforced  

**When all required items pass:** mark related Notion tasks Done (FMS-23, FMS-24), then start **Step 11 — Thin dashboard**.

---

## Quick manual flow

1. Login as company admin → **Expenses**  
2. Add 2–3 expenses; filter by notes / category; flip sort and pages  
3. Edit one expense → upload a PDF receipt → download it → remove it  
4. Login as normal user: list/filter works; cannot upload  

---

`docs/manual-test-guides/step-10-attachments-list-ux.pdf`
