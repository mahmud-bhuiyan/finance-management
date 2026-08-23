import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export type RbacProfile = {
  role: string;
  tenantId: string | null;
  permissions: string[];
};

export const rbacQueryKeys = {
  all: ["rbac"] as const,
  me: () => [...rbacQueryKeys.all, "me"] as const,
};

const fetchRbacProfile = () =>
  apiFetch<{ rbac: RbacProfile }>("/rbac/me").then((data) => data.rbac);

export const useRbacProfile = (enabled: boolean) => {
  const profileQuery = useQuery({
    queryKey: rbacQueryKeys.me(),
    queryFn: fetchRbacProfile,
    enabled,
  });

  const error = profileQuery.error
    ? toQueryErrorMessage(profileQuery.error, "Failed to load access")
    : null;

  return {
    profile: profileQuery.data ?? null,
    loading: profileQuery.isPending,
    error,
    refresh: profileQuery.refetch,
  };
};

export const probeAccess = (path: string) =>
  apiFetch<{ access: string; message: string }>(path);
