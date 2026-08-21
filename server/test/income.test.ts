import { describe, expect, it } from "vitest";
import {
  api,
  createCompanyWithAdmin,
  createExpense,
  createIncome,
} from "./helpers.js";

describe("FMS-52 income CRUD, net balance, tenant isolation", () => {
  it("creates, reads, updates, and lists income", async () => {
    const company = await createCompanyWithAdmin();

    const created = await createIncome(company.agent, {
      amount: "150.00",
      notes: "Invoice 12",
    });
    expect(created.status).toBe(201);
    expect(created.body.income.amount).toBe("150.00");
    expect(created.body.income.type).toBe("INCOME");
    expect(created.body.income.tenantId).toBe(company.tenant.id);

    const id = created.body.income.id as string;
    const fetched = await company.agent.get(api(`/incomes/${id}`));
    expect(fetched.status).toBe(200);
    expect(fetched.body.income.notes).toBe("Invoice 12");

    const updated = await company.agent.patch(api(`/incomes/${id}`)).send({
      notes: "Invoice 12 paid",
    });
    expect(updated.status).toBe(200);
    expect(updated.body.income.notes).toBe("Invoice 12 paid");

    const list = await company.agent.get(api("/incomes"));
    expect(list.status).toBe(200);
    expect(list.body.incomes).toHaveLength(1);
  });

  it("soft-deletes income and keeps it hidden", async () => {
    const company = await createCompanyWithAdmin();
    const created = await createIncome(company.agent);
    const id = created.body.income.id as string;

    const removed = await company.agent.delete(api(`/incomes/${id}`));
    expect(removed.status).toBe(200);

    const fetched = await company.agent.get(api(`/incomes/${id}`));
    expect(fetched.status).toBe(404);
    expect(fetched.body.code).toBe("INCOME_NOT_FOUND");

    const list = await company.agent.get(api("/incomes"));
    expect(list.body.incomes).toHaveLength(0);
  });

  it("does not leak income across tenants", async () => {
    const companyA = await createCompanyWithAdmin();
    const companyB = await createCompanyWithAdmin();
    const created = await createIncome(companyA.agent);
    const id = created.body.income.id as string;

    const stolen = await companyB.agent.get(api(`/incomes/${id}`));
    expect(stolen.status).toBe(404);
    expect(stolen.body.code).toBe("INCOME_NOT_FOUND");

    const listB = await companyB.agent.get(api("/incomes"));
    expect(listB.body.incomes).toHaveLength(0);
  });

  it("computes dashboard net balance as income minus expense", async () => {
    const company = await createCompanyWithAdmin();

    const income = await createIncome(company.agent, {
      occurredOn: "2026-08-10",
      amount: "100.00",
    });
    expect(income.status).toBe(201);

    const expense = await createExpense(company.agent, {
      occurredOn: "2026-08-12",
      amount: "40.00",
    });
    expect(expense.status).toBe(201);

    const summary = await company.agent.get(
      api("/dashboard/summary?preset=custom&from=2026-08-01&to=2026-08-31"),
    );
    expect(summary.status).toBe(200);
    expect(summary.body.kpis.totalIncome).toBe("100.00");
    expect(summary.body.kpis.totalExpense).toBe("40.00");
    expect(summary.body.kpis.netBalance).toBe("60.00");
    expect(summary.body.kpis.incomeCount).toBe(1);
    expect(summary.body.kpis.expenseCount).toBe(1);
  });

  it("excludes soft-deleted rows from net balance", async () => {
    const company = await createCompanyWithAdmin();
    const income = await createIncome(company.agent, {
      occurredOn: "2026-08-10",
      amount: "100.00",
    });
    const expense = await createExpense(company.agent, {
      occurredOn: "2026-08-12",
      amount: "40.00",
    });

    await company.agent.delete(api(`/expenses/${expense.body.expense.id}`));

    const summary = await company.agent.get(
      api("/dashboard/summary?preset=custom&from=2026-08-01&to=2026-08-31"),
    );
    expect(summary.status).toBe(200);
    expect(summary.body.kpis.totalIncome).toBe("100.00");
    expect(summary.body.kpis.totalExpense).toBe("0.00");
    expect(summary.body.kpis.netBalance).toBe("100.00");

    await company.agent.delete(api(`/incomes/${income.body.income.id}`));
    const after = await company.agent.get(
      api("/dashboard/summary?preset=custom&from=2026-08-01&to=2026-08-31"),
    );
    expect(after.body.kpis.netBalance).toBe("0.00");
  });
});
