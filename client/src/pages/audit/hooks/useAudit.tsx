import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../../../lib/api";
import {
  DEFAULT_PAGE_SIZE,
  emptyPaginationMeta,
  type PaginationMeta,
} from "../../../lib/pagination";
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

export type AuditListFilters = {
  page: number;
  pageSize: number;
  action: "" | "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
};

export const defaultAuditListFilters = (): AuditListFilters => ({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  action: "",
  entityType: "",
  entityId: "",
});

export const auditQueryKeys = {
  all: ["audit"] as const,
  logs: (filters: AuditListFilters) =>
    [...auditQueryKeys.all, "logs", filters] as const,
};

const buildAuditLogsQuery = (filters: AuditListFilters) => {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });

  if (filters.action) {
    params.set("action", filters.action);
  }
  if (filters.entityType.trim()) {
    params.set("entityType", filters.entityType.trim());
  }
  if (filters.entityId.trim()) {
    params.set("entityId", filters.entityId.trim());
  }

  return `/audit/logs?${params.toString()}`;
};

const fetchAuditLogs = (filters: AuditListFilters) =>
  apiFetch<{ logs: AuditLogEntry[]; meta: PaginationMeta }>(
    buildAuditLogsQuery(filters),
  );

type AuditContextValue = {
  filters: AuditListFilters;
  patchFilters: (next: Partial<AuditListFilters>) => void;
  logs: AuditLogEntry[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<unknown>;
  selectedLog: AuditLogEntry | null;
  openLog: (log: AuditLogEntry) => void;
  closeLog: () => void;
};

const AuditContext = createContext<AuditContextValue | null>(null);

type AuditProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export const AuditProvider = ({ children, enabled }: AuditProviderProps) => {
  const [filters, setFilters] = useState(defaultAuditListFilters);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const logsQuery = useQuery({
    queryKey: auditQueryKeys.logs(filters),
    queryFn: () => fetchAuditLogs(filters),
    enabled,
  });

  const patchFilters = useCallback((next: Partial<AuditListFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

  const openLog = useCallback((log: AuditLogEntry) => {
    setSelectedLog(log);
  }, []);

  const closeLog = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const error = logsQuery.error
    ? toQueryErrorMessage(logsQuery.error, "Failed to load audit logs")
    : null;

  return (
    <AuditContext.Provider
      value={{
        filters,
        patchFilters,
        logs: logsQuery.data?.logs ?? [],
        meta: logsQuery.data?.meta ?? emptyPaginationMeta(filters.pageSize),
        loading: logsQuery.isPending,
        error,
        refresh: logsQuery.refetch,
        selectedLog,
        openLog,
        closeLog,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error("useAudit must be used within AuditProvider");
  }
  return ctx;
};
