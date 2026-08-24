import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../../../lib/api";
import {
  DEFAULT_PAGE_SIZE,
  type PaginationMeta,
} from "../../../lib/pagination";
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

export type TenantConfirmAction = "deactivate" | "activate" | "delete";

export type TenantListState = {
  page: number;
  pageSize: number;
};

export const defaultTenantListState = (): TenantListState => ({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
});

export const tenantQueryKeys = {
  all: ["tenants"] as const,
  list: () => [...tenantQueryKeys.all, "list"] as const,
};

const fetchTenants = () =>
  apiFetch<{ tenants: Tenant[] }>("/tenants").then((data) => data.tenants);

type TenantsContextValue = {
  tenants: Tenant[];
  pageRows: Tenant[];
  meta: PaginationMeta;
  listState: TenantListState;
  patchListState: (next: Partial<TenantListState>) => void;
  loading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
  editTenant: Tenant | null;
  openEdit: (tenant: Tenant) => void;
  closeEdit: () => void;
  confirmAction: { action: TenantConfirmAction; tenant: Tenant } | null;
  openConfirm: (action: TenantConfirmAction, tenant: Tenant) => void;
  closeConfirm: () => void;
  createTenant: (name: string) => Promise<Tenant>;
  updateTenantName: (id: string, name: string) => Promise<Tenant>;
  updateTenantStatus: (id: string, status: Tenant["status"]) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  createAdmin: (
    tenantId: string,
    input: { email: string; password: string; name?: string },
  ) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreatingAdmin: boolean;
};

const TenantsContext = createContext<TenantsContextValue | null>(null);

type TenantsProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export const TenantsProvider = ({ children, enabled }: TenantsProviderProps) => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [listState, setListState] = useState(defaultTenantListState);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    action: TenantConfirmAction;
    tenant: Tenant;
  } | null>(null);

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

  const updateTenantMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { name?: string; status?: Tenant["status"] };
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

  const tenants = listQuery.data ?? [];

  useEffect(() => {
    if (!editTenant) {
      return;
    }

    const fresh = tenants.find((tenant) => tenant.id === editTenant.id);
    if (fresh) {
      setEditTenant(fresh);
    } else {
      setEditTenant(null);
    }
  }, [tenants, editTenant?.id]);

  const meta = useMemo(() => {
    const total = tenants.length;
    const totalPages = Math.max(1, Math.ceil(total / listState.pageSize));
    const page = Math.min(listState.page, totalPages);

    return {
      page,
      pageSize: listState.pageSize,
      total,
      totalPages,
    };
  }, [tenants.length, listState.page, listState.pageSize]);

  const pageRows = useMemo(() => {
    const start = (meta.page - 1) * meta.pageSize;
    return tenants.slice(start, start + meta.pageSize);
  }, [tenants, meta.page, meta.pageSize]);

  const patchListState = useCallback((next: Partial<TenantListState>) => {
    setListState((current) => ({ ...current, ...next }));
  }, []);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const openEdit = useCallback((tenant: Tenant) => {
    setEditTenant(tenant);
  }, []);

  const closeEdit = useCallback(() => {
    setEditTenant(null);
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

  const queryError = listQuery.error
    ? toQueryErrorMessage(listQuery.error, "Failed to load companies")
    : null;

  return (
    <TenantsContext.Provider
      value={{
        tenants,
        pageRows,
        meta,
        listState,
        patchListState,
        loading: listQuery.isPending,
        error: mutationError ?? queryError,
        setError: setMutationError,
        createOpen,
        openCreate,
        closeCreate,
        editTenant,
        openEdit,
        closeEdit,
        confirmAction,
        openConfirm,
        closeConfirm,
        createTenant,
        updateTenantName,
        updateTenantStatus,
        deleteTenant,
        createAdmin,
        isCreating: createTenantMutation.isPending,
        isUpdating: updateTenantMutation.isPending,
        isDeleting: deleteTenantMutation.isPending,
        isCreatingAdmin: createAdminMutation.isPending,
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
