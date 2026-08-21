import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type { DashboardSummaryQuery } from "../validators/dashboardValidators.js";

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const money = (value: Prisma.Decimal | number | null | undefined) =>
  new Prisma.Decimal(value ?? 0).toFixed(2);

const startOfUtcMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex, 1));

const endOfUtcMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0));

const resolveRange = (query: DashboardSummaryQuery) => {
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

const inclusiveDayCount = (from: Date, to: Date) => {
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / 86_400_000) + 1;
};

const buildWhere = (
  tenantId: string,
  from: Date,
  to: Date,
  query: DashboardSummaryQuery,
  type: TransactionType,
): Prisma.FinancialTransactionWhereInput => ({
  tenantId,
  type,
  deletedAt: null,
  occurredOn: { gte: from, lte: to },
  ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  ...(query.departmentId ? { departmentId: query.departmentId } : {}),
  ...(query.vendorId ? { vendorId: query.vendorId } : {}),
});

export const getDashboardSummary = async (
  tenantId: string,
  query: DashboardSummaryQuery,
) => {
  const { from, to } = resolveRange(query);
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
    highest,
    byDay,
    byCategory,
    byVendor,
    categories,
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
    prisma.financialTransaction.findFirst({
      where: expenseWhere,
      orderBy: [{ amount: "desc" }, { occurredOn: "desc" }],
      select: {
        id: true,
        amount: true,
        occurredOn: true,
        notes: true,
      },
    }),
    prisma.financialTransaction.groupBy({
      by: ["occurredOn"],
      where: expenseWhere,
      _sum: { amount: true },
      orderBy: { occurredOn: "asc" },
    }),
    prisma.financialTransaction.groupBy({
      by: ["categoryId"],
      where: expenseWhere,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.financialTransaction.groupBy({
      by: ["vendorId"],
      where: expenseWhere,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.expenseCategory.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
    prisma.vendor.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
  ]);

  const categoryName = new Map(categories.map((row) => [row.id, row.name]));
  const vendorName = new Map(vendors.map((row) => [row.id, row.name]));

  const totalExpense = new Prisma.Decimal(expenseAgg._sum.amount ?? 0);
  const totalIncome = new Prisma.Decimal(incomeAgg._sum.amount ?? 0);
  const netBalance = totalIncome.minus(totalExpense);
  const days = inclusiveDayCount(from, to);
  const avgDailyExpense =
    days > 0 ? totalExpense.div(days) : new Prisma.Decimal(0);

  return {
    filters: {
      preset: query.preset,
      from: toDateOnly(from),
      to: toDateOnly(to),
      categoryId: query.categoryId ?? null,
      departmentId: query.departmentId ?? null,
      vendorId: query.vendorId ?? null,
    },
    kpis: {
      totalExpense: money(totalExpense),
      totalIncome: money(totalIncome),
      netBalance: money(netBalance),
      expenseCount: expenseAgg._count._all,
      incomeCount: incomeAgg._count._all,
      avgDailyExpense: money(avgDailyExpense),
      highestExpense: highest
        ? {
            id: highest.id,
            amount: money(highest.amount),
            occurredOn: toDateOnly(highest.occurredOn),
            notes: highest.notes,
          }
        : null,
    },
    charts: {
      expenseByDay: byDay.map((row) => ({
        date: toDateOnly(row.occurredOn),
        total: money(row._sum.amount),
      })),
      expenseByCategory: byCategory.map((row) => ({
        id: row.categoryId,
        name: row.categoryId
          ? (categoryName.get(row.categoryId) ?? "Unknown")
          : "Uncategorized",
        total: money(row._sum.amount),
      })),
      expenseByVendor: byVendor.map((row) => ({
        id: row.vendorId,
        name: row.vendorId
          ? (vendorName.get(row.vendorId) ?? "Unknown")
          : "No vendor",
        total: money(row._sum.amount),
      })),
    },
  };
};
