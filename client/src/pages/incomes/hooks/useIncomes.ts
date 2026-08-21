import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch, apiUpload } from "../../../lib/api";
import type {
  CreateIncomePayload,
  Income,
  IncomeAttachment,
  IncomeListFilters,
  IncomeListMeta,
  IncomeListResponse,
  UpdateIncomePayload,
} from "../../../lib/incomes";
import { buildIncomeListQuery } from "../../../lib/incomes";
import type { FieldDefinition } from "../../../lib/fields";

const defaultMeta = (filters: IncomeListFilters): IncomeListMeta => ({
  page: filters.page,
  pageSize: filters.pageSize,
  total: 0,
  totalPages: 1,
  sortBy: filters.sortBy,
  sortDir: filters.sortDir,
});

export const useIncomes = (enabled: boolean, filters: IncomeListFilters) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [meta, setMeta] = useState<IncomeListMeta>(() => defaultMeta(filters));
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiFetch<IncomeListResponse>(
      `/incomes?${buildIncomeListQuery(filters)}`,
    );
    setIncomes(data.incomes);
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
          err instanceof ApiError ? err.message : "Failed to load incomes",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, refresh]);

  const createIncome = async (payload: CreateIncomePayload) => {
    const data = await apiFetch<{ ok: boolean; income: Income }>(
      "/incomes",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    await refresh();
    return data.income;
  };

  const updateIncome = async (id: string, payload: UpdateIncomePayload) => {
    const data = await apiFetch<{ ok: boolean; income: Income }>(
      `/incomes/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    await refresh();
    return data.income;
  };

  const deleteIncome = async (id: string) => {
    await apiFetch<{ ok: boolean }>(`/incomes/${id}`, { method: "DELETE" });
    await refresh();
  };

  const listAttachments = useCallback(async (incomeId: string) => {
    const data = await apiFetch<{
      ok: boolean;
      attachments: IncomeAttachment[];
    }>(`/incomes/${incomeId}/attachments`);
    return data.attachments;
  }, []);

  const uploadAttachment = useCallback(
    async (incomeId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiUpload<{
        ok: boolean;
        attachment: IncomeAttachment;
      }>(`/incomes/${incomeId}/attachments`, formData);
      await refresh();
      return data.attachment;
    },
    [refresh],
  );

  const deleteAttachment = useCallback(
    async (incomeId: string, attachmentId: string) => {
      await apiFetch<{ ok: boolean }>(
        `/incomes/${incomeId}/attachments/${attachmentId}`,
        { method: "DELETE" },
      );
      await refresh();
    },
    [refresh],
  );

  return {
    incomes,
    fields,
    meta,
    loading,
    error,
    setError,
    refresh,
    createIncome,
    updateIncome,
    deleteIncome,
    listAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
