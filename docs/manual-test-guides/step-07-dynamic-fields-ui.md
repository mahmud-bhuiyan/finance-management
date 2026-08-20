# Step 07 — Dynamic fields UI (manual test guide)

**Goal:** Confirm the field builder UI and reusable dynamic form renderer for company admins, with correct RBAC and live preview.

**Maps to:** Phase 2 — Dynamic Field Engine (UI)  
**Do not start Step 08 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-07-dynamic-fields-ui.md`  
- PDF: `docs/manual-test-guides/step-07-dynamic-fields-ui.pdf`  
- Depends on Step 06 API (`/api/v1/fields`)

---

## Prerequisites

- [ ] Steps 01–06 already passing
- [ ] PostgreSQL running; migrations applied (includes `step06_dynamic_fields`)
- [ ] Super Admin bootstrap env set in `server/.env.local`
- [ ] At least one company with a **company admin** (Step 03)
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
| A1 | Home as company admin | Shows **Custom fields** link | [ ] |
| A2 | Open `/fields` as company admin | Field builder page loads | [ ] |
| A3 | Open `/fields` as normal user | Redirects to home | [ ] |
| A4 | Open `/fields` as Super Admin | Redirects to home (no tenant) | [ ] |
| A5 | Open `/fields` signed out | Redirects to login | [ ] |

### B. Field builder — create

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Expense tab selected by default | Target = Expense | [ ] |
| B2 | Add a **Text** field (label only) | Field appears in list with auto key | [ ] |
| B3 | Add a **Dropdown** with choices | Field shows choices in card | [ ] |
| B4 | Switch to **Income** tab | Separate list (empty or income-only fields) | [ ] |
| B5 | Add an income field | Appears only under Income tab | [ ] |

### C. Field builder — manage

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | **Rename** a field | Label updates in list | [ ] |
| C2 | **Disable** a field | Badge shows Disabled; hidden from preview | [ ] |
| C3 | **Enable** again | Field returns in preview | [ ] |
| C4 | **Move up / down** | Sort order changes; list order updates | [ ] |
| C5 | **Delete** a field | Removed from list and preview | [ ] |

### D. Live preview (reusable renderer)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | Enabled fields render in preview | Inputs match field types | [ ] |
| D2 | Edit preview values | JSON preview updates below form | [ ] |
| D3 | Disabled fields omitted | Not shown in preview | [ ] |
| D4 | Field order matches sort order | Same order as builder list | [ ] |

Supported preview types: Text, Long text, Number, Currency, Date, Boolean, Dropdown, File (filename only in Step 07).

### E. Server sync

After UI actions, confirm API state (Postman or curl as company admin):

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | GET `/api/v1/fields?target=EXPENSE` | Matches UI expense fields | [ ] |
| E2 | Create/update/delete from UI | Audit log shows `FieldDefinition` entries | [ ] |

### F. Negative cases

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| F1 | Add dropdown without choices | Validation error shown | [ ] |
| F2 | Duplicate key for same target | Error message from API | [ ] |

---

## Pass criteria for Step 07

- [ ] All **required** checklist items above pass  
- [ ] Company admin can manage fields for Expense and Income targets  
- [ ] Live preview uses shared `DynamicFieldForm` component  
- [ ] Normal users and Super Admin cannot access `/fields`  

**When all required items pass:** mark related Notion tasks Done, then start **Step 08 — Expense core**.

---

## Quick manual flow

1. Login as company admin  
2. Home → **Custom fields**  
3. Add text + dropdown expense fields  
4. Rename, reorder, disable/enable, delete  
5. Confirm live preview updates  
6. Switch to Income tab and add one field  
7. Check audit trail for field mutations  

---

`docs/manual-test-guides/step-07-dynamic-fields-ui.pdf`
