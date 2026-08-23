import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type {
  CreateFieldPayload,
  FieldDefinition,
  FieldTarget,
  UpdateFieldPayload,
} from "../../../lib/fields";
import { sortFields } from "../../../lib/fields";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export const fieldQueryKeys = {
  all: ["fields"] as const,
  lists: () => [...fieldQueryKeys.all, "list"] as const,
  list: (target: FieldTarget) => [...fieldQueryKeys.lists(), target] as const,
};

const fetchFieldDefinitions = (target: FieldTarget) =>
  apiFetch<{ fields: FieldDefinition[] }>(`/fields?target=${target}`).then(
    (data) => sortFields(data.fields),
  );

export const useFieldDefinitions = (enabled: boolean, target: FieldTarget) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: fieldQueryKeys.list(target),
    queryFn: () => fetchFieldDefinitions(target),
    enabled,
  });

  const invalidateLists = useCallback(
    () => queryClient.invalidateQueries({ queryKey: fieldQueryKeys.lists() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateFieldPayload) =>
      apiFetch<{ field: FieldDefinition }>("/fields", {
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
      payload: UpdateFieldPayload;
    }) =>
      apiFetch<{ field: FieldDefinition }>(`/fields/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidateLists,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/fields/${id}`, { method: "DELETE" }),
    onSuccess: invalidateLists,
  });

  const createField = async (payload: CreateFieldPayload) => {
    const data = await createMutation.mutateAsync(payload);
    return data.field;
  };

  const updateField = async (id: string, payload: UpdateFieldPayload) => {
    const data = await updateMutation.mutateAsync({ id, payload });
    return data.field;
  };

  const deleteField = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const moveField = async (id: string, direction: "up" | "down") => {
    const fields = listQuery.data ?? [];
    const index = fields.findIndex((field) => field.id === id);
    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= fields.length) {
      return;
    }

    const current = fields[index];
    const swap = fields[swapIndex];

    await updateField(current.id, { sortOrder: swap.sortOrder });
    await updateField(swap.id, { sortOrder: current.sortOrder });
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load fields")
    : null;

  return {
    fields: listQuery.data ?? [],
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    refresh: listQuery.refetch,
    createField,
    updateField,
    deleteField,
    moveField,
  };
};
