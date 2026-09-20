import { prisma } from "../config/prisma.js";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_MANAGER_EMAIL,
  DEMO_MEMBER_EMAIL,
  DEMO_TENANT_NAME,
  DEMO_TENANT_SLUG,
  getDemoPassword,
  isDemoModeEnabled,
} from "../config/demoUsers.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/password.js";

const ensureDemoTenant = async () => {
  const existing = await prisma.tenant.findUnique({
    where: { slug: DEMO_TENANT_SLUG },
  });

  if (existing) {
    return existing;
  }

  return prisma.tenant.create({
    data: {
      name: DEMO_TENANT_NAME,
      slug: DEMO_TENANT_SLUG,
    },
  });
};

const ensureDemoUser = async ({
  email,
  name,
  role,
  tenantId,
  passwordHash,
}: {
  email: string;
  name: string;
  role: "COMPANY_ADMIN" | "NORMAL_USER";
  tenantId: string;
  passwordHash: string;
}) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    const updates: {
      role?: "COMPANY_ADMIN" | "NORMAL_USER";
      tenantId?: string;
      status?: "ACTIVE";
    } = {};

    if (existing.role !== role) {
      updates.role = role;
    }
    if (existing.tenantId !== tenantId) {
      updates.tenantId = tenantId;
    }
    if (existing.status !== "ACTIVE") {
      updates.status = "ACTIVE";
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    return;
  }

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name,
      role,
      tenantId,
    },
  });
};

export const ensureDemoAccounts = async () => {
  if (!isDemoModeEnabled()) {
    return;
  }

  const demoPassword = getDemoPassword();
  if (!demoPassword) {
    console.warn(
      "DEMO_MODE is enabled but DEMO_PASSWORD is missing or too short — skipping demo account bootstrap",
    );
    return;
  }

  const superAdminEmail = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!superAdminEmail) {
    console.warn(
      "DEMO_MODE is enabled but SUPER_ADMIN_EMAIL is not set — demo Super Admin will be unavailable",
    );
  }

  const passwordHash = await hashPassword(demoPassword);
  const tenant = await ensureDemoTenant();

  await ensureDemoUser({
    email: DEMO_ADMIN_EMAIL,
    name: "Demo Company Admin",
    role: "COMPANY_ADMIN",
    tenantId: tenant.id,
    passwordHash,
  });

  await ensureDemoUser({
    email: DEMO_MANAGER_EMAIL,
    name: "Demo Manager",
    role: "NORMAL_USER",
    tenantId: tenant.id,
    passwordHash,
  });

  await ensureDemoUser({
    email: DEMO_MEMBER_EMAIL,
    name: "Demo Member",
    role: "NORMAL_USER",
    tenantId: tenant.id,
    passwordHash,
  });

  if (superAdminEmail) {
    const superAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (superAdmin) {
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
          passwordHash,
          role: "SUPER_ADMIN",
          tenantId: null,
          status: "ACTIVE",
        },
      });
    }
  }

  if (env.NODE_ENV !== "test") {
    console.log("Demo accounts ready (Superadmin, Company Admin, Manager, Member)");
  }
};
