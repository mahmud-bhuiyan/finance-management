import { describe, expect, it } from "vitest";
import {
  api,
  createCompanyWithAdmin,
  createExpense,
} from "./helpers.js";

describe("FMS-29 expense CRUD, soft delete, tenant isolation, validation", () => {
  it("creates, reads, updates, and lists an expense", async () => {
    const company = await createCompanyWithAdmin();

    const created = await createExpense(company.agent, {
      amount: "25.50",
      notes: "Office tea",
    });
    expect(created.status).toBe(201);
    expect(created.body.data.expense.amount).toBe("25.50");
    expect(created.body.data.expense.type).toBe("EXPENSE");
    expect(created.body.data.expense.tenantId).toBe(company.tenant.id);

    const id = created.body.data.expense.id as string;
    const fetched = await company.agent.get(api(`/expenses/${id}`));
    expect(fetched.status).toBe(200);
    expect(fetched.body.data.expense.notes).toBe("Office tea");

    const updated = await company.agent.patch(api(`/expenses/${id}`)).send({
      notes: "Office tea (updated)",
      amount: "26.00",
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.expense.notes).toBe("Office tea (updated)");
    expect(updated.body.data.expense.amount).toBe("26.00");

    const list = await company.agent.get(api("/expenses"));
    expect(list.status).toBe(200);
    expect(list.body.data.expenses).toHaveLength(1);
  });

  it("soft-deletes an expense so it is hidden from get and list", async () => {
    const company = await createCompanyWithAdmin();
    const created = await createExpense(company.agent);
    expect(created.status).toBe(201);
    const id = created.body.data.expense.id as string;

    const removed = await company.agent.delete(api(`/expenses/${id}`));
    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);

    const fetched = await company.agent.get(api(`/expenses/${id}`));
    expect(fetched.status).toBe(404);
    expect(fetched.body.error.code).toBe("EXPENSE_NOT_FOUND");

    const list = await company.agent.get(api("/expenses"));
    expect(list.body.data.expenses).toHaveLength(0);

    const updateGone = await company.agent.patch(api(`/expenses/${id}`)).send({
      notes: "should fail",
    });
    expect(updateGone.status).toBe(404);
  });

  it("does not let another tenant read or update an expense", async () => {
    const companyA = await createCompanyWithAdmin();
    const companyB = await createCompanyWithAdmin();
    const created = await createExpense(companyA.agent);
    const id = created.body.data.expense.id as string;

    const getB = await companyB.agent.get(api(`/expenses/${id}`));
    expect(getB.status).toBe(404);

    const patchB = await companyB.agent.patch(api(`/expenses/${id}`)).send({
      notes: "hijack",
    });
    expect(patchB.status).toBe(404);

    const deleteB = await companyB.agent.delete(api(`/expenses/${id}`));
    expect(deleteB.status).toBe(404);

    const stillThere = await companyA.agent.get(api(`/expenses/${id}`));
    expect(stillThere.status).toBe(200);
  });

  it("rejects invalid amounts and dates", async () => {
    const company = await createCompanyWithAdmin();

    const zero = await createExpense(company.agent, { amount: "0" });
    expect(zero.status).toBe(400);
    expect(zero.body.error.code).toBe("VALIDATION_ERROR");

    const negative = await createExpense(company.agent, { amount: "-5" });
    expect(negative.status).toBe(400);

    const badDate = await createExpense(company.agent, {
      occurredOn: "15-08-2026",
    });
    expect(badDate.status).toBe(400);

    const missing = await company.agent.post(api("/expenses")).send({
      amount: "10.00",
    });
    expect(missing.status).toBe(400);
  });
});
