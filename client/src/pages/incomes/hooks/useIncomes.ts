import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { FieldDefinition } from "../../../lib/fields";
import type {
  CreateIncomePayload,
  Income,
  IncomeListFilters,
  IncomeListMeta,
  IncomeListResponse,
  UpdateIncomePayload,
} from "../../../lib/incomes";
import { buildIncomeListQuery } from "../../../lib/incomes";
import { toQueryErrorMessage } from "../../../lib/queryClient";

const defaultMeta = (filters: IncomeListFilters): IncomeListMeta => ({
  page: filters.page,
  pageSize: filters.pageSize,
  total: 0,
  totalPages: 1,
  sortBy: filters.sortBy,
  sortDir: filters.sortDir,
});

export const incomeQueryKeys = {
  all: ["incomes"] as const,
  lists: () => [...incomeQueryKeys.all, "list"] as const,
  list: (filters: IncomeListFilters) =>
    [...incomeQueryKeys.lists(), filters] as const,
  attachments: (incomeId: string) =>
    [...incomeQueryKeys.all, "attachments", incomeId] as const,
};

const fetchIncomeList = (filters: IncomeListFilters) =>
  apiFetch<IncomeListResponse>(`/incomes?${buildIncomeListQuery(filters)}`);

export const useIncomes = (enabled: boolean, filters: IncomeListFilters) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: incomeQueryKeys.list(filters),
    queryFn: () => fetchIncomeList(filters),
    enabled,
  });

  const invalidateLists = useCallback(
    () => queryClient.invalidateQueries({ queryKey: incomeQueryKeys.lists() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateIncomePayload) =>
      apiFetch<{ income: Income }>("/incomes", {
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
      payload: UpdateIncomePayload;
    }) =>
      apiFetch<{ income: Income }>(`/incomes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateLists,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/incomes/${id}`, { method: "DELETE" }),
    onSuccess: invalidateLists,
  });

  const createIncome = async (payload: CreateIncomePayload) => {
    const data = await createMutation.mutateAsync(payload);
    return data.income;
  };

  const updateIncome = async (id: string, payload: UpdateIncomePayload) => {
    const data = await updateMutation.mutateAsync({ id, payload });
    return data.income;
  };

  const deleteIncome = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load incomes")
    : null;

  return {
    incomes: listQuery.data?.incomes ?? [],
    fields: (listQuery.data?.fields ?? []) as FieldDefinition[],
    meta: listQuery.data?.meta ?? defaultMeta(filters),
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    refresh: listQuery.refetch,
    createIncome,
    updateIncome,
    deleteIncome,
  };
};
