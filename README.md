# Finance Management System

A multi-tenant finance platform for managing income, expenses, and reporting. Organizations configure their own data model through a dynamic field engine—adding custom fields without schema changes or redeployments.

Built as a full-stack **PERN** application (PostgreSQL, Express, React, Node.js) with tenant isolation, role-based access control, audit logging, and exportable reports.

---

## Features

- **Multi-tenant architecture** — isolated data per organization with Super Admin oversight
- **Role-based access control** — Super Admin, Company Admin, and read-only user roles
- **Dynamic field engine** — define custom fields per tenant; render in forms and tables automatically
- **Expense & income management** — shared transaction model with categories, vendors, attachments, and filters
- **Dashboard & reporting** — KPIs, charts, and exports to CSV, Excel, and PDF
- **Audit trail** — immutable log of create, update, and delete actions
- **User & tenant administration** — company lifecycle, user management, and access controls
- **Theme support** — light and dark mode per user preference

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL |
| ORM | Prisma |
| Server | Node.js, Express, TypeScript |
| Client | React, Vite, Tailwind CSS |
| Data fetching | TanStack React Query |
| Validation | Zod |
| Authentication | JWT (httpOnly cookie) |
| Charts | Recharts |

All HTTP routes are versioned under **`/api/v1/`**.

---

## Prerequisites

- **Node.js** 20 or later
- **PostgreSQL** 14 or later
- **npm**

---

## Getting Started

### 1. Database

Create a PostgreSQL database (default name: `fms_dev`):

```bash
psql -U postgres -c "CREATE DATABASE fms_dev;"
```

### 2. Server

```bash
cd server
cp .env.local.example .env.local   # edit DATABASE_URL and secrets
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

The API listens at **http://localhost:4000**.  
Health check: **http://localhost:4000/health**

### 3. Client

```bash
cd client
cp .env.example .env   # leave VITE_API_URL empty for local development
npm install
npm run dev
```

The application is available at **http://localhost:5173**.

Locally, the client calls `/api/v1` and Vite proxies requests to the server. For production (cross-origin deployment), set `VITE_API_URL` in `client/.env` to the API origin (no trailing slash) and `CLIENT_URL` in `server/.env.local` to the deployed SPA origin.

---

## Configuration

Environment files:

| File | Purpose |
|------|---------|
| `server/.env.local` | Server secrets and configuration (not committed) |
| `client/.env` | Public client variables (`VITE_*` only) |

Copy from the provided `.example` files and adjust values for your environment.

### Server (`server/.env.local`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default: `4000`) |
| `CLIENT_URL` | SPA origin for CORS (default: `http://localhost:5173`) |
| `JWT_SECRET` | Signing key for auth tokens (minimum 32 characters) |
| `JWT_EXPIRES_IN` | Token lifetime (default: `7d`) |
| `SUPER_ADMIN_EMAIL` | Bootstrap Super Admin account email |
| `SUPER_ADMIN_PASSWORD` | Bootstrap Super Admin password |
| `SUPER_ADMIN_NAME` | Display name for the Super Admin (optional) |
| `UPLOAD_DIR` | Local directory for file attachments |
| `UPLOAD_MAX_BYTES` | Maximum upload size per file |
| `DEMO_MODE` | Enable demo login shortcuts on the login page |

On first startup, the server creates the Super Admin account if the configured email does not already exist.

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API origin for production; leave empty locally to use the Vite proxy |

---

## Project Structure

```text
finance-management/
├── server/
│   ├── src/
│   │   ├── routes/          # HTTP route definitions
│   │   ├── controllers/     # Request/response handling
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, RBAC, error handling
│   │   ├── validators/      # Zod schemas
│   │   └── config/          # App configuration
│   └── prisma/              # Schema and migrations
├── client/
│   └── src/
│       ├── pages/           # Route-level views (components + hooks per page)
│       ├── components/      # Shared UI (ui, feedback, layout, forms)
│       ├── hooks/           # Shared React hooks
│       └── lib/             # API client, query client, utilities
└── docs/                    # Implementation plan and API collection
```

The codebase uses **`server/`** and **`client/`** as top-level application folders. HTTP APIs are served exclusively under **`/api/v1/`**.

---

## API Reference

A Postman collection documents all `/api/v1` endpoints:

- **Git:** [`docs/postman/FMS-API.postman_collection.json`](docs/postman/FMS-API.postman_collection.json)
- **Setup guide:** [`docs/postman/README.md`](docs/postman/README.md)

Authentication uses an httpOnly session cookie (`fms_token`). Log in through the API or the web application before calling protected endpoints.

Default base URL: `http://localhost:4000/api/v1`

---

## Development Scripts

### Server (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run the compiled server |
| `npm run prisma:migrate` | Apply database migrations |
| `npm run prisma:studio` | Open Prisma Studio |

### Client (`client/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run the linter |

---

## Documentation

For architecture decisions, coding conventions, and the full implementation roadmap, see [`docs/FMS-IMPLEMENTATION-PLAN.md`](docs/FMS-IMPLEMENTATION-PLAN.md).
