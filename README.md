# Finance Management System (PERN)

Multi-tenant configurable finance platform.  
See plan: [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md)

## Stack (Step 01)

- **PostgreSQL** + **Prisma**
- **Express** (TypeScript) — `routes` / `controllers` / `services` / `middleware`
- **React** + **Vite** + **Tailwind CSS**

## Quick start

### 1. Database

Create a Postgres database named `fms_dev` (or update `server/.env`).

### 2. Server

```bash
cd server
cp .env.example .env   # if needed; edit DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev --name step01_health
npm run dev
```

API: http://localhost:4000  
Health: http://localhost:4000/api/health

### 3. Client

```bash
cd client
npm install
npm run dev
```

App: http://localhost:5173

## Manual tests

- Step 01: [`docs/manual-test-guides/step-01-project-scaffold.md`](docs/manual-test-guides/step-01-project-scaffold.md) · [PDF](docs/manual-test-guides/step-01-project-scaffold.pdf)
- Step 02: [`docs/manual-test-guides/step-02-auth.md`](docs/manual-test-guides/step-02-auth.md) · [PDF](docs/manual-test-guides/step-02-auth.pdf)

## Auth env (Step 02)

In `server/.env` set `JWT_SECRET` (min 32 characters). Copy keys from `server/.env.example` if needed.

## Project layout

```text
finance-management/
  server/src/{routes,controllers,services,middleware,validators,config,utils}
  client/src/
    pages/<page>/{Page.tsx,components/,hooks/}   # page-owned UI + hooks
    components/{ui,feedback,layout,forms}/       # shared, sorted by role
    hooks/                                       # shared hooks only
    lib/
  docs/manual-test-guides/                       # MD + PDF per step
```

See coding rules in [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md) §3–4 and `.cursor/rules/client-structure.mdc`.