# Finance Management System (PERN)

Multi-tenant configurable finance platform.  
See plan: [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md)

## Stack (Step 01)

- **PostgreSQL** + **Prisma**
- **Express** (TypeScript) — `routes` / `controllers` / `services` / `middleware`
- **React** + **Vite** + **Tailwind CSS**

## Quick start

### 1. Database

Create a Postgres database named `fms_dev` (or update `backend/.env`).

### 2. Backend

```bash
cd backend
cp .env.example .env   # if needed; edit DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev --name step01_health
npm run dev
```

API: http://localhost:4000  
Health: http://localhost:4000/api/health

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Manual tests

Follow: [`docs/manual-test-guides/step-01-project-scaffold.md`](docs/manual-test-guides/step-01-project-scaffold.md)

## Project layout

```text
finance-management/
  backend/src/{routes,controllers,services,middleware,validators,config,utils}
  frontend/src/{components/ui,pages,...}
  docs/manual-test-guides/
```
