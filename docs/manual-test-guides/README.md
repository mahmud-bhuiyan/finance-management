# Manual test guides

Each implementation step has a checklist here as **Markdown + PDF**.

| Step | Markdown | PDF |
|------|----------|-----|
| 01 | [step-01-project-scaffold.md](step-01-project-scaffold.md) | [step-01-project-scaffold.pdf](step-01-project-scaffold.pdf) |
| 02 | [step-02-auth.md](step-02-auth.md) | [step-02-auth.pdf](step-02-auth.pdf) |
| 03 | [step-03-tenants.md](step-03-tenants.md) | [step-03-tenants.pdf](step-03-tenants.pdf) |
| 04 | [step-04-rbac.md](step-04-rbac.md) | [step-04-rbac.pdf](step-04-rbac.pdf) |
| 05 | [step-05-audit.md](step-05-audit.md) | [step-05-audit.pdf](step-05-audit.pdf) |
| 06 | [step-06-dynamic-fields-api.md](step-06-dynamic-fields-api.md) | [step-06-dynamic-fields-api.pdf](step-06-dynamic-fields-api.pdf) |
| 07 | [step-07-dynamic-fields-ui.md](step-07-dynamic-fields-ui.md) | [step-07-dynamic-fields-ui.pdf](step-07-dynamic-fields-ui.pdf) |
| 08 | [step-08-expense-core.md](step-08-expense-core.md) | [step-08-expense-core.pdf](step-08-expense-core.pdf) |
| 09 | [step-09-expense-support-data.md](step-09-expense-support-data.md) | [step-09-expense-support-data.pdf](step-09-expense-support-data.pdf) |
| 10 | [step-10-attachments-list-ux.md](step-10-attachments-list-ux.md) | [step-10-attachments-list-ux.pdf](step-10-attachments-list-ux.pdf) |
| 11 | [step-11-thin-dashboard.md](step-11-thin-dashboard.md) | [step-11-thin-dashboard.pdf](step-11-thin-dashboard.pdf) |
| 12 | [step-12-full-dashboard.md](step-12-full-dashboard.md) | [step-12-full-dashboard.pdf](step-12-full-dashboard.pdf) |
| 13 | [step-13-reporting.md](step-13-reporting.md) | [step-13-reporting.pdf](step-13-reporting.pdf) |
| 14 | [step-14-income-module.md](step-14-income-module.md) | [step-14-income-module.pdf](step-14-income-module.pdf) |
| 15 | [step-15-report-excel-pdf.md](step-15-report-excel-pdf.md) | [step-15-report-excel-pdf.pdf](step-15-report-excel-pdf.pdf) |
| 16 | [step-16-tenant-users.md](step-16-tenant-users.md) | [step-16-tenant-users.pdf](step-16-tenant-users.pdf) |

## When adding or updating a step guide

1. Create or edit `step-XX-<name>.md`.
2. Generate the PDF in the **same change**:

```bash
npx md-to-pdf docs/manual-test-guides/step-XX-<name>.md
```

3. Link both files from the repo root `README.md` and note the step in `docs/FMS-IMPLEMENTATION-PLAN.md`.

PDF output is written next to the MD file (same basename, `.pdf` extension). Uses [`md-to-pdf`](https://www.npmjs.com/package/md-to-pdf) via `npx` — no repo install required.
