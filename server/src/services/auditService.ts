import type { AuditAction, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { ListAuditLogsInput } from "../validators/auditValidators.js";

type AuditActor = {
  id: string;
  tenantId: string | null;
};

export type WriteAuditInput = {
  actor: AuditActor;
  action: AuditAction;
  entityType: string;
  entityId: string;
  tenantId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
};

const SENSITIVE_KEYS = new Set(["passwordHash", "password"]);

const sanitizeValues = (
  values: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined => {
  if (!values) {
    return undefined;
  }

  const cleaned = Object.fromEntries(
    Object.entries(values).filter(([key]) => !SENSITIVE_KEYS.has(key)),
  );

  return cleaned as Prisma.InputJsonValue;
};

export const writeAuditLog = async (input: WriteAuditInput) => {
  return prisma.auditLog.create({
    data: {
      actorId: input.actor.id,
      tenantId: input.tenantId ?? input.actor.tenantId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: sanitizeValues(input.oldValues),
      newValues: sanitizeValues(input.newValues),
    },
  });
};

const toPublicAuditLog = (
  log: Prisma.AuditLogGetPayload<{
    include: {
      actor: { select: { id: true; email: true; name: true; role: true } };
    };
  }>,
) => ({
  id: log.id,
  tenantId: log.tenantId,
  action: log.action,
  entityType: log.entityType,
  entityId: log.entityId,
  oldValues: log.oldValues,
  newValues: log.newValues,
  createdAt: log.createdAt.toISOString(),
  actor: {
    id: log.actor.id,
    email: log.actor.email,
    name: log.actor.name,
    role: log.actor.role,
  },
});

type AuditViewer = {
  id: string;
  role: UserRole;
  tenantId: string | null;
};

export const listAuditLogs = async (
  viewer: AuditViewer,
  query: ListAuditLogsInput,
) => {
  const where: Prisma.AuditLogWhereInput = {};

  if (viewer.role === "SUPER_ADMIN") {
    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }
  } else if (viewer.role === "COMPANY_ADMIN") {
    if (!viewer.tenantId) {
      throw new AppError("Company membership required", 403, "TENANT_REQUIRED");
    }
    where.tenantId = viewer.tenantId;
  } else {
    throw new AppError("Permission denied", 403, "FORBIDDEN");
  }

  if (query.entityType) {
    where.entityType = query.entityType;
  }

  if (query.entityId) {
    where.entityId = query.entityId;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: query.limit,
    include: {
      actor: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });

  return logs.map(toPublicAuditLog);
};
