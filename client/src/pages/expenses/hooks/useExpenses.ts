import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../../lib/api";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseListResponse,
  UpdateExpensePayload,
} from "../../../lib/expenses";
import type { FieldDefinition } from "../../../lib/fields";

export const useExpenses = (
  enabled: boolean,
  year: number,
  month: number,
) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiFetch<ExpenseListResponse>(
      `/expenses?year=${year}&month=${month}`,
    );
    setExpenses(data.expenses);
    setFields(data.fields);
  }, [year, month]);

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
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  return {
    expenses,
    fields,
    loading,
    error,
    setError,
    refresh,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
