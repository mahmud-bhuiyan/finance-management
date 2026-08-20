import type { UserRole } from "@prisma/client";
import { getPermissionsForRole } from "../config/permissions.js";

type RbacUser = {
  role: UserRole;
  tenantId: string | null;
};

export const getRbacProfile = (user: RbacUser) => ({
  role: user.role,
  tenantId: user.tenantId,
  permissions: getPermissionsForRole(user.role),
});

export const probeFinanceWrite = () => ({
  ok: true,
  access: "finance:write",
  message: "Finance write access granted",
});

export const probeReportsRead = () => ({
  ok: true,
  access: "reports:read",
  message: "Reports read access granted",
});

export const probeTenantsManage = () => ({
  ok: true,
  access: "tenants:manage",
  message: "Tenant management access granted",
});
