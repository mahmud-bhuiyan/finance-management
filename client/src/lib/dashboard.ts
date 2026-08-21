import { apiFetch } from "./api";
import type { PaymentMethod } from "./paymentMethods";

export type DashboardPreset =
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_30_days"
  | "custom";

export type DashboardFilters = {
  preset: DashboardPreset;
  from: string;
  to: string;
  categoryId: string;
  departmentId: string;
  vendorId: string;
  paymentMethod: string;
};

export type DashboardKpis = {
  totalExpense: string;
  totalIncome: string;
  netBalance: string;
  expenseCount: number;
  incomeCount: number;
  avgDailyExpense: string;
  highestExpense: {
    id: string;
    amount: string;
    occurredOn: string;
    notes: string | null;
  } | null;
};

export type ChartSlice = {
  id: string | null;
  name: string;
  total: string;
};

export type DashboardSummary = {
  ok: boolean;
  filters: {
    preset: DashboardPreset;
    from: string;
    to: string;
    categoryId: string | null;
    departmentId: string | null;
    vendorId: string | null;
    paymentMethod: PaymentMethod | null;
  };
  kpis: DashboardKpis;
  charts: {
    expenseByDay: { date: string; total: string }[];
    expenseByCategory: ChartSlice[];
    expenseByDepartment: ChartSlice[];
    expenseByVendor: ChartSlice[];
    expenseByPaymentMethod: ChartSlice[];
    expenseByMonth: { month: string; total: string }[];
    incomeVsExpenseByMonth: {
      month: string;
      expense: string;
      income: string;
    }[];
    expenseStackedByMonthCategory: {
      month: string;
      categoryId: string | null;
      categoryName: string;
      total: string;
    }[];
  };
};

export type DashboardQuery = {
  preset: DashboardPreset;
  from?: string;
  to?: string;
  categoryId?: string;
  departmentId?: string;
  vendorId?: string;
  paymentMethod?: string;
};

const buildQuery = (query: DashboardQuery) => {
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
  return params.toString();
};

export const fetchDashboardSummary = (query: DashboardQuery) =>
  apiFetch<DashboardSummary>(`/dashboard/summary?${buildQuery(query)}`);

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
