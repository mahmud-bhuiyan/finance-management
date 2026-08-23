import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import { supportDataQueryKeys } from "../../../lib/supportQueryKeys";
import {
  createSupportItem,
  deleteSupportItem,
  listSupportItems,
  updateSupportItem,
  type CreateSupportPayload,
  type SupportKind,
  type UpdateSupportPayload,
} from "../../../lib/supportData";

export { supportDataQueryKeys };

export const useSupportData = (enabled: boolean, kind: SupportKind) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const listOptions = { includeInactive: true } as const;

  const listQuery = useQuery({
    queryKey: supportDataQueryKeys.list(kind, listOptions),
    queryFn: () => listSupportItems(kind, listOptions),
    enabled,
  });

  const invalidateLists = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: supportDataQueryKeys.lists() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupportPayload) =>
      createSupportItem(kind, payload),
    onSuccess: invalidateLists,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSupportPayload;
    }) => updateSupportItem(kind, id, payload),
    onSuccess: invalidateLists,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupportItem(kind, id),
    onSuccess: invalidateLists,
  });

  const createItem = async (payload: CreateSupportPayload) => {
    return createMutation.mutateAsync(payload);
  };

  const updateItem = async (id: string, payload: UpdateSupportPayload) => {
    return updateMutation.mutateAsync({ id, payload });
  };

  const removeItem = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load items")
    : null;

  return {
    items: listQuery.data ?? [],
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    refresh: listQuery.refetch,
    createItem,
    updateItem,
    removeItem,
  };
};
