# Postman sync metadata

Keep **git** and **Postman cloud** aligned. Do not create a second collection.

| Field | Value |
|--------|--------|
| Collection name | `FMS API (v1)` |
| Collection ID | `068c0ff7-f431-420e-98b5-c3283c32a9e2` |
| Collection UID | `31395184-068c0ff7-f431-420e-98b5-c3283c32a9e2` |
| Workspace | My Workspace (`813764e7-b440-4bf7-8a36-74be9c4026ab`) |
| Repo file | `docs/postman/FMS-API.postman_collection.json` |
| Open in Postman | [FMS API (v1)](https://mahmud-bhuiyans-team.postman.co/workspace/813764e7-b440-4bf7-8a36-74be9c4026ab/collection/31395184-068c0ff7-f431-420e-98b5-c3283c32a9e2) |

## When you add or change an `/api/v1` route

1. Update **`docs/postman/FMS-API.postman_collection.json`** (request, body, variables, description, tests).
2. If Postman MCP is connected (`plugin-postman-postman` ready): push the same change to this UID via **`putCollection`** / **`createCollectionRequest`**.
3. Add a short **collection comment** in Postman describing what changed (keeps a visible sync trail).
4. If MCP is **not** connected: still update the JSON; import/re-import or manually edit cloud later — note the gap in the PR.

## Auth reminder

Session is httpOnly cookie `fms_token`. Default `baseUrl` = `http://localhost:4000` (versioned routes: `{{baseUrl}}/api/v1/...`).

## Pending cloud sync

- None — cloud collection UID `31395184-068c0ff7-f431-420e-98b5-c3283c32a9e2` matches git (`docs/postman/FMS-API.postman_collection.json`): 14 folders, 90 requests.
