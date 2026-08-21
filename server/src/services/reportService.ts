import {
  FieldTarget,
  Prisma,
  TransactionType,
  type FieldDefinition,
  type UserRole,
} from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { paymentMethodLabel } from "../constants/paymentMethods.js";
import { toCsv } from "../utils/csv.js";
import type {
  ReportExportQuery,
  ReportSummaryQuery,
} from "../validators/reportValidators.js";

const CSV_ROW_LIMIT = 5_000;

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const toMonthKey = (value: Date) => toDateOnly(value).slice(0, 7);

const money = (value: Prisma.Decimal | number | null | undefined) =>
  new Prisma.Decimal(value ?? 0).toFixed(2);

const startOfUtcMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex, 1));

const endOfUtcMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0));

/** Shared date-range resolver for reports (and dashboard-compatible presets). */
export const resolveReportRange = (query: ReportSummaryQuery) => {
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();

  switch (query.preset) {
    case "last_month": {
      const last = m === 0 ? 11 : m - 1;
      const year = m === 0 ? y - 1 : y;
      return {
        from: startOfUtcMonth(year, last),
        to: endOfUtcMonth(year, last),
      };
    }
    case "this_year":
      return {
        from: startOfUtcMonth(y, 0),
        to: new Date(Date.UTC(y, m, today.getUTCDate())),
      };
    case "last_30_days": {
      const to = new Date(Date.UTC(y, m, today.getUTCDate()));
      const from = new Date(to);
      from.setUTCDate(from.getUTCDate() - 29);
      return { from, to };
    }
    case "custom":
      return {
        from: parseDateOnly(query.from!),
        to: parseDateOnly(query.to!),
      };
    case "this_month":
    default:
      return {
        from: startOfUtcMonth(y, m),
        to: new Date(Date.UTC(y, m, today.getUTCDate())),
      };
  }
};

const buildWhere = (
  tenantId: string,
  from: Date,
  to: Date,
  query: ReportSummaryQuery,
  type?: TransactionType,
): Prisma.FinancialTransactionWhereInput => ({
  tenantId,
  deletedAt: null,
  occurredOn: { gte: from, lte: to },
  ...(type ? { type } : {}),
  ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.vendorId ? { vendorId: query.vendorId } : {}),
  ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {}),
});

const rollupByMonth = (
  rows: { occurredOn: Date; _sum: { amount: Prisma.Decimal | null } }[],
) => {
  const totals = new Map<string, Prisma.Decimal>();
  for (const row of rows) {
    const key = toMonthKey(row.occurredOn);
    const amount = new Prisma.Decimal(row._sum.amount ?? 0);
    totals.set(key, (totals.get(key) ?? new Prisma.Decimal(0)).plus(amount));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: money(total) }));
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const reportFieldsForRole = (fields: FieldDefinition[], role: UserRole) =>
  fields.filter(
    (field) =>
      field.enabled &&
      field.showInReports &&
      (role !== "NORMAL_USER" || field.visibleToNormalUser),
  );

const formatCustomValue = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
};

export const getReportSummary = async (
  tenantId: string,
  query: ReportSummaryQuery,
) => {
  const { from, to } = resolveReportRange(query);
  const expenseWhere = buildWhere(
    tenantId,
    from,
    to,
    query,
    TransactionType.EXPENSE,
  );
  const incomeWhere = buildWhere(
    tenantId,
    from,
    to,
    query,
    TransactionType.INCOME,
  );

  const [
    expenseAgg,
    incomeAgg,
    expenseByDay,
    incomeByDay,
    byCategory,
    byDepartment,
    byVendor,
    byPaymentMethod,
    categories,
    departments,
    vendors,
  ] = await Promise.all([
    prisma.financialTransaction.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.financialTransaction.aggregate({
      where: incomeWhere,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.financialTransaction.groupBy({
      by: ["occurredOn"],
      where: expenseWhere,
      _sum: { amount: true },
      orderBy: { occurredOn: "asc" },
    }),
    prisma.financialTransaction.groupBy({
      by: ["occurredOn"],
      where: incomeWhere,
      _sum: { amount: true },
      orderBy: { occurredOn: "asc" },
    }),
    prisma.financialTransaction.groupBy({
      by: ["categoryId"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.financialTransaction.groupBy({
      by: ["departmentId"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.financialTransaction.groupBy({
      by: ["vendorId"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.financialTransaction.groupBy({
      by: ["paymentMethod"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.expenseCategory.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
    prisma.department.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
    prisma.vendor.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
  ]);

  const categoryName = new Map(categories.map((row) => [row.id, row.name]));
  const departmentName = new Map(departments.map((row) => [row.id, row.name]));
  const vendorName = new Map(vendors.map((row) => [row.id, row.name]));

  const totalExpense = new Prisma.Decimal(expenseAgg._sum.amount ?? 0);
  const totalIncome = new Prisma.Decimal(incomeAgg._sum.amount ?? 0);
  const netBalance = totalIncome.minus(totalExpense);

  const expenseByMonth = rollupByMonth(expenseByDay);
  const incomeByMonth = rollupByMonth(incomeByDay);
  const monthKeys = [
    ...new Set([
      ...expenseByMonth.map((row) => row.month),
      ...incomeByMonth.map((row) => row.month),
    ]),
  ].sort();
  const expenseMonthMap = new Map(
    expenseByMonth.map((row) => [row.month, row.total]),
  );
  const incomeMonthMap = new Map(
    incomeByMonth.map((row) => [row.month, row.total]),
  );

  return {
    filters: {
      preset: query.preset,
      from: toDateOnly(from),
      to: toDateOnly(to),
      categoryId: query.categoryId ?? null,
      departmentId: query.departmentId ?? null,
      vendorId: query.vendorId ?? null,
      paymentMethod: query.paymentMethod ?? null,
    },
    summary: {
      totalExpense: money(totalExpense),
      totalIncome: money(totalIncome),
      netBalance: money(netBalance),
      expenseCount: expenseAgg._count._all,
      incomeCount: incomeAgg._count._all,
    },
    byMonth: monthKeys.map((month) => ({
      month,
      expense: expenseMonthMap.get(month) ?? "0.00",
      income: incomeMonthMap.get(month) ?? "0.00",
      net: money(
        new Prisma.Decimal(incomeMonthMap.get(month) ?? 0).minus(
          expenseMonthMap.get(month) ?? 0,
        ),
      ),
    })),
    byCategory: byCategory.map((row) => ({
      id: row.categoryId,
      name: row.categoryId
        ? (categoryName.get(row.categoryId) ?? "Unknown")
        : "Uncategorized",
      total: money(row._sum.amount),
      count: row._count._all,
    })),
    byDepartment: byDepartment.map((row) => ({
      id: row.departmentId,
      name: row.departmentId
        ? (departmentName.get(row.departmentId) ?? "Unknown")
        : "No department",
      total: money(row._sum.amount),
      count: row._count._all,
    })),
    byVendor: byVendor.map((row) => ({
      id: row.vendorId,
      name: row.vendorId
        ? (vendorName.get(row.vendorId) ?? "Unknown")
        : "No vendor",
      total: money(row._sum.amount),
      count: row._count._all,
    })),
    byPaymentMethod: byPaymentMethod.map((row) => ({
      id: row.paymentMethod,
      name: paymentMethodLabel(row.paymentMethod),
      total: money(row._sum.amount),
      count: row._count._all,
    })),
  };
};

export const buildReportCsv = async (
  tenantId: string,
  role: UserRole,
  query: ReportExportQuery,
) => {
  const { from, to } = resolveReportRange(query);
  const typeFilter =
    query.type === "ALL"
      ? undefined
      : query.type === "INCOME"
        ? TransactionType.INCOME
        : TransactionType.EXPENSE;
  const where = buildWhere(tenantId, from, to, query, typeFilter);

  const [fields, rows, totalMatching] = await Promise.all([
    prisma.fieldDefinition.findMany({
      where: { tenantId, target: FieldTarget.EXPENSE },
      orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    }),
    prisma.financialTransaction.findMany({
      where,
      orderBy: [{ occurredOn: "asc" }, { createdAt: "asc" }],
      take: CSV_ROW_LIMIT,
      include: {
        category: { select: { name: true } },
        department: { select: { name: true } },
        vendor: { select: { name: true } },
      },
    }),
    prisma.financialTransaction.count({ where }),
  ]);

  const reportFields = reportFieldsForRole(fields, role);
  const baseHeaders = [
    "id",
    "type",
    "occurredOn",
    "amount",
    "notes",
    "paymentMethod",
    "category",
    "department",
    "vendor",
  ];
  const customHeaders = reportFields.map((field) => field.key);
  const headers = [...baseHeaders, ...customHeaders];

  const dataRows = rows.map((row) => {
    const custom = asRecord(row.customValues);
    return [
      row.id,
      row.type,
      toDateOnly(row.occurredOn),
      money(row.amount),
      row.notes,
      row.paymentMethod,
      row.category?.name ?? "",
      row.department?.name ?? "",
      row.vendor?.name ?? "",
      ...reportFields.map((field) => formatCustomValue(custom[field.key])),
    ];
  });

  const csv = toCsv(headers, dataRows);
  const fromLabel = toDateOnly(from);
  const toLabel = toDateOnly(to);
  const filename = `fms-report-${fromLabel}_to_${toLabel}.csv`;

  return {
    csv,
    filename,
    meta: {
      rowCount: rows.length,
      truncated: totalMatching > rows.length,
      totalMatching,
      limit: CSV_ROW_LIMIT,
      customFieldKeys: reportFields.map((field) => field.key),
    },
  };
};
