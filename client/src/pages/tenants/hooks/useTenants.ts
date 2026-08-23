import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export type TenantAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string | null;
  createdAt: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  admins: TenantAdmin[];
};

export const tenantQueryKeys = {
  all: ["tenants"] as const,
  list: () => [...tenantQueryKeys.all, "list"] as const,
};

const fetchTenants = () =>
  apiFetch<{ tenants: Tenant[] }>("/tenants").then((data) => data.tenants);

export const useTenants = (enabled: boolean) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: tenantQueryKeys.list(),
    queryFn: fetchTenants,
    enabled,
  });

  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: tenantQueryKeys.list() }),
    [queryClient],
  );

  const createTenantMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ tenant: Tenant }>("/tenants", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: invalidateList,
  });

  const updateTenantStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Tenant["status"];
    }) =>
      apiFetch<{ tenant: Tenant }>(`/tenants/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: invalidateList,
  });

  const createAdminMutation = useMutation({
    mutationFn: ({
      tenantId,
      input,
    }: {
      tenantId: string;
      input: { email: string; password: string; name?: string };
    }) =>
      apiFetch<{ admin: TenantAdmin }>(`/tenants/${tenantId}/admins`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: invalidateList,
  });

  const createTenant = async (name: string) => {
    const data = await createTenantMutation.mutateAsync(name);
    return data.tenant;
  };

  const updateTenantStatus = async (id: string, status: Tenant["status"]) => {
    await updateTenantStatusMutation.mutateAsync({ id, status });
  };

  const createAdmin = async (
    tenantId: string,
    input: { email: string; password: string; name?: string },
  ) => {
    await createAdminMutation.mutateAsync({ tenantId, input });
  };

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load companies")
    : null;

  return {
    tenants: listQuery.data ?? [],
    loading: listQuery.isPending,
    error: mutationError ?? queryError,
    setError: setMutationError,
    createTenant,
    updateTenantStatus,
    createAdmin,
  };
};
