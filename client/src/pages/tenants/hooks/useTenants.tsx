import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  type TenantListFilters,
  type TenantListMeta,
  type TenantSortBy,
  type TenantSortDir,
  fetchTenantList,
  tenantQueryKeys,
} from "../lib/tenantApi";
import { useTenantMutations } from "./useTenantMutations";

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

const defaultMeta = (
  status: Tenant["status"],
  listState: TenantListState,
): TenantListMeta => ({
  page: listState.page,
  pageSize: listState.pageSize,
  total: 0,
  totalPages: 1,
  sortBy: listState.sortBy,
  sortDir: listState.sortDir,
  status,
});

type TenantsContextValue = {
  status: Tenant["status"];
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

  const listFilters = useMemo<TenantListFilters>(
    () => ({
      status,
      search: listState.search,
      page: listState.page,
      pageSize: listState.pageSize,
      sortBy: listState.sortBy,
      sortDir: listState.sortDir,
    }),
    [status, listState],
  );

  const listQuery = useQuery({
    queryKey: tenantQueryKeys.list(listFilters),
    queryFn: () => fetchTenantList(listFilters),
    enabled,
    placeholderData: keepPreviousData,
  });

  const pageRows = listQuery.data?.tenants ?? [];

  const meta = useMemo<PaginationMeta>(() => {
    const responseMeta =
      listQuery.data?.meta ?? defaultMeta(status, listState);

    return {
      page: responseMeta.page,
      pageSize: responseMeta.pageSize,
      total: responseMeta.total,
      totalPages: responseMeta.totalPages,
    };
  }, [listQuery.data?.meta, listState, status]);

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
        pageRows,
        meta,
        listState,
        patchListState,
        loading: listQuery.isPending && !listQuery.data,
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

export type { TenantSortBy, TenantSortDir };
export type { Tenant, TenantAdmin, TenantConfirmAction } from "../lib/tenantApi";
