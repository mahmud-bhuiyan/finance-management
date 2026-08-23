import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export type AuditLogEntry = {
  id: string;
  tenantId: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
};

export const auditQueryKeys = {
  all: ["audit"] as const,
  logs: () => [...auditQueryKeys.all, "logs"] as const,
};

const fetchAuditLogs = () =>
  apiFetch<{ logs: AuditLogEntry[] }>("/audit/logs?limit=50").then(
    (data) => data.logs,
  );

export const useAuditLogs = (enabled: boolean) => {
  const logsQuery = useQuery({
    queryKey: auditQueryKeys.logs(),
    queryFn: fetchAuditLogs,
    enabled,
  });

  const error = logsQuery.error
    ? toQueryErrorMessage(logsQuery.error, "Failed to load audit logs")
    : null;

  return {
    logs: logsQuery.data ?? [],
    loading: logsQuery.isPending,
    error,
    refresh: logsQuery.refetch,
  };
};
