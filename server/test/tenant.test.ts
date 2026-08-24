import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import {
  api,
  createCompanyWithAdmin,
  loginAsSuperAdmin,
  unique,
} from "./helpers.js";

describe("tenant list API", () => {
  it("paginates, sorts, and searches companies on the server", async () => {
    const superAgent = await loginAsSuperAdmin();
    const suffix = unique("tenant-list");

    const alpha = await superAgent.post(api("/tenants")).send({
      name: `Alpha ${suffix}`,
    });
    expect(alpha.status).toBe(201);

    const beta = await superAgent.post(api("/tenants")).send({
      name: `Beta ${suffix}`,
    });
    expect(beta.status).toBe(201);

    const listed = await superAgent.get(
      api(
        `/tenants?status=ACTIVE&page=1&pageSize=1&sortBy=name&sortDir=asc&q=${suffix}`,
      ),
    );

    expect(listed.status).toBe(200);
    expect(listed.body.data.tenants).toHaveLength(1);
    expect(listed.body.data.tenants[0].name).toContain("Alpha");
    expect(listed.body.data.meta).toMatchObject({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
      sortBy: "name",
      sortDir: "asc",
      status: "ACTIVE",
      q: suffix,
    });

    const secondPage = await superAgent.get(
      api(
        `/tenants?status=ACTIVE&page=2&pageSize=1&sortBy=name&sortDir=asc&q=${suffix}`,
      ),
    );

    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data.tenants).toHaveLength(1);
    expect(secondPage.body.data.tenants[0].name).toContain("Beta");
  });

  it("returns one company by id", async () => {
    const superAgent = await loginAsSuperAdmin();
    const created = await superAgent.post(api("/tenants")).send({
      name: `Lookup ${unique("tenant")}`,
    });
    expect(created.status).toBe(201);

    const tenantId = created.body.data.tenant.id;
    const show = await superAgent.get(api(`/tenants/${tenantId}`));

    expect(show.status).toBe(200);
    expect(show.body.data.tenant.id).toBe(tenantId);
  });

  it("forbids tenant APIs to company admins", async () => {
    const company = await createCompanyWithAdmin();
    const denied = await company.agent.get(api("/tenants"));
    expect(denied.status).toBe(403);
    expect(denied.body.error.code).toBe("FORBIDDEN");
  });
});
