# Step 19 — User theme preference (manual test guide)

**Goal:** Confirm per-user light/dark theme preference is stored on the `users` table, exposed via `/api/v1/auth/me`, and updatable with `PATCH /api/v1/auth/me/theme`.

**Maps to:** Phase 2 — UX polish  
**Do not start Step 20 until every required item passes.**

**Artifacts:**
- Markdown: `docs/manual-test-guides/step-19-user-theme.md`
- PDF: `docs/manual-test-guides/step-19-user-theme.pdf`
- Postman: `docs/postman/FMS-API.postman_collection.json` (Auth → Update theme)

---

## Prerequisites

- [ ] Steps 01–17 already passing
- [ ] Migration applied: `step17_user_theme` (`theme_preference` column on `users`)
- [ ] Server and client running locally

---

## Setup commands

```bash
cd finance-management/server
npx prisma generate
npm run prisma:migrate
npm run dev
```

```bash
cd finance-management/client
npm run dev
```

---

## Checklist

### A. API

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Login, then `GET /api/v1/auth/me` | `data.user.themePreference` is `LIGHT` for existing users | [ ] |
| A2 | `PATCH /api/v1/auth/me/theme` with `{ "themePreference": "DARK" }` | HTTP 200; response user has `themePreference: "DARK"` | [ ] |
| A3 | `GET /api/v1/auth/me` again | Still `DARK` | [ ] |
| A4 | `PATCH` with invalid value (e.g. `"blue"`) | HTTP 400 validation error | [ ] |
| A5 | `PATCH` without session cookie | HTTP 401 | [ ] |

### B. UI

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Log in and open any app page | Default light shell | [ ] |
| B2 | Click **Theme** in the sidebar footer | UI switches to dark mode; label shows **Dark** | [ ] |
| B3 | Refresh the page | Dark mode persists for the same user | [ ] |
| B4 | Log out and log in as a different user | That user's saved preference applies (default light if never changed) | [ ] |
| B5 | Toggle back to light | UI returns to light mode and persists after refresh | [ ] |

### C. Database

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Inspect `users.theme_preference` for your test user | Value matches the UI (`LIGHT` or `DARK`) | [ ] |

---

## Notes

- Theme is stored on the **`users`** row in the main FMS PostgreSQL database (not a separate database).
- Login/register screens keep their existing styling; theme applies inside the authenticated app shell.

---

**PDF:** `docs/manual-test-guides/step-19-user-theme.pdf`
