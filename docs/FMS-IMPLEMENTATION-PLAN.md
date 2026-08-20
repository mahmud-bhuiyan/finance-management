# Finance Management System — Implementation Plan

> Status: **In progress** — Step **01** done, Step **02** done, Step **03** (Tenants + Super Admin) in progress.  
> Notion: [Finance Management System — Implementation Plan](https://app.notion.com/p/3c29e349548f81c8875ecbcf877eb2b0)

---

## 1. Product goal

Build a **multi-tenant, configurable Finance Management SaaS** so companies can manage income, expenses, and reporting — with a **dynamic field engine** so admins can add fields without schema changes or deployments.

**Core principle:** Configurable financial platform, not a hardcoded CRUD expense app.

**Priorities:** Scalability → Security → Maintainability → Reusability → Performance → UX

**Engineering mindset:** Build like a ~5-year experienced PERN developer — clear, practical, **do not over-engineer**.

---

## 2. Locked tech stack

### Now (build with this) — PERN

| Layer | Choice |
|--------|--------|
| Server | **Node.js + Express** (TypeScript) — folder `server/` |
| Client | **React + Vite** — folder `client/` |
| CSS | **Tailwind CSS** |
| Database | **PostgreSQL** |
| ORM | **Prisma** |
| Validation | **Zod** |
| Auth | JWT or httpOnly cookies + refresh; argon2/bcrypt |
| Charts | Recharts |
| Files | S3-compatible storage + signed URLs |

### Later (optional)

| When | What |
|------|------|
| More clients / team growth / Express hard to maintain | Migrate **server** to **NestJS** |
| Keep forever | Same **PostgreSQL**, **Prisma**, **React + Tailwind** |

**Migration idea:** Express routes → Nest controllers; middleware → guards; services mostly move as-is.

### Not starting with

- NestJS on day one  
- MongoDB / classic MERN as primary DB  
- Heavy abstractions, microservices, or premature design systems  

---

## 3. Coding rules

### General

1. **Don’t over-engineer** — solve the current step; no speculative abstractions.  
2. Prefer **simple, readable** code over clever patterns.  
3. Prefer **arrow functions** for helpers, handlers, hooks, and React components (consistent style).  
4. **TypeScript** on server and client.  
5. Validate all API inputs with **Zod**.  
6. After every implementation step: **manual test** using the step guide in `docs/` before moving on.  
7. Repo folders are **`server/`** and **`client/`** — never `backend/` or `frontend/`.  
8. HTTP APIs are versioned under **`/api/v1/`** (see API versioning below).

### Client (React + Tailwind)

1. Use **Tailwind CSS** for styling (small shared tokens for colors/spacing).  
2. Build **reusable components from the beginning** where it helps: `Button`, `Input`, `Select`, `Modal`/`Drawer`, `Table`, `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, toast helpers.  
3. Extract shared components when the same UI is copied **2–3 times** — not a full design system on day 1.  
4. **Page-based folders:** each route is `pages/<page>/` with its own `components/` and `hooks/` for page-only code. Keep `*Page.tsx` thin.  
5. **Shared components are sorted by role** under `components/`: `ui/`, `feedback/`, `layout/`, `forms/` — so pieces are easy to find.  
6. Shared hooks (e.g. `useAuth`) stay in `src/hooks/`; page-only hooks stay next to the page.  
7. Prefer composition over prop-heavy mega-components.

### Server (Express — organized & findable)

1. **Fat services, thin controllers** — business logic in services, not route files.  
2. Clear folders so middleware / controllers / services are easy to find and manage (see §4).  
3. Every business query respects **`tenant_id`**.  
4. Auth + RBAC checks on the **server** (never client-only).  
5. Soft-delete financial records by default; write audit entries for create/update/delete.  
6. Money: use `DECIMAL`/`Numeric` or integer cents — never JS floats for amounts.

### API versioning

1. Mount all HTTP routes under **`/api/v1/`** (`server/src/config/api.ts` → `API_PREFIX`).  
2. Client calls go through `client/src/lib/api.ts`. Pass paths like `/auth/login`, not `/api/auth/login`. Local: empty `client/.env` `VITE_API_URL` + Vite proxy. Production: `VITE_API_URL` = API origin. Server secrets live in `server/.env.local`.  
3. When a breaking change is needed, add **`/api/v2`** and keep **`/api/v1`** working.  
4. Do not add unversioned `/api/...` routes.

### Express → Nest (when we migrate later)

1. Domain modules stay the same (`auth`, `tenants`, `fields`, …).  
2. Prisma stays the data layer.  
3. Middleware helpers → Nest guards; Zod validators → pipes.  
4. Keep API contracts stable so the client does not need a rewrite.

---

## 4. Suggested folder layout (simple PERN)

Keep it flat and obvious — not a heavy monorepo unless we need one later. Always use **`server/`** + **`client/`**.

```text
finance-management/
  server/
    src/
      routes/                # wire HTTP paths → controllers
      controllers/           # parse req, call services, send res
      services/              # business logic
      middleware/            # auth, tenant, roles, errors, rate limit
      validators/            # Zod schemas
      utils/
      app.ts
      server.ts
    prisma/
      schema.prisma
  client/
    src/
      pages/
        login/
          LoginPage.tsx
          components/        # page-only UI
          hooks/             # page-only hooks
        register/
          …
        home/
          …
      components/
        ui/                  # Button, Input, Select, …
        feedback/            # LoadingState, ErrorBanner, EmptyState, …
        layout/              # AppShell, Sidebar, …
        forms/               # shared form helpers (multi-page)
      hooks/                 # shared only (e.g. useAuth)
      lib/                   # api client, helpers
  docs/
    manual-test-guides/      # Step 01…N checklists (Markdown + PDF)
```

Domain grouping inside services/controllers is fine, e.g. `services/auth/`, `services/expenses/` — still easy to find.

---

## 5. Architecture principles

- Multi-tenant isolation at **API + DB**  
- Every business table has `tenant_id`  
- Dynamic custom fields (definitions + values / JSONB) — no new column per field  
- Core reporting columns: `date`, `amount`, `tenant_id`, soft-delete/status  
- Shared `financial_transactions` with `type = expense | income` from day one  
- Soft delete + audit (who, what, old/new, timestamp)  
- Month/year from **transaction date** — no per-month tables  
- Never rely only on client permissions  

---

## 6. Roles

| Role | Access |
|------|--------|
| **Super Admin** | Tenants, company admins, subscriptions/status, global settings, modules, permissions, platform stats, audit |
| **Company Admin / Finance** | Expenses/income CRUD, categories, vendors, receipts, filters, summaries, exports, custom fields (if allowed), settings |
| **Normal User** | Read-only dashboards, charts, approved summaries/reports — no edits |

---

## 7. Phased delivery (product phases)

Track in Notion: [FMS Phases](https://app.notion.com/p/9fb31947166247eaae1930534e8608c6) · [FMS Tasks](https://app.notion.com/p/866ef3d12d62422a9ef7bf4baa7825a5)  
(Tasks views support **sort / group by phase**.)

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1 — Foundation** | Auth, tenants, RBAC, Super Admin, audit base | Secure multi-tenant shell |
| **2 — Dynamic Field Engine** | Definitions, types, validation, form/table renderers | Fields without deploys |
| **3 — Monthly Expenses** | CRUD, categories, vendors, attachments, filters, audit | First usable finance module |
| **4 — Dashboard** | KPIs + charts + filters | Visual reporting |
| **5 — Reporting** | Reports + CSV / Excel / PDF | Exports |
| **6 — Income** | Shared transaction model; Net Balance | Income − Expense |

**Early MVP:** Phases **1 → 2 → 3** + a **thin** Phase 4 (totals + 2–3 charts).

---

## 8. Implementation steps (build + manual test after each)

Each step is small enough to finish and **manually verify** before the next.  
For every step, maintain a checklist under:

`docs/manual-test-guides/step-XX-<name>.md`

(Optional: export that MD to PDF in the same folder for a printable guide.)

| Step | Name | Delivers | Maps to |
|------|------|----------|---------|
| **01** | Project scaffold | `server/` + `client/`, Tailwind, Express hello, Prisma + Postgres connect | Phase 1 |
| **02** | Auth | Register/login, password hashing, session/JWT | Phase 1 |
| **03** | Tenants + Super Admin | Create/manage companies & company admins | Phase 1 |
| **04** | RBAC | Role middleware; finance vs normal vs super admin | Phase 1 |
| **05** | Audit foundation | Log create/update/delete with actor + old/new | Phase 1 |
| **06** | Dynamic fields API | Field definition CRUD (tenant-scoped) | Phase 2 |
| **07** | Dynamic fields UI | Field builder + reusable form/table renderers | Phase 2 |
| **08** | Expense core | `financial_transactions` expense CRUD + soft delete | Phase 3 |
| **09** | Expense support data | Categories, departments, vendors | Phase 3 |
| **10** | Attachments + list UX | Receipts, filters, search, pagination, sorting | Phase 3 |
| **11** | Thin dashboard | KPI cards + 2–3 charts + basic filters | Phase 4 (MVP) |
| **12** | Full dashboard | Remaining chart types + richer filters | Phase 4 |
| **13** | Reporting | Monthly/category/etc. + CSV (Excel/PDF after) | Phase 5 |
| **14** | Income module | Income CRUD + Net Balance on dashboard | Phase 6 |

### Manual test rule

1. Implement the step.  
2. Open the matching guide in `docs/manual-test-guides/`.  
3. Run every checklist item (happy path + at least one auth/tenant negative case where relevant).  
4. Only then mark related Notion tasks **Done** and start the next step.

Step 01 guide: `finance-management/docs/manual-test-guides/step-01-project-scaffold.md`  
Step 02 guide: `finance-management/docs/manual-test-guides/step-02-auth.md`  
Step 03 guide: `finance-management/docs/manual-test-guides/step-03-tenants.md`  
Create each next guide when that step starts.

---

## 9. Dynamic fields (must-have design)

Admins can add/rename/enable/disable/change type/reorder/required/options/visibility/report inclusion **without code or migrations**.

**MVP types first:** Text, Long Text, Number, Currency, Date, Boolean, Dropdown, File  

**Later:** Multi-select, Radio, DateTime, User, Department, complex visibility  

**Reusable for:** Expenses, Income, Vendors, Employees, Assets, Loans, etc.

---

## 10. Security baseline

- Secure auth + password hashing  
- RBAC + tenant authorization on every API  
- Zod validation  
- Secure file uploads  
- Audit logging  
- Rate limiting where appropriate  
- Session/token security  
- No cross-tenant data access  

---

## 11. Per-change documentation habit

For every major step, record briefly:

- What changed and why  
- Files added/modified  
- DB / API / client changes  
- Security considerations  
- Manual test guide result (pass/fail)  

---

## 12. What we will **not** do yet

- Skip the per-step manual test guide  
- NestJS in Phase 1  
- Build all modules at once  
- Mongo as primary ledger  
- Over-built design system or microservices  

---

## 13. Current next step

1. Finish **Step 03 — Tenants + Super Admin** and pass `docs/manual-test-guides/step-03-tenants.md`.  
2. Mark related Notion tasks Done (FMS-4, Step 03).  
3. Continue with **Step 04 — RBAC**.  

---

## Decision log

| Decision | Choice |
|----------|--------|
| Primary DB | PostgreSQL |
| Start server | Express (TypeScript) in `server/` |
| Client | React + Vite + **Tailwind CSS** in `client/` |
| NestJS | Later, optional |
| MERN/Mongo | Rejected as primary |
| Style | Arrow functions; reusable UI primitives early |
| Server shape | routes / controllers / services / middleware / validators |
| API prefix | `/api/v1/` (keep v1 when adding v2) |
| Over-engineering | Avoid — practical PERN |
| Testing | Manual test guide per step in `docs/` (MD + optional PDF) |
| App folders | `server/` (Express API) + `client/` (React) — not `backend/` / `frontend/` |
| Notion | Phases + Tasks; sort/group by phase |
