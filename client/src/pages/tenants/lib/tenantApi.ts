import { apiFetch } from "../../../lib/api";

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

export type TenantSortBy = "name" | "slug" | "admins" | "createdAt";
export type TenantSortDir = "asc" | "desc";

export type TenantListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: TenantSortBy;
  sortDir: TenantSortDir;
  status?: Tenant["status"];
  q?: string;
};

export type TenantListFilters = {
  status: Tenant["status"];
  search: string;
  page: number;
  pageSize: number;
  sortBy: TenantSortBy;
  sortDir: TenantSortDir;
};

export type TenantListResponse = {
  tenants: Tenant[];
  meta: TenantListMeta;
};

export const tenantQueryKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantQueryKeys.all, "list"] as const,
  list: (filters: TenantListFilters) =>
    [...tenantQueryKeys.lists(), filters] as const,
  details: () => [...tenantQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...tenantQueryKeys.details(), id] as const,
};

export const buildTenantListQuery = (filters: TenantListFilters) => {
  const params = new URLSearchParams({
    status: filters.status,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  return params.toString();
};

export const fetchTenantList = (filters: TenantListFilters) =>
  apiFetch<TenantListResponse>(`/tenants?${buildTenantListQuery(filters)}`);

export const fetchTenant = (id: string) =>
  apiFetch<{ tenant: Tenant }>(`/tenants/${id}`).then((data) => data.tenant);
