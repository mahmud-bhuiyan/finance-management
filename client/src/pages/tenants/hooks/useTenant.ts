import { useQuery } from "@tanstack/react-query";
import { fetchTenants, tenantQueryKeys } from "../lib/tenantApi";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export const useTenant = (tenantId: string | undefined) => {
  const listQuery = useQuery({
    queryKey: tenantQueryKeys.list(),
    queryFn: fetchTenants,
    enabled: !!tenantId,
  });

  const tenant = tenantId
    ? listQuery.data?.find((item) => item.id === tenantId)
    : undefined;

  const loading = listQuery.isPending;
  const notFound = !loading && tenantId && !tenant;
  const error = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load company")
    : null;

  return { tenant, loading, notFound, error };
};
