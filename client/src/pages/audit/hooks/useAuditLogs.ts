import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

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

export const useAuditLogs = (enabled: boolean) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ logs: AuditLogEntry[] }>(
        "/audit/logs?limit=50",
      );
      setLogs(data.logs);
    } catch (err) {
      setLogs([]);
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { logs, loading, error, refresh };
};
