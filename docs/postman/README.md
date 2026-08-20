# Postman collection

Importable API collection for local testing of `/api/v1`, kept in sync with Postman cloud.

## Files

- [`FMS-API.postman_collection.json`](./FMS-API.postman_collection.json) — collection (git source of truth)
- [`SYNC.md`](./SYNC.md) — cloud collection UID, workspace, sync checklist

## How to use

### Option A — already in your Postman account

Open **FMS API (v1)** in workspace **My Workspace** (see UID in `SYNC.md`). Start the API first: `cd server && npm run dev`.

### Option B — import from disk

1. Postman → **Import** → select `FMS-API.postman_collection.json`
2. Start the API: `cd server && npm run dev`
3. Collection variables: `baseUrl` = `http://localhost:4000/api/v1`; Super Admin vars match `server/.env.local`
4. Run **Auth → Login (Super Admin)** before tenant requests
5. Auth uses the `fms_token` cookie (Postman cookie jar)

## Keep git + Postman in sync

When you add or change an HTTP route under `/api/v1`:

1. Update `FMS-API.postman_collection.json`
2. If Postman MCP is connected, update the cloud collection (same UID in `SYNC.md`) and leave a short collection comment
3. See `.cursor/rules/project-conventions.mdc` and `docs/FMS-IMPLEMENTATION-PLAN.md`
