import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import {
  createTenantUser,
  listTenantUsers,
  updateTenantUser,
  type CreateTenantUserPayload,
  type UpdateTenantUserPayload,
} from "../../../lib/users";

export const tenantUserQueryKeys = {
  all: ["tenant-users"] as const,
  list: () => [...tenantUserQueryKeys.all, "list"] as const,
};

export const useTenantUsers = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: tenantUserQueryKeys.list(),
    queryFn: () => listTenantUsers().then((data) => data.users),
    enabled,
  });

  const invalidateList = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: tenantUserQueryKeys.list() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateTenantUserPayload) => createTenantUser(payload),
    onSuccess: invalidateList,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTenantUserPayload;
    }) => updateTenantUser(id, payload),
    onSuccess: invalidateList,
  });

  const createUser = async (payload: CreateTenantUserPayload) => {
    const data = await createMutation.mutateAsync(payload);
    return data.user;
  };

  const updateUser = async (id: string, payload: UpdateTenantUserPayload) => {
    const data = await updateMutation.mutateAsync({ id, payload });
    return data.user;
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Could not load users")
    : null;

  return {
    users: listQuery.data ?? [],
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    refresh: listQuery.refetch,
    createUser,
    updateUser,
  };
};
