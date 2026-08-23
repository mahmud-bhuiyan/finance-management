import type { Tenant, User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "./auditService.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { LoginInput, RegisterInput } from "../validators/authValidators.js";

type UserWithTenant = User & { tenant: Tenant | null };

const toPublicTenant = (tenant: Tenant | null) =>
  tenant
    ? {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      }
    : null;

export const toPublicUser = (user: UserWithTenant) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  tenantId: user.tenantId,
  tenant: toPublicTenant(user.tenant),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const SESSION_EXPIRES_IN = "12h";

const issueSession = (user: UserWithTenant, rememberMe = true) => {
  const accessToken = signAccessToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    rememberMe ? undefined : SESSION_EXPIRES_IN,
  );

  return { user: toPublicUser(user), accessToken, rememberMe };
};

export const registerUser = async (input: RegisterInput) => {
  const email = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email is already registered", 409, "EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name ?? null,
    },
    include: { tenant: true },
  });

  await writeAuditLog({
    actor: { id: user.id, tenantId: user.tenantId },
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    tenantId: user.tenantId,
    newValues: toPublicUser(user),
  });

  return issueSession(user);
};

export const loginUser = async (input: LoginInput) => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (user.status === "INACTIVE") {
    throw new AppError("This account is inactive", 403, "USER_INACTIVE");
  }

  if (user.tenant?.status === "INACTIVE") {
    throw new AppError("This company is inactive", 403, "TENANT_INACTIVE");
  }

  return issueSession(user, input.rememberMe);
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { tenant: true },
  });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.status === "INACTIVE") {
    throw new AppError("This account is inactive", 403, "USER_INACTIVE");
  }

  return toPublicUser(user);
};
