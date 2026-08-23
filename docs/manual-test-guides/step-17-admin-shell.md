# Step 17 — Admin shell UI (manual test guide)

**Goal:** Confirm signed-in screens share one sidebar layout, navigation is role-aware, guest auth screens still work, and unauthorized routes redirect home.

**Maps to:** Phase 1 — Foundation (FMS-9)  
**Depends on:** Steps 02–04 and 16 (auth, RBAC, tenant users)

**Artifacts:**  
- Markdown: `docs/manual-test-guides/step-17-admin-shell.md`  
- PDF: `docs/manual-test-guides/step-17-admin-shell.pdf`  
- Client: `AppLayout` + `Sidebar` wrapping authenticated routes  
- No new HTTP APIs (Postman: missing income attachment + user negative requests added in this step)

---

## Prerequisites

- [ ] Steps 01–16 already passing (need a company admin, a normal user, and Super Admin)
- [ ] Server + client dev servers running

---

## Setup commands

Server:

```bash
cd finance-management/server
npm run dev
```

Client:

```bash
cd finance-management/client
npm run dev
```

Open http://localhost:5173

---

## Checklist

### A. Auth screens (guests)

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| A1 | Open `/login` signed out | Welcome-back card; subtitle about finance workspace | [ ] |
| A2 | Open `/register` signed out | Create-account card; link back to login | [ ] |
| A3 | Sign in as company admin | Lands on Home inside the sidebar shell | [ ] |
| A4 | While signed in, visit `/login` or `/register` | Redirects to Home | [ ] |

### B. Company admin shell

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| B1 | Sidebar sections | Overview, Finance, Setup, Account | [ ] |
| B2 | Finance links | Dashboard, Reports, Expenses, Income | [ ] |
| B3 | Setup links | Categories & vendors, Custom fields, Users | [ ] |
| B4 | Click each sidebar link | Page loads **without** full reload; active item highlighted | [ ] |
| B5 | Sign out from sidebar | Returns to login | [ ] |
| B6 | Narrow the window | Top **Menu** opens the same nav | [ ] |

### C. Normal user shell

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| C1 | Sign in as normal user | Sidebar has Home, Finance, Role & access | [ ] |
| C2 | Setup links | **No** Users, Custom fields, or Categories & vendors | [ ] |
| C3 | Open `/users` or `/fields` by URL | Redirects home | [ ] |
| C4 | Expenses / Income | Lists visible; no create/edit forms | [ ] |

### D. Super Admin shell

| # | Test | Expected | Pass? |
|---|------|----------|-------|
| D1 | Sign in as Super Admin | Sidebar has Home, Companies, Audit trail, Role & access | [ ] |
| D2 | Finance links | **Not** shown (no tenant) | [ ] |
| D3 | Open `/dashboard` or `/reports` by URL | Redirects home | [ ] |
| D4 | Companies + Audit | Pages load inside the shell | [ ] |

---

## Pass criteria

All **required** rows above pass.

**When all required items pass:** mark Notion task **FMS-9** Done.

---

## Printable PDF

`docs/manual-test-guides/step-17-admin-shell.pdf`
