import type { User, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "./auditService.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import type {
  CreateTenantUserInput,
  UpdateTenantUserInput,
} from "../validators/userValidators.js";

const TENANT_ROLES: readonly UserRole[] = ["COMPANY_ADMIN", "NORMAL_USER"];

export const toPublicTenantUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  tenantId: user.tenantId,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const getTenantUser = async (tenantId: string, id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (
    !user ||
    user.tenantId !== tenantId ||
    !TENANT_ROLES.includes(user.role)
  ) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
  return user;
};

const countActiveCompanyAdmins = async (tenantId: string) =>
  prisma.user.count({
    where: {
      tenantId,
      role: "COMPANY_ADMIN",
      status: "ACTIVE",
    },
  });

const assertNotLastActiveAdmin = async (
  tenantId: string,
  user: User,
  nextRole?: UserRole,
  nextStatus?: UserStatus,
) => {
  if (user.role !== "COMPANY_ADMIN" || user.status !== "ACTIVE") {
    return;
  }

  const roleAfter = nextRole ?? user.role;
  const statusAfter = nextStatus ?? user.status;
  const remainsActiveAdmin =
    roleAfter === "COMPANY_ADMIN" && statusAfter === "ACTIVE";

  if (remainsActiveAdmin) {
    return;
  }

  const activeAdmins = await countActiveCompanyAdmins(tenantId);
  if (activeAdmins <= 1) {
    throw new AppError(
      "Cannot remove or deactivate the last active company admin",
      400,
      "LAST_ADMIN",
    );
  }
};

export const listTenantUsers = async (tenantId: string) => {
  const users = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: [...TENANT_ROLES] },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return users.map(toPublicTenantUser);
};

export const createTenantUser = async (
  tenantId: string,
  input: CreateTenantUserInput,
  actorId: string,
) => {
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
      role: input.role,
      status: "ACTIVE",
      tenantId,
    },
  });

  const publicUser = toPublicTenantUser(user);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    tenantId,
    newValues: publicUser,
  });

  return publicUser;
};

export const updateTenantUser = async (
  tenantId: string,
  id: string,
  input: UpdateTenantUserInput,
  actorId: string,
) => {
  if (id === actorId) {
    if (input.role !== undefined || input.status !== undefined) {
      throw new AppError(
        "You cannot change your own role or status",
        400,
        "SELF_UPDATE_FORBIDDEN",
      );
    }
  }

  const existing = await getTenantUser(tenantId, id);

  await assertNotLastActiveAdmin(
    tenantId,
    existing,
    input.role,
    input.status,
  );

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });

  const publicUser = toPublicTenantUser(user);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "UPDATE",
    entityType: "User",
    entityId: user.id,
    tenantId,
    oldValues: toPublicTenantUser(existing),
    newValues: publicUser,
  });

  return publicUser;
};
