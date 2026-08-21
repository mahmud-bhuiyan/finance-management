import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch, apiUpload } from "../../../lib/api";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseAttachment,
  ExpenseListFilters,
  ExpenseListMeta,
  ExpenseListResponse,
  UpdateExpensePayload,
} from "../../../lib/expenses";
import { buildExpenseListQuery } from "../../../lib/expenses";
import type { FieldDefinition } from "../../../lib/fields";

const defaultMeta = (filters: ExpenseListFilters): ExpenseListMeta => ({
  page: filters.page,
  pageSize: filters.pageSize,
  total: 0,
  totalPages: 1,
  sortBy: filters.sortBy,
  sortDir: filters.sortDir,
});

export const useExpenses = (enabled: boolean, filters: ExpenseListFilters) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [meta, setMeta] = useState<ExpenseListMeta>(() => defaultMeta(filters));
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiFetch<ExpenseListResponse>(
      `/expenses?${buildExpenseListQuery(filters)}`,
    );
    setExpenses(data.expenses);
    setFields(data.fields);
    setMeta(data.meta);
  }, [filters]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void (async () => {
      try {
        setError(null);
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load expenses",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, refresh]);

  const createExpense = async (payload: CreateExpensePayload) => {
    const data = await apiFetch<{ ok: boolean; expense: Expense }>(
      "/expenses",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    await refresh();
    return data.expense;
  };

  const updateExpense = async (id: string, payload: UpdateExpensePayload) => {
    const data = await apiFetch<{ ok: boolean; expense: Expense }>(
      `/expenses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    await refresh();
    return data.expense;
  };

  const deleteExpense = async (id: string) => {
    await apiFetch<{ ok: boolean }>(`/expenses/${id}`, { method: "DELETE" });
    await refresh();
  };

  const listAttachments = useCallback(async (expenseId: string) => {
    const data = await apiFetch<{
      ok: boolean;
      attachments: ExpenseAttachment[];
    }>(`/expenses/${expenseId}/attachments`);
    return data.attachments;
  }, []);

  const uploadAttachment = useCallback(
    async (expenseId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiUpload<{
        ok: boolean;
        attachment: ExpenseAttachment;
      }>(`/expenses/${expenseId}/attachments`, formData);
      await refresh();
      return data.attachment;
    },
    [refresh],
  );

  const deleteAttachment = useCallback(
    async (expenseId: string, attachmentId: string) => {
      await apiFetch<{ ok: boolean }>(
        `/expenses/${expenseId}/attachments/${attachmentId}`,
        { method: "DELETE" },
      );
      await refresh();
    },
    [refresh],
  );

  return {
    expenses,
    fields,
    meta,
    loading,
    error,
    setError,
    refresh,
    createExpense,
    updateExpense,
    deleteExpense,
    listAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
