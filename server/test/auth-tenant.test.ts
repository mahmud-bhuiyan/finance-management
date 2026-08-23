import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import {
  api,
  createCompanyWithAdmin,
  createExpense,
  createNormalUser,
  login,
  loginAsSuperAdmin,
  unique,
} from "./helpers.js";

describe("FMS-10 auth, tenant isolation, permission denial", () => {
  it("registers, logs in, and returns the current user", async () => {
    const email = `${unique("reg")}@test.local`;
    const password = "password123";

    const registered = await request(app).post(api("/auth/register")).send({
      email,
      password,
      name: "Registered",
    });
    expect(registered.status).toBe(201);
    expect(registered.body.success).toBe(true);
    expect(registered.body.data.user.email).toBe(email);
    expect(registered.body.data.user.role).toBe("NORMAL_USER");
    expect(registered.body.data.user.tenantId).toBeNull();
    expect(registered.body.data.user.themePreference).toBe("LIGHT");
    expect(registered.headers["set-cookie"]).toBeTruthy();

    const agent = await login(email, password);
    const me = await agent.get(api("/auth/me"));
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(email);
  });

  it("sets a persistent cookie when rememberMe is true and a session cookie when false", async () => {
    const email = `${unique("remember")}@test.local`;
    const password = "password123";

    await request(app).post(api("/auth/register")).send({
      email,
      password,
      name: "Remember User",
    });

    const remembered = await request(app).post(api("/auth/login")).send({
      email,
      password,
      rememberMe: true,
    });
    expect(remembered.status).toBe(200);
    const rememberedCookie = remembered.headers["set-cookie"]?.[0] ?? "";
    expect(rememberedCookie).toMatch(/Max-Age=/i);

    const sessionOnly = await request(app).post(api("/auth/login")).send({
      email,
      password,
      rememberMe: false,
    });
    expect(sessionOnly.status).toBe(200);
    const sessionCookie = sessionOnly.headers["set-cookie"]?.[0] ?? "";
    expect(sessionCookie).not.toMatch(/Max-Age=/i);
  });

  it("updates and persists the current user theme preference", async () => {
    const email = `${unique("theme")}@test.local`;
    const password = "password123";

    await request(app).post(api("/auth/register")).send({
      email,
      password,
      name: "Theme User",
    });

    const agent = await login(email, password);

    const me = await agent.get(api("/auth/me"));
    expect(me.status).toBe(200);
    expect(me.body.data.user.themePreference).toBe("LIGHT");

    const updated = await agent
      .patch(api("/auth/me/theme"))
      .send({ themePreference: "DARK" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.user.themePreference).toBe("DARK");

    const meAgain = await agent.get(api("/auth/me"));
    expect(meAgain.status).toBe(200);
    expect(meAgain.body.data.user.themePreference).toBe("DARK");
  });

  it("rejects invalid credentials and missing sessions", async () => {
    const email = `${unique("bad")}@test.local`;
    await request(app).post(api("/auth/register")).send({
      email,
      password: "password123",
    });

    const wrong = await request(app).post(api("/auth/login")).send({
      email,
      password: "wrong-password",
    });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.code).toBe("INVALID_CREDENTIALS");

    const me = await request(app).get(api("/auth/me"));
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects duplicate emails and short passwords", async () => {
    const email = `${unique("dup")}@test.local`;
    const first = await request(app).post(api("/auth/register")).send({
      email,
      password: "password123",
    });
    expect(first.status).toBe(201);

    const duplicate = await request(app).post(api("/auth/register")).send({
      email,
      password: "password123",
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("EMAIL_TAKEN");

    const short = await request(app).post(api("/auth/register")).send({
      email: `${unique("pw")}@test.local`,
      password: "short",
    });
    expect(short.status).toBe(400);
    expect(short.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("blocks inactive users from logging in", async () => {
    const company = await createCompanyWithAdmin();
    const normal = await createNormalUser(company.agent);

    const deactivated = await company.agent
      .patch(api(`/users/${normal.user.id}`))
      .send({ status: "INACTIVE" });
    expect(deactivated.status).toBe(200);

    const loginRes = await request(app).post(api("/auth/login")).send({
      email: normal.email,
      password: normal.password,
    });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.error.code).toBe("USER_INACTIVE");
  });

  it("keeps expenses isolated between tenants", async () => {
    const companyA = await createCompanyWithAdmin();
    const companyB = await createCompanyWithAdmin();

    const created = await createExpense(companyA.agent, { notes: "A only" });
    expect(created.status).toBe(201);
    const expenseId = created.body.data.expense.id as string;

    const stolen = await companyB.agent.get(api(`/expenses/${expenseId}`));
    expect(stolen.status).toBe(404);
    expect(stolen.body.error.code).toBe("EXPENSE_NOT_FOUND");

    const listB = await companyB.agent.get(api("/expenses"));
    expect(listB.status).toBe(200);
    expect(listB.body.data.expenses).toHaveLength(0);
  });

  it("denies finance writes for normal users and guest callers", async () => {
    const company = await createCompanyWithAdmin();
    const normal = await createNormalUser(company.agent);

    const guest = await request(app).post(api("/expenses")).send({
      occurredOn: "2026-08-15",
      amount: "10.00",
    });
    expect(guest.status).toBe(401);
    expect(guest.body.error.code).toBe("UNAUTHORIZED");

    const denied = await createExpense(normal.agent);
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("FORBIDDEN");

    const readable = await normal.agent.get(api("/expenses"));
    expect(readable.status).toBe(200);
  });

  it("requires a tenant for Super Admin finance routes and forbids tenant APIs to company admins", async () => {
    const superAgent = await loginAsSuperAdmin();
    const asSuper = await superAgent.get(api("/expenses"));
    expect(asSuper.status).toBe(403);
    expect(asSuper.body.error.code).toBe("TENANT_REQUIRED");

    const company = await createCompanyWithAdmin();
    const asAdmin = await company.agent.post(api("/tenants")).send({
      name: "Should fail",
    });
    expect(asAdmin.status).toBe(403);
    expect(asAdmin.body.error.code).toBe("FORBIDDEN");
  });
});
