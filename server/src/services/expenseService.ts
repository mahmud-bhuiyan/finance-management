import type {
  Department,
  ExpenseCategory,
  FieldDefinition,
  FinancialTransaction,
  UserRole,
  Vendor,
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { writeAuditLog } from "./auditService.js";
import { toPublicField } from "./fieldService.js";
import {
  assertActiveSupportRef,
} from "./supportDataService.js";
import type {
  CreateExpenseInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "../validators/expenseValidators.js";

const ENTITY_TYPE = "FinancialTransaction";

type ExpenseWithSupport = FinancialTransaction & {
  category: ExpenseCategory | null;
  department: Department | null;
  vendor: Vendor | null;
  _count: { attachments: number };
};

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const isBlank = (value: unknown) =>
  value === undefined || value === null || value === "";

const validateCustomValues = (
  fields: FieldDefinition[],
  input: Record<string, unknown> | undefined,
  existing: Record<string, unknown>,
) => {
  const enabled = fields.filter((field) => field.enabled);
  const enabledKeys = new Set(enabled.map((field) => field.key));
  const next: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(existing)) {
    if (!enabledKeys.has(key)) {
      next[key] = value;
    }
  }

  for (const field of enabled) {
    const value = input?.[field.key];
    const missing = isBlank(value);

    if (field.required && field.fieldType !== "BOOLEAN" && missing) {
      throw new AppError(`${field.label} is required`, 400, "FIELD_REQUIRED");
    }

    if (missing) {
      continue;
    }

    switch (field.fieldType) {
      case "NUMBER":
      case "CURRENCY": {
        const numeric = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(numeric)) {
          throw new AppError(
            `${field.label} must be a number`,
            400,
            "FIELD_INVALID",
          );
        }
        next[field.key] = numeric;
        break;
      }
      case "BOOLEAN":
        if (typeof value !== "boolean") {
          throw new AppError(
            `${field.label} must be true or false`,
            400,
            "FIELD_INVALID",
          );
        }
        next[field.key] = value;
        break;
      case "DATE": {
        const raw = String(value);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          throw new AppError(
            `${field.label} must be YYYY-MM-DD`,
            400,
            "FIELD_INVALID",
          );
        }
        next[field.key] = raw;
        break;
      }
      case "DROPDOWN": {
        const raw = String(value);
        const choices = asRecord(field.options).choices;
        const allowed = Array.isArray(choices)
          ? choices.map((choice) => String(choice))
          : [];
        if (!allowed.includes(raw)) {
          throw new AppError(
            `${field.label} must be one of the configured choices`,
            400,
            "FIELD_INVALID",
          );
        }
        next[field.key] = raw;
        break;
      }
      default:
        next[field.key] = String(value);
    }
  }

  return next;
};

const visibleFieldsForRole = (fields: FieldDefinition[], role: UserRole) =>
  fields.filter(
    (field) =>
      field.enabled &&
      (role !== "NORMAL_USER" || field.visibleToNormalUser),
  );

const filterCustomValues = (
  values: Record<string, unknown>,
  fields: FieldDefinition[],
) => {
  const allowed = new Set(fields.map((field) => field.key));
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => allowed.has(key)),
  );
};

const toRef = (row: { id: string; name: string } | null) =>
  row ? { id: row.id, name: row.name } : null;

const toPublicExpense = (
  row: ExpenseWithSupport,
  visibleFields: FieldDefinition[],
) => ({
  id: row.id,
  tenantId: row.tenantId,
  type: row.type,
  occurredOn: toDateOnly(row.occurredOn),
  amount: row.amount.toFixed(2),
  notes: row.notes,
  paymentMethod: row.paymentMethod,
  customValues: filterCustomValues(asRecord(row.customValues), visibleFields),
  categoryId: row.categoryId,
  departmentId: row.departmentId,
  vendorId: row.vendorId,
  category: toRef(row.category),
  department: toRef(row.department),
  vendor: toRef(row.vendor),
  attachmentCount: row._count.attachments,
  createdById: row.createdById,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const supportInclude = {
  category: true,
  department: true,
  vendor: true,
  _count: {
    select: {
      attachments: { where: { deletedAt: null } },
    },
  },
} as const;

const loadExpenseFields = async (tenantId: string) =>
  prisma.fieldDefinition.findMany({
    where: { tenantId, target: "EXPENSE" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

const resolveSupportIds = async (
  tenantId: string,
  input: {
    categoryId?: string | null;
    departmentId?: string | null;
    vendorId?: string | null;
  },
) => {
  const [categoryId, departmentId, vendorId] = await Promise.all([
    assertActiveSupportRef("category", tenantId, input.categoryId),
    assertActiveSupportRef("department", tenantId, input.departmentId),
    assertActiveSupportRef("vendor", tenantId, input.vendorId),
  ]);

  return { categoryId, departmentId, vendorId };
};

const getExpenseForTenant = async (tenantId: string, id: string) => {
  const expense = await prisma.financialTransaction.findUnique({
    where: { id },
    include: supportInclude,
  });

  if (
    !expense ||
    expense.tenantId !== tenantId ||
    expense.type !== "EXPENSE" ||
    expense.deletedAt
  ) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  return expense;
};

const buildListWhere = (
  tenantId: string,
  query: ListExpensesQuery,
): Prisma.FinancialTransactionWhereInput => {
  const where: Prisma.FinancialTransactionWhereInput = {
    tenantId,
    type: "EXPENSE",
    deletedAt: null,
  };

  if (query.year !== undefined && query.month !== undefined) {
    const start = new Date(Date.UTC(query.year, query.month - 1, 1));
    const end = new Date(Date.UTC(query.year, query.month, 1));
    where.occurredOn = { gte: start, lt: end };
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }
  if (query.vendorId) {
    where.vendorId = query.vendorId;
  }
  if (query.paymentMethod) {
    where.paymentMethod = query.paymentMethod;
  }

  const search = query.q?.trim();
  if (search) {
    where.notes = { contains: search, mode: "insensitive" };
  }

  return where;
};

const buildListOrderBy = (
  query: ListExpensesQuery,
): Prisma.FinancialTransactionOrderByWithRelationInput[] => {
  const dir = query.sortDir;
  if (query.sortBy === "amount") {
    return [{ amount: dir }, { createdAt: "desc" }];
  }
  if (query.sortBy === "createdAt") {
    return [{ createdAt: dir }];
  }
  return [{ occurredOn: dir }, { createdAt: "desc" }];
};

export const listExpenses = async (
  tenantId: string,
  query: ListExpensesQuery,
  role: UserRole,
) => {
  const where = buildListWhere(tenantId, query);
  const skip = (query.page - 1) * query.pageSize;

  const [rows, total, fields] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      include: supportInclude,
      orderBy: buildListOrderBy(query),
      skip,
      take: query.pageSize,
    }),
    prisma.financialTransaction.count({ where }),
    loadExpenseFields(tenantId),
  ]);

  const visibleFields = visibleFieldsForRole(fields, role);
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));

  return {
    expenses: rows.map((row) => toPublicExpense(row, visibleFields)),
    fields: visibleFields.map(toPublicField),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
      sortBy: query.sortBy,
      sortDir: query.sortDir,
    },
  };
};

export const getExpense = async (
  tenantId: string,
  id: string,
  role: UserRole,
) => {
  const [expense, fields] = await Promise.all([
    getExpenseForTenant(tenantId, id),
    loadExpenseFields(tenantId),
  ]);
  const visibleFields = visibleFieldsForRole(fields, role);
  return {
    expense: toPublicExpense(expense, visibleFields),
    fields: visibleFields.map(toPublicField),
  };
};

export const createExpense = async (
  tenantId: string,
  input: CreateExpenseInput,
  actorId: string,
) => {
  const fields = await loadExpenseFields(tenantId);
  const customValues = validateCustomValues(
    fields,
    input.customValues,
    {},
  );
  const supportIds = await resolveSupportIds(tenantId, input);

  const expense = await prisma.financialTransaction.create({
    data: {
      tenantId,
      type: "EXPENSE",
      occurredOn: parseDateOnly(input.occurredOn),
      amount: new Prisma.Decimal(input.amount),
      notes: input.notes?.trim() ? input.notes.trim() : null,
      paymentMethod: input.paymentMethod ?? null,
      customValues: customValues as Prisma.InputJsonValue,
      categoryId: supportIds.categoryId ?? null,
      departmentId: supportIds.departmentId ?? null,
      vendorId: supportIds.vendorId ?? null,
      createdById: actorId,
    },
    include: supportInclude,
  });

  const visibleFields = visibleFieldsForRole(fields, "COMPANY_ADMIN");
  const publicExpense = toPublicExpense(expense, visibleFields);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "CREATE",
    entityType: ENTITY_TYPE,
    entityId: expense.id,
    tenantId,
    newValues: publicExpense,
  });

  return { expense: publicExpense, fields: visibleFields.map(toPublicField) };
};

export const updateExpense = async (
  tenantId: string,
  id: string,
  input: UpdateExpenseInput,
  actorId: string,
) => {
  const [existing, fields] = await Promise.all([
    getExpenseForTenant(tenantId, id),
    loadExpenseFields(tenantId),
  ]);

  const customValues =
    input.customValues !== undefined
      ? validateCustomValues(
          fields,
          input.customValues,
          asRecord(existing.customValues),
        )
      : undefined;

  const supportIds = await resolveSupportIds(tenantId, {
    categoryId: input.categoryId,
    departmentId: input.departmentId,
    vendorId: input.vendorId,
  });

  const expense = await prisma.financialTransaction.update({
    where: { id },
    data: {
      ...(input.occurredOn !== undefined
        ? { occurredOn: parseDateOnly(input.occurredOn) }
        : {}),
      ...(input.amount !== undefined
        ? { amount: new Prisma.Decimal(input.amount) }
        : {}),
      ...(input.notes !== undefined
        ? { notes: input.notes?.trim() ? input.notes.trim() : null }
        : {}),
      ...(input.paymentMethod !== undefined
        ? { paymentMethod: input.paymentMethod }
        : {}),
      ...(customValues !== undefined
        ? { customValues: customValues as Prisma.InputJsonValue }
        : {}),
      ...(supportIds.categoryId !== undefined
        ? { categoryId: supportIds.categoryId }
        : {}),
      ...(supportIds.departmentId !== undefined
        ? { departmentId: supportIds.departmentId }
        : {}),
      ...(supportIds.vendorId !== undefined
        ? { vendorId: supportIds.vendorId }
        : {}),
    },
    include: supportInclude,
  });

  const visibleFields = visibleFieldsForRole(fields, "COMPANY_ADMIN");
  const publicExpense = toPublicExpense(expense, visibleFields);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "UPDATE",
    entityType: ENTITY_TYPE,
    entityId: expense.id,
    tenantId,
    oldValues: toPublicExpense(existing, visibleFields),
    newValues: publicExpense,
  });

  return { expense: publicExpense, fields: visibleFields.map(toPublicField) };
};

export const deleteExpense = async (
  tenantId: string,
  id: string,
  actorId: string,
) => {
  const existing = await getExpenseForTenant(tenantId, id);
  const fields = await loadExpenseFields(tenantId);
  const visibleFields = visibleFieldsForRole(fields, "COMPANY_ADMIN");

  await prisma.financialTransaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "DELETE",
    entityType: ENTITY_TYPE,
    entityId: existing.id,
    tenantId,
    oldValues: toPublicExpense(existing, visibleFields),
  });
};
