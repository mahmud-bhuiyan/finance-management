import { describe, expect, it } from "vitest";
import {
  api,
  createCompanyWithAdmin,
  createExpense,
} from "./helpers.js";

describe("FMS-19 dynamic fields: no migration, validation, tenant scope", () => {
  it("creates a field definition without a schema change and uses it on an expense", async () => {
    const company = await createCompanyWithAdmin();

    const created = await company.agent.post(api("/fields")).send({
      target: "EXPENSE",
      label: "Project code",
      fieldType: "TEXT",
      required: true,
    });
    expect(created.status).toBe(201);
    expect(created.body.data.field.key).toBe("project_code");
    expect(created.body.data.field.required).toBe(true);
    expect(created.body.data.field.tenantId).toBe(company.tenant.id);

    const missing = await createExpense(company.agent);
    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe("FIELD_REQUIRED");

    const ok = await createExpense(company.agent, {
      customValues: { project_code: "ALPHA" },
    });
    expect(ok.status).toBe(201);
    expect(ok.body.data.expense.customValues.project_code).toBe("ALPHA");
  });

  it("keeps field definitions scoped to the tenant", async () => {
    const companyA = await createCompanyWithAdmin();
    const companyB = await createCompanyWithAdmin();

    const created = await companyA.agent.post(api("/fields")).send({
      target: "EXPENSE",
      label: "Internal only",
      fieldType: "TEXT",
    });
    expect(created.status).toBe(201);
    const fieldId = created.body.data.field.id as string;

    const listB = await companyB.agent.get(api("/fields"));
    expect(listB.status).toBe(200);
    expect(listB.body.data.fields).toHaveLength(0);

    const stolen = await companyB.agent.get(api(`/fields/${fieldId}`));
    expect(stolen.status).toBe(404);
    expect(stolen.body.error.code).toBe("FIELD_NOT_FOUND");
  });

  it("validates field keys and dropdown options", async () => {
    const company = await createCompanyWithAdmin();

    const badKey = await company.agent.post(api("/fields")).send({
      target: "EXPENSE",
      key: "Not Valid",
      label: "Bad key",
      fieldType: "TEXT",
    });
    expect(badKey.status).toBe(400);
    expect(badKey.body.error.code).toBe("VALIDATION_ERROR");

    const dropdown = await company.agent.post(api("/fields")).send({
      target: "EXPENSE",
      label: "Status",
      fieldType: "DROPDOWN",
    });
    expect(dropdown.status).toBe(400);
    expect(dropdown.body.error.code).toBe("VALIDATION_ERROR");

    const ok = await company.agent.post(api("/fields")).send({
      target: "EXPENSE",
      label: "Status",
      fieldType: "DROPDOWN",
      options: { choices: ["Open", "Closed"] },
    });
    expect(ok.status).toBe(201);
    expect(ok.body.data.field.options.choices).toEqual(["Open", "Closed"]);
  });
});
