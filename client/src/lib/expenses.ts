import type { FieldDefinition } from "./fields";
import type { SupportRef } from "./supportData";

export type Expense = {
  id: string;
  tenantId: string;
  type: "EXPENSE";
  occurredOn: string;
  amount: string;
  notes: string | null;
  customValues: Record<string, unknown>;
  categoryId: string | null;
  departmentId: string | null;
  vendorId: string | null;
  category: SupportRef | null;
  department: SupportRef | null;
  vendor: SupportRef | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpensePayload = {
  occurredOn: string;
  amount: string;
  notes?: string;
  customValues?: Record<string, unknown>;
  categoryId?: string | null;
  departmentId?: string | null;
  vendorId?: string | null;
};

export type UpdateExpensePayload = {
  occurredOn?: string;
  amount?: string;
  notes?: string | null;
  customValues?: Record<string, unknown>;
  categoryId?: string | null;
  departmentId?: string | null;
  vendorId?: string | null;
};

export type ExpenseListResponse = {
  ok: boolean;
  expenses: Expense[];
  fields: FieldDefinition[];
};

export const formatExpenseAmount = (amount: string) => {
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
