import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { writeAuditLog } from "./auditService.js";
import type {
  CreateSupportDataInput,
  ListSupportDataQuery,
  SupportDataKind,
  UpdateSupportDataInput,
} from "../validators/supportDataValidators.js";

type SupportRow = {
  id: string;
  tenantId: string;
  name: string;
  notes: string | null;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const ENTITY_TYPE: Record<SupportDataKind, string> = {
  category: "ExpenseCategory",
  department: "Department",
  vendor: "Vendor",
};

const notFoundCode: Record<SupportDataKind, string> = {
  category: "CATEGORY_NOT_FOUND",
  department: "DEPARTMENT_NOT_FOUND",
  vendor: "VENDOR_NOT_FOUND",
};

const duplicateCode: Record<SupportDataKind, string> = {
  category: "CATEGORY_NAME_TAKEN",
  department: "DEPARTMENT_NAME_TAKEN",
  vendor: "VENDOR_NAME_TAKEN",
};

const labelFor: Record<SupportDataKind, string> = {
  category: "Category",
  department: "Department",
  vendor: "Vendor",
};

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

export const toPublicSupportItem = (row: SupportRow) => ({
  id: row.id,
  tenantId: row.tenantId,
  name: row.name,
  notes: row.notes,
  active: row.active,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const findMany = (
  kind: SupportDataKind,
  tenantId: string,
  where: {
    deletedAt: null;
    active?: boolean;
  },
) => {
  const orderBy = [{ name: "asc" as const }];
  switch (kind) {
    case "category":
      return prisma.expenseCategory.findMany({
        where: { tenantId, ...where },
        orderBy,
      });
    case "department":
      return prisma.department.findMany({
        where: { tenantId, ...where },
        orderBy,
      });
    case "vendor":
      return prisma.vendor.findMany({
        where: { tenantId, ...where },
        orderBy,
      });
  }
};

const findUnique = (kind: SupportDataKind, id: string) => {
  switch (kind) {
    case "category":
      return prisma.expenseCategory.findUnique({ where: { id } });
    case "department":
      return prisma.department.findUnique({ where: { id } });
    case "vendor":
      return prisma.vendor.findUnique({ where: { id } });
  }
};

const createRow = (
  kind: SupportDataKind,
  tenantId: string,
  data: { name: string; notes: string | null; active: boolean },
) => {
  switch (kind) {
    case "category":
      return prisma.expenseCategory.create({ data: { tenantId, ...data } });
    case "department":
      return prisma.department.create({ data: { tenantId, ...data } });
    case "vendor":
      return prisma.vendor.create({ data: { tenantId, ...data } });
  }
};

const updateRow = (
  kind: SupportDataKind,
  id: string,
  data: {
    name?: string;
    notes?: string | null;
    active?: boolean;
    deletedAt?: Date | null;
  },
) => {
  switch (kind) {
    case "category":
      return prisma.expenseCategory.update({ where: { id }, data });
    case "department":
      return prisma.department.update({ where: { id }, data });
    case "vendor":
      return prisma.vendor.update({ where: { id }, data });
  }
};

const findByName = async (
  kind: SupportDataKind,
  tenantId: string,
  name: string,
  excludeId?: string,
) => {
  const rows = await findMany(kind, tenantId, { deletedAt: null });
  return rows.find(
    (row) =>
      row.name.toLowerCase() === name.toLowerCase() &&
      row.id !== excludeId,
  );
};

const getForTenant = async (kind: SupportDataKind, tenantId: string, id: string) => {
  const row = await findUnique(kind, id);
  if (!row || row.tenantId !== tenantId || row.deletedAt) {
    throw new AppError(
      `${labelFor[kind]} not found`,
      404,
      notFoundCode[kind],
    );
  }
  return row;
};

export const listSupportItems = async (
  kind: SupportDataKind,
  tenantId: string,
  query: ListSupportDataQuery,
) => {
  const where: { deletedAt: null; active?: boolean } = { deletedAt: null };

  if (query.active !== undefined) {
    where.active = query.active;
  } else if (!query.includeInactive) {
    where.active = true;
  }

  const rows = await findMany(kind, tenantId, where);
  return rows.map(toPublicSupportItem);
};

export const getSupportItem = async (
  kind: SupportDataKind,
  tenantId: string,
  id: string,
) => toPublicSupportItem(await getForTenant(kind, tenantId, id));

export const createSupportItem = async (
  kind: SupportDataKind,
  tenantId: string,
  input: CreateSupportDataInput,
  actorId: string,
) => {
  const name = normalizeName(input.name);
  const duplicate = await findByName(kind, tenantId, name);
  if (duplicate) {
    throw new AppError(
      `${labelFor[kind]} name already exists`,
      409,
      duplicateCode[kind],
    );
  }

  const row = await createRow(kind, tenantId, {
    name,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    active: input.active ?? true,
  });

  const publicItem = toPublicSupportItem(row);
  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "CREATE",
    entityType: ENTITY_TYPE[kind],
    entityId: row.id,
    tenantId,
    newValues: publicItem,
  });

  return publicItem;
};

export const updateSupportItem = async (
  kind: SupportDataKind,
  tenantId: string,
  id: string,
  input: UpdateSupportDataInput,
  actorId: string,
) => {
  const existing = await getForTenant(kind, tenantId, id);

  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    const duplicate = await findByName(kind, tenantId, name, id);
    if (duplicate) {
      throw new AppError(
        `${labelFor[kind]} name already exists`,
        409,
        duplicateCode[kind],
      );
    }
  }

  const row = await updateRow(kind, id, {
    ...(input.name !== undefined ? { name: normalizeName(input.name) } : {}),
    ...(input.notes !== undefined
      ? { notes: input.notes?.trim() ? input.notes.trim() : null }
      : {}),
    ...(input.active !== undefined ? { active: input.active } : {}),
  });

  const publicItem = toPublicSupportItem(row);
  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "UPDATE",
    entityType: ENTITY_TYPE[kind],
    entityId: row.id,
    tenantId,
    oldValues: toPublicSupportItem(existing),
    newValues: publicItem,
  });

  return publicItem;
};

export const deleteSupportItem = async (
  kind: SupportDataKind,
  tenantId: string,
  id: string,
  actorId: string,
) => {
  const existing = await getForTenant(kind, tenantId, id);
  await updateRow(kind, id, { deletedAt: new Date(), active: false });

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "DELETE",
    entityType: ENTITY_TYPE[kind],
    entityId: existing.id,
    tenantId,
    oldValues: toPublicSupportItem(existing),
  });
};

/** Resolve a non-deleted lookup id for expense FK assignment. */
export const assertActiveSupportRef = async (
  kind: SupportDataKind,
  tenantId: string,
  id: string | null | undefined,
) => {
  if (id === undefined) {
    return undefined;
  }
  if (id === null || id === "") {
    return null;
  }

  const row = await getForTenant(kind, tenantId, id);
  return row.id;
};
