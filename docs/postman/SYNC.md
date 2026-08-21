# Postman sync metadata

Keep **git** and **Postman cloud** aligned. Do not create a second collection.

| Field | Value |
|--------|--------|
| Collection name | `FMS API (v1)` |
| Collection ID | `5914500b-3ae9-4fe4-9371-f1b01cc92ff0` |
| Collection UID | `31395184-5914500b-3ae9-4fe4-9371-f1b01cc92ff0` |
| Workspace | My Workspace (`813764e7-b440-4bf7-8a36-74be9c4026ab`) |
| Repo file | `docs/postman/FMS-API.postman_collection.json` |
| Open in Postman | [FMS API (v1)](https://mahmud-bhuiyans-team.postman.co/workspace/813764e7-b440-4bf7-8a36-74be9c4026ab/collection/31395184-5914500b-3ae9-4fe4-9371-f1b01cc92ff0) |

## When you add or change an `/api/v1` route

1. Update **`docs/postman/FMS-API.postman_collection.json`** (request, body, variables, description, tests).
2. If Postman MCP is connected (`plugin-postman-postman` ready): push the same change to this UID via **`putCollection`** / **`createCollectionRequest`**.
3. Add a short **collection comment** in Postman describing what changed (keeps a visible sync trail).
4. If MCP is **not** connected: still update the JSON; import/re-import or manually edit cloud later — note the gap in the PR.

## Auth reminder

Session is httpOnly cookie `fms_token`. Default `baseUrl` = `http://localhost:4000/api/v1`.

## Pending cloud sync

- **Step 09** updated git collection with Categories / Departments / Vendors folders and expense FK body fields. Postman MCP was not connected at implement time — push to UID `31395184-5914500b-3ae9-4fe4-9371-f1b01cc92ff0` when MCP is available (or re-import the JSON).
- **Step 10** updated git collection: expense list query (`meta`, filters/sort/page) + attachment upload/list/download/delete requests. Postman MCP still not connected — re-import or sync cloud when available.
- **Step 11** updated git collection: **Dashboard** folder (`GET /dashboard/summary` with presets + custom range + dimension filters). Postman MCP still not connected — re-import or sync cloud when available.
