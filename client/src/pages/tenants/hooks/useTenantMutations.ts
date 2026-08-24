import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiFetch } from "../../../lib/api";
import {
  type Tenant,
  type TenantAdmin,
  tenantQueryKeys,
} from "../lib/tenantApi";

export const useTenantMutations = () => {
  const queryClient = useQueryClient();

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

  const updateTenantMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; slug?: string; status?: Tenant["status"] };
    }) =>
      apiFetch<{ tenant: Tenant }>(`/tenants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: invalidateList,
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deleted: boolean }>(`/tenants/${id}`, {
        method: "DELETE",
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

  const updateTenantName = async (id: string, name: string) => {
    const data = await updateTenantMutation.mutateAsync({
      id,
      body: { name },
    });
    return data.tenant;
  };

  const updateTenantSlug = async (id: string, slug: string) => {
    const data = await updateTenantMutation.mutateAsync({
      id,
      body: { slug },
    });
    return data.tenant;
  };

  const updateTenantStatus = async (id: string, status: Tenant["status"]) => {
    await updateTenantMutation.mutateAsync({ id, body: { status } });
  };

  const deleteTenant = async (id: string) => {
    await deleteTenantMutation.mutateAsync(id);
  };

  const createAdmin = async (
    tenantId: string,
    input: { email: string; password: string; name?: string },
  ) => {
    await createAdminMutation.mutateAsync({ tenantId, input });
  };

  return {
    createTenant,
    updateTenantName,
    updateTenantSlug,
    updateTenantStatus,
    deleteTenant,
    createAdmin,
    isCreating: createTenantMutation.isPending,
    isUpdating: updateTenantMutation.isPending,
    isDeleting: deleteTenantMutation.isPending,
    isCreatingAdmin: createAdminMutation.isPending,
  };
};
