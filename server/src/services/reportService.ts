import {
  FieldTarget,
  Prisma,
  TransactionType,
  type FieldDefinition,
  type UserRole,
} from "@prisma/client";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../config/prisma.js";
import { paymentMethodLabel } from "../constants/paymentMethods.js";
import { toCsv } from "../utils/csv.js";
import type {
  ReportExportQuery,
  ReportSummaryQuery,
} from "../validators/reportValidators.js";

const EXPORT_ROW_LIMIT = 5_000;
const PDF_TX_PREVIEW_LIMIT = 40;

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

type ExportCell = string | number | null;

type ReportExportDataset = {
  from: Date;
  to: Date;
  headers: string[];
  dataRows: ExportCell[][];
  reportFields: FieldDefinition[];
  rowCount: number;
  totalMatching: number;
  truncated: boolean;
};

const loadReportExportDataset = async (
  tenantId: string,
  role: UserRole,
  query: ReportExportQuery,
): Promise<ReportExportDataset> => {
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
      take: EXPORT_ROW_LIMIT,
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
  const headers = [...baseHeaders, ...reportFields.map((field) => field.key)];

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
    ] satisfies ExportCell[];
  });

  return {
    from,
    to,
    headers,
    dataRows,
    reportFields,
    rowCount: rows.length,
    totalMatching,
    truncated: totalMatching > rows.length,
  };
};

const exportFilename = (from: Date, to: Date, ext: string) =>
  `fms-report-${toDateOnly(from)}_to_${toDateOnly(to)}.${ext}`;

const exportMeta = (dataset: ReportExportDataset) => ({
  rowCount: dataset.rowCount,
  truncated: dataset.truncated,
  totalMatching: dataset.totalMatching,
  limit: EXPORT_ROW_LIMIT,
  customFieldKeys: dataset.reportFields.map((field) => field.key),
});

export const buildReportCsv = async (
  tenantId: string,
  role: UserRole,
  query: ReportExportQuery,
) => {
  const dataset = await loadReportExportDataset(tenantId, role, query);
  return {
    csv: toCsv(dataset.headers, dataset.dataRows),
    filename: exportFilename(dataset.from, dataset.to, "csv"),
    meta: exportMeta(dataset),
  };
};

export const buildReportExcel = async (
  tenantId: string,
  role: UserRole,
  query: ReportExportQuery,
) => {
  const dataset = await loadReportExportDataset(tenantId, role, query);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FMS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Transactions", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.addRow(dataset.headers);
  sheet.getRow(1).font = { bold: true };
  for (const row of dataset.dataRows) {
    sheet.addRow(row);
  }
  sheet.columns.forEach((column) => {
    let max = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const length = String(cell.value ?? "").length;
      if (length > max) max = Math.min(length, 40);
    });
    column.width = max + 2;
  });

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return {
    buffer,
    filename: exportFilename(dataset.from, dataset.to, "xlsx"),
    meta: exportMeta(dataset),
  };
};

const pdfLine = (doc: PDFKit.PDFDocument, label: string, value: string) => {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value);
};

const pdfSectionTitle = (doc: PDFKit.PDFDocument, title: string) => {
  doc.moveDown(0.8);
  doc.fontSize(13).font("Helvetica-Bold").text(title);
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica");
};

const pdfEnsureSpace = (doc: PDFKit.PDFDocument, needed = 72) => {
  if (doc.y > doc.page.height - doc.page.margins.bottom - needed) {
    doc.addPage();
  }
};

export const buildReportPdf = async (
  tenantId: string,
  role: UserRole,
  query: ReportExportQuery,
) => {
  const [summary, dataset] = await Promise.all([
    getReportSummary(tenantId, query),
    loadReportExportDataset(tenantId, role, query),
  ]);

  const doc = new PDFDocument({ margin: 48, size: "LETTER" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const fromLabel = toDateOnly(dataset.from);
  const toLabel = toDateOnly(dataset.to);

  doc.fontSize(18).font("Helvetica-Bold").text("FMS Report");
  doc.moveDown(0.4);
  doc.fontSize(10).font("Helvetica");
  pdfLine(doc, "Period", `${fromLabel} → ${toLabel}`);
  pdfLine(doc, "Preset", summary.filters.preset);
  pdfLine(doc, "Type filter", query.type);
  if (summary.filters.categoryId) {
    pdfLine(doc, "Category filter", summary.filters.categoryId);
  }
  if (summary.filters.departmentId) {
    pdfLine(doc, "Department filter", summary.filters.departmentId);
  }
  if (summary.filters.vendorId) {
    pdfLine(doc, "Vendor filter", summary.filters.vendorId);
  }
  if (summary.filters.paymentMethod) {
    pdfLine(
      doc,
      "Payment method",
      paymentMethodLabel(summary.filters.paymentMethod),
    );
  }

  pdfSectionTitle(doc, "Summary");
  pdfLine(doc, "Total expense", summary.summary.totalExpense);
  pdfLine(doc, "Total income", summary.summary.totalIncome);
  pdfLine(doc, "Net balance", summary.summary.netBalance);
  pdfLine(doc, "Expense count", String(summary.summary.expenseCount));
  pdfLine(doc, "Income count", String(summary.summary.incomeCount));

  const writeBreakdown = (
    title: string,
    rows: { name: string; total: string; count: number }[],
  ) => {
    pdfEnsureSpace(doc, 90);
    pdfSectionTitle(doc, title);
    if (rows.length === 0) {
      doc.text("No rows.");
      return;
    }
    for (const row of rows) {
      pdfEnsureSpace(doc, 28);
      doc.text(`${row.name} — ${row.total} (${row.count})`);
    }
  };

  pdfEnsureSpace(doc, 90);
  pdfSectionTitle(doc, "By month");
  if (summary.byMonth.length === 0) {
    doc.text("No rows.");
  } else {
    for (const row of summary.byMonth) {
      pdfEnsureSpace(doc, 28);
      doc.text(
        `${row.month}: expense ${row.expense}, income ${row.income}, net ${row.net}`,
      );
    }
  }

  writeBreakdown("By category (expenses)", summary.byCategory);
  writeBreakdown("By department (expenses)", summary.byDepartment);
  writeBreakdown("By vendor (expenses)", summary.byVendor);
  writeBreakdown("By payment method (expenses)", summary.byPaymentMethod);

  pdfEnsureSpace(doc, 90);
  pdfSectionTitle(doc, "Transactions (preview)");
  const preview = dataset.dataRows.slice(0, PDF_TX_PREVIEW_LIMIT);
  if (preview.length === 0) {
    doc.text("No matching transactions.");
  } else {
    doc.text(
      `Showing ${preview.length} of ${dataset.totalMatching} matching row(s)` +
        (dataset.truncated ? ` (export cap ${EXPORT_ROW_LIMIT})` : "") +
        ".",
    );
    doc.moveDown(0.3);
    for (const row of preview) {
      pdfEnsureSpace(doc, 36);
      const type = String(row[1] ?? "");
      const occurredOn = String(row[2] ?? "");
      const amount = String(row[3] ?? "");
      const notes = String(row[4] ?? "").slice(0, 80);
      const category = String(row[6] ?? "");
      doc.text(
        `${occurredOn}  ${type}  ${amount}  ${category}${notes ? ` — ${notes}` : ""}`,
      );
    }
  }

  doc.end();
  const buffer = await done;
  return {
    buffer,
    filename: exportFilename(dataset.from, dataset.to, "pdf"),
    meta: exportMeta(dataset),
  };
};
