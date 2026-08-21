# Step 16 — Tenant user management (manual test guide)

**Goal:** Confirm company admins can invite users, change roles (company admin vs normal user), deactivate/reactivate accounts, and that inactive users cannot sign in — unblocking remaining Steps 13–15 role checks.

**Maps to:** Phase 1 — Foundation (FMS-8)  
**Depends on:** Steps 02–04 (auth, tenants, RBAC)

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-16-tenant-users.md`  
- PDF: `docs/manual-test-guides/step-16-tenant-users.pdf`  
- Postman: `docs/postman/FMS-API.postman_collection.json` (Users folder)  
- Client: `/users`

---

## Prerequisites

- [ ] Steps 01–04 already passing
- [ ] PostgreSQL running; migrations applied (includes `UserStatus`)
- [ ] At least one company with a **company admin**
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
| A1 | Home as company admin | Shows **Users** link | [ ] |
| A2 | Open `/users` as company admin | Invite form + user table | [ ] |
| A3 | Open `/users` as normal user | Redirects home | [ ] |
| A4 | Open `/users` as Super Admin | Redirects home (no tenant) | [ ] |
| A5 | Open `/users` signed out | Redirects to login | [ ] |

### B. Invite + list (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Create **Normal user** with email + password (≥8) | Row appears; role Normal user; Active | [ ] |
| B2 | Sign out; login as that normal user | Session works; company name shown | [ ] |
| B3 | Duplicate email invite | Error (email already registered) | [ ] |
| B4 | Create a second **Company admin** | Row appears as company admin | [ ] |

### C. Role + deactivate (UI)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Change normal user → company admin (then back) | Role updates in table | [ ] |
| C2 | **Deactivate** a non-self user | Status Inactive | [ ] |
| C3 | Login as deactivated user | Blocked (`USER_INACTIVE` / inactive message) | [ ] |
| C4 | **Reactivate** then login again | Succeeds | [ ] |
| C5 | Try to change **own** role or deactivate self | Controls disabled / API rejects | [ ] |

### D. Roles + isolation (API)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | `GET /api/v1/users` as company admin | 200; `users` array | [ ] |
| D2 | `POST /api/v1/users` as normal user | 403 | [ ] |
| D3 | `PATCH` last active company admin to `INACTIVE` | 400 `LAST_ADMIN` | [ ] |
| D4 | Unauthenticated `/users` | 401 | [ ] |

### E. Unblocks Steps 13–15

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| E1 | Normal user opens `/reports` | Read-only summary + CSV/Excel/PDF buttons | [ ] |
| E2 | Normal user opens `/incomes` | List only; no add/edit/delete | [ ] |
| E3 | Super Admin opens `/reports` | Redirects home | [ ] |

---

## Pass criteria

All **required** rows above pass.

**When all required items pass:** mark Notion task **FMS-8** Done. Use the created normal user to finish remaining Step 13–15 role checklist items, then mark related FMS tasks Done.

---

## Printable PDF

`docs/manual-test-guides/step-16-tenant-users.pdf`
