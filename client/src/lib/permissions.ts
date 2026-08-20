export const PERMISSIONS = {
  TENANTS_MANAGE: "tenants:manage",
  FINANCE_WRITE: "finance:write",
  REPORTS_READ: "reports:read",
  USERS_MANAGE: "users:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  SUPER_ADMIN: [PERMISSIONS.TENANTS_MANAGE],
  COMPANY_ADMIN: [
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.USERS_MANAGE,
  ],
  NORMAL_USER: [PERMISSIONS.REPORTS_READ],
};

export const permissionsForRole = (role: string): Permission[] => [
  ...(ROLE_PERMISSIONS[role] ?? []),
];

export const roleCan = (role: string, permission: Permission) =>
  permissionsForRole(role).includes(permission);

export const roleLabel = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "COMPANY_ADMIN":
      return "Company Admin / Finance";
    case "NORMAL_USER":
      return "Normal User";
    default:
      return role;
  }
};
