import type { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  TENANTS_MANAGE: "tenants:manage",
  FINANCE_WRITE: "finance:write",
  REPORTS_READ: "reports:read",
  USERS_MANAGE: "users:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPER_ADMIN: [PERMISSIONS.TENANTS_MANAGE],
  COMPANY_ADMIN: [
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_MANAGE,
  ],
  NORMAL_USER: [PERMISSIONS.REPORTS_READ],
};

export const getPermissionsForRole = (role: UserRole): Permission[] => [
  ...ROLE_PERMISSIONS[role],
];

export const roleHasPermission = (
  role: UserRole,
  permission: Permission,
): boolean => ROLE_PERMISSIONS[role].includes(permission);
