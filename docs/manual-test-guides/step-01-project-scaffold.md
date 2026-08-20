# Step 01 — Project scaffold (manual test guide)

**Goal:** Confirm PERN scaffold works: Express API, React + Tailwind UI, Prisma wired to PostgreSQL.

**Maps to:** Phase 1 — Foundation  
**Do not start Step 02 until every required item passes.**

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-01-project-scaffold.md`  
- PDF: `docs/manual-test-guides/step-01-project-scaffold.pdf`

---

## Prerequisites

- [ ] Node.js 20+ installed (`node -v`)
- [ ] PostgreSQL running locally
- [ ] Database created (example): `fms_dev`
- [ ] `server/.env.local` has a valid `DATABASE_URL` (copy from `.env.local.example` if needed)

Example `DATABASE_URL`:

```text
postgresql://USER:PASSWORD@localhost:5432/fms_dev?schema=public
```

---

## Setup commands

From `finance-management/server`:

```bash
cp .env.local.example .env.local   # if needed; edit DATABASE_URL
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

From `finance-management/client` (new terminal):

```bash
cp .env.example .env   # leave VITE_API_URL empty locally
npm install
npm run dev
```

---

## Checklist

### A. Server boots

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Run `npm run dev` in `server/` | Console shows `FMS API listening on http://localhost:4000` | [ ] |
| A2 | Open `http://localhost:4000/` | JSON with `ok: true` and message about FMS API | [ ] |
| A3 | Folder check | You can find `routes/`, `controllers/`, `services/`, `middleware/`, `validators/`, `config/` under `server/src/` | [ ] |

### B. Database connectivity

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | `npm run prisma:migrate` succeeds | Migration applied without error | [ ] |
| B2 | GET `http://localhost:4000/api/v1/health` | HTTP 200, `"ok": true`, `database.connected: true` | [ ] |
| B3 | Stop Postgres (or break `DATABASE_URL`) and hit `/api/v1/health` again | HTTP 503 (or ok false), `database.connected: false` with an error message | [ ] |
| B4 | Restore Postgres / correct URL | Health returns connected again | [ ] |

### C. Client + Tailwind

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Run `npm run dev` in `client/` | App at `http://localhost:5173` | [ ] |
| C2 | Page loads | Heading “Step 01 scaffold is running” and teal accent styling (Tailwind) | [ ] |
| C3 | With API running | Status section shows API OK and DB connected | [ ] |
| C4 | Stop API, refresh page | UI shows an error about failing to reach API | [ ] |
| C5 | Reusable UI folder | `client/src/components/ui/Button.tsx` exists | [ ] |

### D. Coding rules smoke check

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | Controllers call services | `healthController` uses `healthService` (not raw Prisma in the route) | [ ] |
| D2 | Arrow-style handlers | Controllers/services use arrow function exports | [ ] |

---

## Pass criteria for Step 01

- [ ] A1–A3 pass  
- [ ] B1–B2 and B4 pass (B3 optional but recommended)  
- [ ] C1–C5 pass  
- [ ] D1–D2 pass  

**When all required items pass:** mark related Notion Phase 1 scaffold tasks Done, then start **Step 02 — Auth**.

---

## Notes / failures

| Item | What failed | Fix applied |
|------|-------------|-------------|
|      |             |             |

---

## Optional PDF

Print or export this Markdown to PDF if you want a paper checklist:

`docs/manual-test-guides/step-01-project-scaffold.pdf`
