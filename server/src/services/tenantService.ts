import type { Tenant, User, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "./auditService.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { slugify } from "../utils/slug.js";
import type {
  CreateCompanyAdminInput,
  CreateTenantInput,
  UpdateTenantInput,
} from "../validators/tenantValidators.js";

const toPublicAdmin = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  tenantId: user.tenantId,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const toPublicTenant = (
  tenant: Tenant & { users?: User[] },
) => ({
  id: tenant.id,
  name: tenant.name,
  slug: tenant.slug,
  status: tenant.status,
  createdAt: tenant.createdAt.toISOString(),
  updatedAt: tenant.updatedAt.toISOString(),
  admins: (tenant.users ?? []).map(toPublicAdmin),
});

const uniqueSlug = async (base: string) => {
  let slug = base;
  let n = 2;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    const suffix = `-${n}`;
    slug = `${base.slice(0, Math.max(1, 80 - suffix.length))}${suffix}`;
    n += 1;
  }

  return slug;
};

const tenantWithAdmins = {
  users: {
    where: { role: "COMPANY_ADMIN" as UserRole },
    orderBy: { createdAt: "asc" as const },
  },
};

export const listTenants = async () => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: tenantWithAdmins,
  });

  return tenants.map(toPublicTenant);
};

export const createTenant = async (
  input: CreateTenantInput,
  actorId: string,
) => {
  const slug = await uniqueSlug(input.slug ?? slugify(input.name));

  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      slug,
    },
    include: tenantWithAdmins,
  });

  const publicTenant = toPublicTenant(tenant);

  await writeAuditLog({
    actor: { id: actorId, tenantId: null },
    action: "CREATE",
    entityType: "Tenant",
    entityId: tenant.id,
    tenantId: tenant.id,
    newValues: publicTenant,
  });

  return publicTenant;
};

export const updateTenant = async (
  id: string,
  input: UpdateTenantInput,
  actorId: string,
) => {
  const existing = await prisma.tenant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Company not found", 404, "TENANT_NOT_FOUND");
  }

  if (input.slug !== undefined && input.slug !== existing.slug) {
    const conflict = await prisma.tenant.findUnique({
      where: { slug: input.slug },
    });
    if (conflict) {
      throw new AppError("Slug is already in use", 409, "SLUG_TAKEN");
    }
  }

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
    },
    include: tenantWithAdmins,
  });

  const publicTenant = toPublicTenant(tenant);

  await writeAuditLog({
    actor: { id: actorId, tenantId: null },
    action: "UPDATE",
    entityType: "Tenant",
    entityId: tenant.id,
    tenantId: tenant.id,
    oldValues: toPublicTenant(existing),
    newValues: publicTenant,
  });

  return publicTenant;
};

export const createCompanyAdmin = async (
  tenantId: string,
  input: CreateCompanyAdminInput,
  actorId: string,
) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("Company not found", 404, "TENANT_NOT_FOUND");
  }

  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email is already registered", 409, "EMAIL_TAKEN");
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(input.password),
      name: input.name ?? null,
      role: "COMPANY_ADMIN",
      tenantId: tenant.id,
    },
  });

  const publicAdmin = toPublicAdmin(user);

  await writeAuditLog({
    actor: { id: actorId, tenantId: null },
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    tenantId: tenant.id,
    newValues: publicAdmin,
  });

  return publicAdmin;
};

export const deleteTenant = async (id: string, actorId: string) => {
  const existing = await prisma.tenant.findUnique({
    where: { id },
    include: tenantWithAdmins,
  });
  if (!existing) {
    throw new AppError("Company not found", 404, "TENANT_NOT_FOUND");
  }

  const transactionCount = await prisma.financialTransaction.count({
    where: { tenantId: id },
  });
  if (transactionCount > 0) {
    throw new AppError(
      "Company has financial records and cannot be deleted",
      400,
      "TENANT_HAS_DATA",
    );
  }

  const publicTenant = toPublicTenant(existing);

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({ where: { tenantId: id } });
    await tx.tenant.delete({ where: { id } });
  });

  await writeAuditLog({
    actor: { id: actorId, tenantId: null },
    action: "DELETE",
    entityType: "Tenant",
    entityId: id,
    tenantId: null,
    oldValues: publicTenant,
  });
};
