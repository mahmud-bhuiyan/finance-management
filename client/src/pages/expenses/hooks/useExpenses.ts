import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseListFilters,
  ExpenseListMeta,
  ExpenseListResponse,
  UpdateExpensePayload,
} from "../../../lib/expenses";
import { buildExpenseListQuery } from "../../../lib/expenses";
import { toQueryErrorMessage } from "../../../lib/queryClient";

const defaultMeta = (filters: ExpenseListFilters): ExpenseListMeta => ({
  page: filters.page,
  pageSize: filters.pageSize,
  total: 0,
  totalPages: 1,
  sortBy: filters.sortBy,
  sortDir: filters.sortDir,
});

export const expenseQueryKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseQueryKeys.all, "list"] as const,
  list: (filters: ExpenseListFilters) =>
    [...expenseQueryKeys.lists(), filters] as const,
  attachments: (expenseId: string) =>
    [...expenseQueryKeys.all, "attachments", expenseId] as const,
};

const fetchExpenseList = (filters: ExpenseListFilters) =>
  apiFetch<ExpenseListResponse>(`/expenses?${buildExpenseListQuery(filters)}`);

export const useExpenses = (enabled: boolean, filters: ExpenseListFilters) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: expenseQueryKeys.list(filters),
    queryFn: () => fetchExpenseList(filters),
    enabled,
  });

  const invalidateLists = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.lists() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      apiFetch<{ expense: Expense }>("/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateLists,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpensePayload;
    }) =>
      apiFetch<{ expense: Expense }>(`/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateLists,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/expenses/${id}`, { method: "DELETE" }),
    onSuccess: invalidateLists,
  });

  const createExpense = async (payload: CreateExpensePayload) => {
    const data = await createMutation.mutateAsync(payload);
    return data.expense;
  };

  const updateExpense = async (id: string, payload: UpdateExpensePayload) => {
    const data = await updateMutation.mutateAsync({ id, payload });
    return data.expense;
  };

  const deleteExpense = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load expenses")
    : null;

  return {
    expenses: listQuery.data?.expenses ?? [],
    fields: listQuery.data?.fields ?? [],
    meta: listQuery.data?.meta ?? defaultMeta(filters),
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    refresh: listQuery.refetch,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
