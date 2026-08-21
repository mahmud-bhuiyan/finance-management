import request from "supertest";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";
import { ensureSuperAdmin } from "../src/services/bootstrapService.js";

type Agent = ReturnType<typeof request.agent>;

let seq = 0;

export const unique = (prefix = "t") => {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq}`;
};

export const api = (path: string) => `/api/v1${path}`;

export const resetTestDatabase = async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      expense_attachments,
      financial_transactions,
      field_definitions,
      expense_categories,
      departments,
      vendors,
      audit_logs,
      health_checks,
      users,
      tenants
    CASCADE
  `);
  await ensureSuperAdmin();
};

export const login = async (email: string, password: string) => {
  const agent = request.agent(app);
  const res = await agent.post(api("/auth/login")).send({ email, password });
  if (res.status !== 200) {
    throw new Error(
      `Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
  return agent;
};

export const loginAsSuperAdmin = async () => {
  const email = env.SUPER_ADMIN_EMAIL;
  const password = env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD must be set for tests");
  }
  return login(email, password);
};

export const createCompanyWithAdmin = async () => {
  const stamp = unique("co");
  const superAgent = await loginAsSuperAdmin();
  const tenantRes = await superAgent.post(api("/tenants")).send({
    name: `Company ${stamp}`,
    slug: `co-${stamp}`,
  });
  if (tenantRes.status !== 201) {
    throw new Error(`Create tenant failed: ${JSON.stringify(tenantRes.body)}`);
  }

  const email = `admin-${stamp}@test.local`;
  const password = "password123";
  const adminRes = await superAgent
    .post(api(`/tenants/${tenantRes.body.tenant.id}/admins`))
    .send({ email, password, name: "Company Admin" });
  if (adminRes.status !== 201) {
    throw new Error(`Create admin failed: ${JSON.stringify(adminRes.body)}`);
  }

  const agent = await login(email, password);
  return {
    tenant: tenantRes.body.tenant as { id: string; name: string; slug: string },
    admin: adminRes.body.admin as { id: string; email: string; tenantId: string },
    email,
    password,
    agent,
  };
};

export const createNormalUser = async (adminAgent: Agent) => {
  const stamp = unique("nu");
  const email = `user-${stamp}@test.local`;
  const password = "password123";
  const res = await adminAgent.post(api("/users")).send({
    email,
    password,
    name: "Normal User",
    role: "NORMAL_USER",
  });
  if (res.status !== 201) {
    throw new Error(`Create normal user failed: ${JSON.stringify(res.body)}`);
  }
  const agent = await login(email, password);
  return { user: res.body.user as { id: string; email: string }, email, password, agent };
};

export const createExpense = async (
  agent: Agent,
  overrides: Record<string, unknown> = {},
) => {
  const res = await agent.post(api("/expenses")).send({
    occurredOn: "2026-08-15",
    amount: "40.00",
    notes: "Test expense",
    ...overrides,
  });
  return res;
};

export const createIncome = async (
  agent: Agent,
  overrides: Record<string, unknown> = {},
) => {
  const res = await agent.post(api("/incomes")).send({
    occurredOn: "2026-08-15",
    amount: "100.00",
    notes: "Test income",
    ...overrides,
  });
  return res;
};
