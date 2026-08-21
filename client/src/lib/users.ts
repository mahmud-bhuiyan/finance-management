import { apiFetch } from "./api";

export type TenantUserRole = "COMPANY_ADMIN" | "NORMAL_USER";
export type TenantUserStatus = "ACTIVE" | "INACTIVE";

export type TenantUser = {
  id: string;
  email: string;
  name: string | null;
  role: TenantUserRole | string;
  status: TenantUserStatus | string;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTenantUserPayload = {
  email: string;
  password: string;
  name?: string;
  role: TenantUserRole;
};

export type UpdateTenantUserPayload = {
  name?: string | null;
  role?: TenantUserRole;
  status?: TenantUserStatus;
};

export const listTenantUsers = () =>
  apiFetch<{ ok: boolean; users: TenantUser[] }>("/users");

export const createTenantUser = (payload: CreateTenantUserPayload) =>
  apiFetch<{ ok: boolean; user: TenantUser }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateTenantUser = (
  id: string,
  payload: UpdateTenantUserPayload,
) =>
  apiFetch<{ ok: boolean; user: TenantUser }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const tenantUserRoleLabel = (role: string) => {
  switch (role) {
    case "COMPANY_ADMIN":
      return "Company admin";
    case "NORMAL_USER":
      return "Normal user";
    default:
      return role;
  }
};
