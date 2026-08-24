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

export const tenantQueryKeys = {
  all: ["tenants"] as const,
  list: () => [...tenantQueryKeys.all, "list"] as const,
};

export const fetchTenants = () =>
  apiFetch<{ tenants: Tenant[] }>("/tenants").then((data) => data.tenants);
