import type { Tenant, User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
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
  tenantId: user.tenantId,
  tenant: toPublicTenant(user.tenant),
  createdAt: user.createdAt.toISOString(),
});

const issueSession = (user: UserWithTenant) => {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  return { user: toPublicUser(user), accessToken };
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

  if (user.tenant?.status === "INACTIVE") {
    throw new AppError("This company is inactive", 403, "TENANT_INACTIVE");
  }

  return issueSession(user);
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { tenant: true },
  });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return toPublicUser(user);
};
