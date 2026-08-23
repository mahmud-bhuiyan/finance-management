import { apiDownloadBlob, apiFetch } from "./api";
import type { PaymentMethod } from "./paymentMethods";

export type ReportPreset =
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_30_days"
  | "custom";

export type ReportFilters = {
  preset: ReportPreset;
  from: string;
  to: string;
  categoryId: string;
  departmentId: string;
  vendorId: string;
  paymentMethod: string;
  type: "ALL" | "EXPENSE" | "INCOME";
};

export type ReportSlice = {
  id: string | null;
  name: string;
  total: string;
  count: number;
};

export type ReportSummary = {
  filters: {
    preset: ReportPreset;
    from: string;
    to: string;
    categoryId: string | null;
    departmentId: string | null;
    vendorId: string | null;
    paymentMethod: PaymentMethod | null;
  };
  summary: {
    totalExpense: string;
    totalIncome: string;
    netBalance: string;
    expenseCount: number;
    incomeCount: number;
  };
  byMonth: {
    month: string;
    expense: string;
    income: string;
    net: string;
  }[];
  byCategory: ReportSlice[];
  byDepartment: ReportSlice[];
  byVendor: ReportSlice[];
  byPaymentMethod: ReportSlice[];
};

export type ReportQuery = {
  preset: ReportPreset;
  from?: string;
  to?: string;
  categoryId?: string;
  departmentId?: string;
  vendorId?: string;
  paymentMethod?: string;
  type?: "ALL" | "EXPENSE" | "INCOME";
};

const buildQuery = (query: ReportQuery) => {
  const params = new URLSearchParams();
  params.set("preset", query.preset);
  if (query.preset === "custom") {
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
  }
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.departmentId) params.set("departmentId", query.departmentId);
  if (query.vendorId) params.set("vendorId", query.vendorId);
  if (query.paymentMethod) params.set("paymentMethod", query.paymentMethod);
  if (query.type && query.type !== "ALL") params.set("type", query.type);
  return params.toString();
};

const downloadFilename = (query: ReportQuery, ext: string) => {
  const from = query.from ?? query.preset;
  const to = query.to ?? "";
  return `fms-report-${from}${to ? `_to_${to}` : ""}.${ext}`;
};

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const fetchReportSummary = (query: ReportQuery) =>
  apiFetch<ReportSummary>(`/reports/summary?${buildQuery(query)}`);

export const downloadReportCsv = async (query: ReportQuery) => {
  const blob = await apiDownloadBlob(`/reports/export.csv?${buildQuery(query)}`);
  triggerBlobDownload(blob, downloadFilename(query, "csv"));
};

export const downloadReportExcel = async (query: ReportQuery) => {
  const blob = await apiDownloadBlob(
    `/reports/export.xlsx?${buildQuery(query)}`,
  );
  triggerBlobDownload(blob, downloadFilename(query, "xlsx"));
};

export const downloadReportPdf = async (query: ReportQuery) => {
  const blob = await apiDownloadBlob(`/reports/export.pdf?${buildQuery(query)}`);
  triggerBlobDownload(blob, downloadFilename(query, "pdf"));
};

export const formatMoney = (value: string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numeric);
};
