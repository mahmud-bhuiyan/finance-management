import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PAGE_SIZE, type PaginationMeta } from "../../../lib/pagination";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import {
  type Tenant,
  type TenantConfirmAction,
  fetchTenants,
  tenantQueryKeys,
} from "../lib/tenantApi";
import { useTenantMutations } from "./useTenantMutations";

export type TenantSortBy = "name" | "slug" | "admins";
export type TenantSortDir = "asc" | "desc";

export type TenantListState = {
  page: number;
  pageSize: number;
  search: string;
  sortBy: TenantSortBy;
  sortDir: TenantSortDir;
};

export const defaultTenantListState = (): TenantListState => ({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  sortBy: "name",
  sortDir: "asc",
});

const sortTenants = (
  tenants: Tenant[],
  sortBy: TenantSortBy,
  sortDir: TenantSortDir,
) => {
  const factor = sortDir === "asc" ? 1 : -1;

  return [...tenants].sort((left, right) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = left.name.localeCompare(right.name);
        break;
      case "slug":
        comparison = left.slug.localeCompare(right.slug);
        break;
      case "admins":
        comparison = left.admins.length - right.admins.length;
        break;
    }

    return comparison * factor;
  });
};

const matchesTenantSearch = (tenant: Tenant, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    tenant.name.toLowerCase().includes(normalized) ||
    tenant.slug.toLowerCase().includes(normalized) ||
    tenant.status.toLowerCase().includes(normalized) ||
    tenant.admins.some(
      (admin) =>
        admin.email.toLowerCase().includes(normalized) ||
        (admin.name?.toLowerCase().includes(normalized) ?? false),
    )
  );
};

type TenantsContextValue = {
  status: Tenant["status"];
  tenants: Tenant[];
  pageRows: Tenant[];
  meta: PaginationMeta;
  listState: TenantListState;
  patchListState: (next: Partial<TenantListState>) => void;
  loading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  confirmAction: { action: TenantConfirmAction; tenant: Tenant } | null;
  openConfirm: (action: TenantConfirmAction, tenant: Tenant) => void;
  closeConfirm: () => void;
  updateTenantStatus: (id: string, status: Tenant["status"]) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
};

const TenantsContext = createContext<TenantsContextValue | null>(null);

type TenantsProviderProps = {
  children: ReactNode;
  enabled: boolean;
  status: Tenant["status"];
};

export const TenantsProvider = ({
  children,
  enabled,
  status,
}: TenantsProviderProps) => {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [listState, setListState] = useState(defaultTenantListState);
  const [confirmAction, setConfirmAction] = useState<{
    action: TenantConfirmAction;
    tenant: Tenant;
  } | null>(null);

  const {
    updateTenantStatus,
    deleteTenant,
    isUpdating,
    isDeleting,
  } = useTenantMutations();

  const listQuery = useQuery({
    queryKey: tenantQueryKeys.list(),
    queryFn: fetchTenants,
    enabled,
  });

  const tenants = listQuery.data ?? [];

  const filteredTenants = useMemo(
    () =>
      tenants.filter(
        (tenant) =>
          tenant.status === status &&
          matchesTenantSearch(tenant, listState.search),
      ),
    [status, tenants, listState.search],
  );

  const sortedTenants = useMemo(
    () =>
      sortTenants(filteredTenants, listState.sortBy, listState.sortDir),
    [filteredTenants, listState.sortBy, listState.sortDir],
  );

  const meta = useMemo(() => {
    const total = sortedTenants.length;
    const totalPages = Math.max(1, Math.ceil(total / listState.pageSize));
    const page = Math.min(listState.page, totalPages);

    return {
      page,
      pageSize: listState.pageSize,
      total,
      totalPages,
    };
  }, [sortedTenants.length, listState.page, listState.pageSize]);

  const pageRows = useMemo(() => {
    const start = (meta.page - 1) * meta.pageSize;
    return sortedTenants.slice(start, start + meta.pageSize);
  }, [sortedTenants, meta.page, meta.pageSize]);

  const patchListState = useCallback((next: Partial<TenantListState>) => {
    setListState((current) => ({ ...current, ...next }));
  }, []);

  const openConfirm = useCallback(
    (action: TenantConfirmAction, tenant: Tenant) => {
      setConfirmAction({ action, tenant });
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setConfirmAction(null);
  }, []);

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load companies")
    : null;

  return (
    <TenantsContext.Provider
      value={{
        status,
        tenants,
        pageRows,
        meta,
        listState,
        patchListState,
        loading: listQuery.isPending,
        error: mutationError ?? queryError,
        setError: setMutationError,
        confirmAction,
        openConfirm,
        closeConfirm,
        updateTenantStatus,
        deleteTenant,
        isUpdating,
        isDeleting,
      }}
    >
      {children}
    </TenantsContext.Provider>
  );
};

export const useTenants = () => {
  const ctx = useContext(TenantsContext);
  if (!ctx) {
    throw new Error("useTenants must be used within TenantsProvider");
  }
  return ctx;
};

// Re-export types for convenience
export type { Tenant, TenantAdmin, TenantConfirmAction } from "../lib/tenantApi";
