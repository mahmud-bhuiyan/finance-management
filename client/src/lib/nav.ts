import type { AuthUser } from "../hooks/useAuth";
import { PERMISSIONS, roleCan } from "./permissions";

export type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const hasTenant = (user: AuthUser) => !!user.tenant;

const canReadFinance = (user: AuthUser) =>
  hasTenant(user) &&
  (roleCan(user.role, PERMISSIONS.FINANCE_WRITE) ||
    roleCan(user.role, PERMISSIONS.REPORTS_READ));

export const navSectionsForUser = (user: AuthUser): NavSection[] => {
  const sections: NavSection[] = [
    {
      id: "overview",
      label: "Overview",
      items: [{ to: "/", label: "Home", end: true }],
    },
  ];

  if (canReadFinance(user)) {
    sections.push({
      id: "finance",
      label: "Finance",
      items: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/reports", label: "Reports" },
        { to: "/expenses", label: "Expenses" },
        { to: "/incomes", label: "Income" },
      ],
    });
  }

  const setup: NavItem[] = [];
  if (roleCan(user.role, PERMISSIONS.FINANCE_WRITE) && hasTenant(user)) {
    setup.push({ to: "/expense-support", label: "Categories & vendors" });
  }
  if (roleCan(user.role, PERMISSIONS.FIELDS_MANAGE)) {
    setup.push({ to: "/fields", label: "Custom fields" });
  }
  if (roleCan(user.role, PERMISSIONS.USERS_MANAGE) && hasTenant(user)) {
    setup.push({ to: "/users", label: "Users" });
  }
  if (setup.length > 0) {
    sections.push({ id: "setup", label: "Setup", items: setup });
  }

  const platform: NavItem[] = [];
  if (roleCan(user.role, PERMISSIONS.TENANTS_MANAGE)) {
    platform.push({ to: "/tenants", label: "Companies" });
  }
  if (roleCan(user.role, PERMISSIONS.AUDIT_READ)) {
    platform.push({ to: "/audit", label: "Audit trail" });
  }
  platform.push({ to: "/access", label: "Role & access" });
  sections.push({ id: "platform", label: "Account", items: platform });

  return sections;
};
