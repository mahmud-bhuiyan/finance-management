import { env } from "./env.js";

export type DemoUserPublic = {
  email: string;
  label: string;
  description: string;
  role: "SUPER_ADMIN" | "COMPANY_ADMIN" | "NORMAL_USER";
};

export const DEMO_TENANT_SLUG = "demo-company";
export const DEMO_TENANT_NAME = "Demo Company";
export const DEMO_ADMIN_EMAIL = "demo-admin@fms.com";
export const DEMO_MANAGER_EMAIL = "demo-manager@fms.com";
export const DEMO_MEMBER_EMAIL = "demo-member@fms.com";

export const isDemoModeEnabled = () => env.DEMO_MODE;

export const getDemoPassword = () => {
  const password = env.DEMO_PASSWORD?.trim();
  if (!password || password.length < 8) {
    return null;
  }
  return password;
};

export const isDemoEmail = (email: string) => {
  if (!isDemoModeEnabled()) {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  const superAdminEmail = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

  return (
    normalized === superAdminEmail ||
    normalized === DEMO_ADMIN_EMAIL ||
    normalized === DEMO_MANAGER_EMAIL ||
    normalized === DEMO_MEMBER_EMAIL
  );
};

export const listDemoUsers = (): DemoUserPublic[] => {
  if (!isDemoModeEnabled() || !getDemoPassword()) {
    return [];
  }

  const superAdminEmail = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const users: DemoUserPublic[] = [];

  if (superAdminEmail) {
    users.push({
      email: superAdminEmail,
      label: "Superadmin",
      description: "Manage companies and platform settings",
      role: "SUPER_ADMIN",
    });
  }

  users.push(
    {
      email: DEMO_ADMIN_EMAIL,
      label: "Company Admin",
      description: "Full access within Demo Company",
      role: "COMPANY_ADMIN",
    },
    {
      email: DEMO_MANAGER_EMAIL,
      label: "Manager",
      description: "Reports access within Demo Company",
      role: "NORMAL_USER",
    },
    {
      email: DEMO_MEMBER_EMAIL,
      label: "Member",
      description: "Standard user in Demo Company",
      role: "NORMAL_USER",
    },
  );

  return users;
};
