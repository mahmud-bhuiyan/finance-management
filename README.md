# Finance Management System (PERN)

Multi-tenant configurable finance platform.  
See plan: [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md)

## Stack (Step 01)

- **PostgreSQL** + **Prisma**
- **Express** (TypeScript) in `server/` — `routes` / `controllers` / `services` / `middleware`
- **React** + **Vite** + **Tailwind CSS** + **TanStack React Query** in `client/`
- HTTP API prefix: `/api/v1/`

## Quick start

### 1. Database

Create a Postgres database named `fms_dev` (or update `server/.env.local`).

### 2. Server

```bash
cd server
cp .env.local.example .env.local   # if needed; edit DATABASE_URL
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

API: http://localhost:4000  
Health: http://localhost:4000/api/v1/health

### 3. Client

```bash
cd client
cp .env.example .env   # leave VITE_API_URL empty locally
npm install
npm run dev
```

App: http://localhost:5173

Locally the client calls `/api/v1` and Vite proxies to the server. In production (cross-origin), set `client/.env` `VITE_API_URL` to the API origin (no trailing slash) and set `server/.env.local` `CLIENT_URL` to the deployed SPA origin.

Env files: **`server/.env.local`** (secrets) and **`client/.env`** (public `VITE_*` only).

## Manual tests

- Step 01: [`docs/manual-test-guides/step-01-project-scaffold.md`](docs/manual-test-guides/step-01-project-scaffold.md) · [PDF](docs/manual-test-guides/step-01-project-scaffold.pdf)
- Step 02: [`docs/manual-test-guides/step-02-auth.md`](docs/manual-test-guides/step-02-auth.md) · [PDF](docs/manual-test-guides/step-02-auth.pdf)
- Step 03: [`docs/manual-test-guides/step-03-tenants.md`](docs/manual-test-guides/step-03-tenants.md) · [PDF](docs/manual-test-guides/step-03-tenants.pdf)
- Step 04: [`docs/manual-test-guides/step-04-rbac.md`](docs/manual-test-guides/step-04-rbac.md) · [PDF](docs/manual-test-guides/step-04-rbac.pdf)
- Step 05: [`docs/manual-test-guides/step-05-audit.md`](docs/manual-test-guides/step-05-audit.md) · [PDF](docs/manual-test-guides/step-05-audit.pdf)
- Step 06: [`docs/manual-test-guides/step-06-dynamic-fields-api.md`](docs/manual-test-guides/step-06-dynamic-fields-api.md) · [PDF](docs/manual-test-guides/step-06-dynamic-fields-api.pdf)
- Step 07: [`docs/manual-test-guides/step-07-dynamic-fields-ui.md`](docs/manual-test-guides/step-07-dynamic-fields-ui.md) · [PDF](docs/manual-test-guides/step-07-dynamic-fields-ui.pdf)
- Step 08: [`docs/manual-test-guides/step-08-expense-core.md`](docs/manual-test-guides/step-08-expense-core.md) · [PDF](docs/manual-test-guides/step-08-expense-core.pdf)
- Step 09: [`docs/manual-test-guides/step-09-expense-support-data.md`](docs/manual-test-guides/step-09-expense-support-data.md) · [PDF](docs/manual-test-guides/step-09-expense-support-data.pdf)
- Step 10: [`docs/manual-test-guides/step-10-attachments-list-ux.md`](docs/manual-test-guides/step-10-attachments-list-ux.md) · [PDF](docs/manual-test-guides/step-10-attachments-list-ux.pdf)
- Step 11: [`docs/manual-test-guides/step-11-thin-dashboard.md`](docs/manual-test-guides/step-11-thin-dashboard.md) · [PDF](docs/manual-test-guides/step-11-thin-dashboard.pdf)
- Step 12: [`docs/manual-test-guides/step-12-full-dashboard.md`](docs/manual-test-guides/step-12-full-dashboard.md) · [PDF](docs/manual-test-guides/step-12-full-dashboard.pdf)
- Step 13: [`docs/manual-test-guides/step-13-reporting.md`](docs/manual-test-guides/step-13-reporting.md) · [PDF](docs/manual-test-guides/step-13-reporting.pdf)
- Step 14: [`docs/manual-test-guides/step-14-income-module.md`](docs/manual-test-guides/step-14-income-module.md) · [PDF](docs/manual-test-guides/step-14-income-module.pdf)
- Step 15: [`docs/manual-test-guides/step-15-report-excel-pdf.md`](docs/manual-test-guides/step-15-report-excel-pdf.md) · [PDF](docs/manual-test-guides/step-15-report-excel-pdf.pdf)
- Step 16: [`docs/manual-test-guides/step-16-tenant-users.md`](docs/manual-test-guides/step-16-tenant-users.md) · [PDF](docs/manual-test-guides/step-16-tenant-users.pdf)
- Step 17: [`docs/manual-test-guides/step-17-admin-shell.md`](docs/manual-test-guides/step-17-admin-shell.md) · [PDF](docs/manual-test-guides/step-17-admin-shell.pdf)
- Step 18: [`docs/manual-test-guides/step-18-automated-tests.md`](docs/manual-test-guides/step-18-automated-tests.md) · [PDF](docs/manual-test-guides/step-18-automated-tests.pdf)

## Postman (API)

- Cloud: **FMS API (v1)** in Postman (IDs in [`docs/postman/SYNC.md`](docs/postman/SYNC.md))
- Git: [`docs/postman/FMS-API.postman_collection.json`](docs/postman/FMS-API.postman_collection.json) (import if needed)
- How-to: [`docs/postman/README.md`](docs/postman/README.md)

Start the server first (`cd server && npm run dev`). When APIs change, update the JSON **and** the cloud collection (if Postman MCP is connected), and leave a short collection comment.

## Auth env (Step 02)

In `server/.env.local` set `JWT_SECRET` (min 32 characters). Copy keys from `server/.env.local.example` if needed.

## Super Admin env (Step 03)

In `server/.env.local` set:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD` (min 8 characters)
- `SUPER_ADMIN_NAME` (optional)

On `npm run dev`, the API creates that Super Admin if the email does not exist yet. Default examples in `.env.local.example`: `superadmin@fms.local` / `password123`.

## Automated tests (Step 18)

From `server/`:

```bash
npm test
```

Runs Vitest against database `fms_test` (created automatically). If local Postgres is down, an embedded cluster is started for the run. Dev data in `fms_dev` is not truncated.

## Project layout

```text
finance-management/
  server/src/{routes,controllers,services,middleware,validators,config,utils}
  client/src/
    pages/<page>/{Page.tsx,components/,hooks/}   # page-owned UI + hooks
    components/{ui,feedback,layout,forms}/       # shared, sorted by role
    hooks/                                       # shared hooks only
    lib/                                         # api client, queryClient, helpers
  docs/manual-test-guides/                       # MD + PDF per step
  docs/postman/                                  # Importable Postman collection
```

See coding rules in [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md) §3–4 and `.cursor/rules/` (`project-conventions`, `server-structure`, `client-structure`).

Folders are **`server/`** and **`client/`**. HTTP APIs live under **`/api/v1/`**.