export const TENANT_LIST_PATHS = {
  active: "/tenants/active",
  inactive: "/tenants/inactive",
} as const;

export const tenantListPathForStatus = (status: "ACTIVE" | "INACTIVE") =>
  status === "INACTIVE" ? TENANT_LIST_PATHS.inactive : TENANT_LIST_PATHS.active;
