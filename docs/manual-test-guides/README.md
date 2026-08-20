# Manual test guides

Each implementation step has a checklist here as **Markdown + PDF**.

| Step | Markdown | PDF |
|------|----------|-----|
| 01 | [step-01-project-scaffold.md](step-01-project-scaffold.md) | [step-01-project-scaffold.pdf](step-01-project-scaffold.pdf) |
| 02 | [step-02-auth.md](step-02-auth.md) | [step-02-auth.pdf](step-02-auth.pdf) |
| 03 | [step-03-tenants.md](step-03-tenants.md) | [step-03-tenants.pdf](step-03-tenants.pdf) |
| 04 | [step-04-rbac.md](step-04-rbac.md) | [step-04-rbac.pdf](step-04-rbac.pdf) |

## When adding or updating a step guide

1. Create or edit `step-XX-<name>.md`.
2. Generate the PDF in the **same change**:

```bash
npx md-to-pdf docs/manual-test-guides/step-XX-<name>.md
```

3. Link both files from the repo root `README.md` and note the step in `docs/FMS-IMPLEMENTATION-PLAN.md`.

PDF output is written next to the MD file (same basename, `.pdf` extension). Uses [`md-to-pdf`](https://www.npmjs.com/package/md-to-pdf) via `npx` — no repo install required.
