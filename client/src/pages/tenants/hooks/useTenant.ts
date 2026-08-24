import { useQuery } from "@tanstack/react-query";
import { fetchTenant, tenantQueryKeys } from "../lib/tenantApi";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export const useTenant = (tenantId: string | undefined) => {
  const detailQuery = useQuery({
    queryKey: tenantQueryKeys.detail(tenantId ?? ""),
    queryFn: () => fetchTenant(tenantId!),
    enabled: !!tenantId,
  });

  const tenant = detailQuery.data;
  const loading = detailQuery.isPending;
  const notFound = !loading && tenantId && !tenant;
  const error = detailQuery.error
    ? toQueryErrorMessage(detailQuery.error, "Failed to load company")
    : null;

  return { tenant, loading, notFound, error };
};
