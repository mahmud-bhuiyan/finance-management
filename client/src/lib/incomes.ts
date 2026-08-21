import type { FieldDefinition } from "./fields";
import type { PaymentMethod } from "./paymentMethods";
import type { SupportRef } from "./supportData";

export type Income = {
  id: string;
  tenantId: string;
  type: "INCOME";
  occurredOn: string;
  amount: string;
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  customValues: Record<string, unknown>;
  categoryId: string | null;
  departmentId: string | null;
  vendorId: string | null;
  category: SupportRef | null;
  department: SupportRef | null;
  vendor: SupportRef | null;
  attachmentCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomeAttachment = {
  id: string;
  tenantId: string;
  transactionId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdById: string;
  createdAt: string;
};

export type CreateIncomePayload = {
  occurredOn: string;
  amount: string;
  notes?: string;
  paymentMethod?: PaymentMethod | null;
  customValues?: Record<string, unknown>;
  categoryId?: string | null;
  departmentId?: string | null;
  vendorId?: string | null;
};

export type UpdateIncomePayload = {
  occurredOn?: string;
  amount?: string;
  notes?: string | null;
  paymentMethod?: PaymentMethod | null;
  customValues?: Record<string, unknown>;
  categoryId?: string | null;
  departmentId?: string | null;
  vendorId?: string | null;
};

export type IncomeListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: "occurredOn" | "amount" | "createdAt";
  sortDir: "asc" | "desc";
};

export type IncomeListFilters = {
  year: number;
  month: number;
  q: string;
  categoryId: string;
  departmentId: string;
  vendorId: string;
  paymentMethod: string;
  page: number;
  pageSize: number;
  sortBy: IncomeListMeta["sortBy"];
  sortDir: IncomeListMeta["sortDir"];
};

export type IncomeListResponse = {
  ok: boolean;
  incomes: Income[];
  fields: FieldDefinition[];
  meta: IncomeListMeta;
};

export const formatIncomeAmount = (amount: string) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return amount;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const currentYearMonth = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const monthLabel = (month: number) =>
  new Date(2000, month - 1, 1).toLocaleString(undefined, { month: "long" });

export const buildIncomeListQuery = (filters: IncomeListFilters) => {
  const params = new URLSearchParams({
    year: String(filters.year),
    month: String(filters.month),
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }
  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }
  if (filters.vendorId) {
    params.set("vendorId", filters.vendorId);
  }
  if (filters.paymentMethod) {
    params.set("paymentMethod", filters.paymentMethod);
  }

  return params.toString();
};
