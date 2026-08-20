# Step 03 — Tenants + Super Admin (manual test guide)

**Goal:** Confirm Super Admin bootstrap, company (tenant) create/list/status, and company-admin creation. Non–Super Admin callers must be rejected.

**Maps to:** Phase 1 — Foundation  
**Do not start Step 04 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-03-tenants.md`  
- PDF: `docs/manual-test-guides/step-03-tenants.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Auth + Tenants folders)

---

## Prerequisites

- [ ] Step 01 and Step 02 already passing
- [ ] PostgreSQL running; `fms_dev` exists
- [ ] `server/.env.local` includes `DATABASE_URL`, `JWT_SECRET`, and Super Admin bootstrap keys (see `.env.local.example`):
  - `SUPER_ADMIN_EMAIL` (example: `superadmin@fms.local`)
  - `SUPER_ADMIN_PASSWORD` (min 8 chars; example: `password123`)
  - `SUPER_ADMIN_NAME` (optional)
- [ ] Migration applied: `npm run prisma:migrate` (includes `step03_tenants`)

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

Expect a log line: `Created Super Admin superadmin@fms.local` (only the first time).

Client (new terminal):

```bash
cd finance-management/client
cp .env.example .env   # if needed; leave VITE_API_URL empty
npm install
npm run dev
```

---

## Checklist

### A. Super Admin bootstrap + session

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Restart API with bootstrap env set | Console shows created or already-present Super Admin (no password printed) | [ ] |
| A2 | POST `/api/v1/auth/login` as Super Admin | HTTP 200, `role: SUPER_ADMIN`, `tenantId: null`, cookie set | [ ] |
| A3 | UI: sign in at `/login` with Super Admin | Home shows role `SUPER_ADMIN` and **Manage companies** | [ ] |
| A4 | Restart API again | Does **not** recreate the user or reset the password | [ ] |

Example login:

```bash
curl -i -c cookies.txt -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"superadmin@fms.local\",\"password\":\"password123\"}"
```

### B. Companies (tenants) API

Use the Super Admin cookie from A2 (`-b cookies.txt`).

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | GET `/api/v1/tenants` | HTTP 200, `tenants` array | [ ] |
| B2 | POST `/api/v1/tenants` with `{ "name": "Acme Ltd" }` | HTTP 201, company with generated `slug` (e.g. `acme-ltd`), `status: ACTIVE` | [ ] |
| B3 | POST `/api/v1/tenants/:id/admins` with email, password (≥8), optional name | HTTP 201, user `role: COMPANY_ADMIN`, `tenantId` matches company | [ ] |
| B4 | PATCH `/api/v1/tenants/:id` with `{ "status": "INACTIVE" }` | HTTP 200, `status: INACTIVE` | [ ] |
| B5 | Login as the company admin while company is inactive | HTTP 403 `TENANT_INACTIVE` / “This company is inactive” | [ ] |
| B6 | PATCH company back to `ACTIVE`, then login as company admin | HTTP 200; `/api/v1/auth/me` includes `tenant.name` | [ ] |

Create company:

```bash
curl -i -b cookies.txt -X POST http://localhost:4000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Acme Ltd\"}"
```

### C. Authorization negatives

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | GET `/api/v1/tenants` **without** cookie | HTTP 401 | [ ] |
| C2 | Login as a normal (self-registered) user, then GET `/api/v1/tenants` | HTTP 403 `FORBIDDEN` | [ ] |
| C3 | Same normal user opens http://localhost:5173/tenants | Redirected home (no company manager) | [ ] |
| C4 | Create company admin with an email that already exists | HTTP 409 “Email is already registered” | [ ] |

### D. Super Admin UI

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | Open http://localhost:5173/tenants as Super Admin | Companies page loads | [ ] |
| D2 | Create a company from the form | New card appears with slug | [ ] |
| D3 | Add a company admin from the card | Email listed under Company admins | [ ] |
| D4 | Toggle Active / Inactive | Status text updates | [ ] |

### E. Coding rules smoke

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | Controllers call services | `tenantController` → `tenantService` (no Prisma in routes) | [ ] |
| E2 | Super Admin guard | `requireSuperAdmin` on `/api/v1/tenants` | [ ] |
| E3 | Users have `tenant_id` | Prisma `User.tenantId`; Super Admin stays null | [ ] |

---

## Pass criteria for Step 03

- [ ] A1–A4 pass  
- [ ] B1–B6 pass  
- [ ] C1–C4 pass  
- [ ] D1–D4 pass  
- [ ] E1–E3 pass  

**When all required items pass:** mark Notion **Step 03: Tenants…** and **Implement Super Admin…** Done, then start **Step 04 — RBAC**.

---

## Notes / failures

| Item | What failed | Fix applied |
|------|-------------|-------------|
|      |             |             |

---

## Optional PDF

Printable copy of this guide:

`docs/manual-test-guides/step-03-tenants.pdf`
