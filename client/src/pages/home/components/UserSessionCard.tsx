import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import type { AuthUser } from "../../../hooks/useAuth";
import { roleCan, PERMISSIONS } from "../../../lib/permissions";

type UserSessionCardProps = {
  user: AuthUser;
  onLogout: () => void;
};

export const UserSessionCard = ({ user, onLogout }: UserSessionCardProps) => {
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const canManageTenants = roleCan(user.role, PERMISSIONS.TENANTS_MANAGE);
  const canWriteFinance = roleCan(user.role, PERMISSIONS.FINANCE_WRITE);
  const canReadReports = roleCan(user.role, PERMISSIONS.REPORTS_READ);
  const canViewExpenses =
    !!user.tenant && (canWriteFinance || canReadReports);
  const canReadAudit = roleCan(user.role, PERMISSIONS.AUDIT_READ);
  const canManageFields = roleCan(user.role, PERMISSIONS.FIELDS_MANAGE);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-medium text-slate-900">Current user</h2>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>
          Email: <span className="font-medium text-teal-800">{user.email}</span>
        </li>
        <li>Name: {user.name ?? "—"}</li>
        <li>Role: {user.role}</li>
        <li>Company: {user.tenant?.name ?? "—"}</li>
        <li>User id: {user.id}</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" onClick={onLogout}>
          Sign out
        </Button>
        <Link
          to="/access"
          className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
        >
          Role & access
        </Link>
        {canManageFields && (
          <Link
            to="/fields"
            className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
          >
            Custom fields
          </Link>
        )}
        {canViewExpenses && (
          <Link
            to="/expenses"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Expenses
          </Link>
        )}
        {canWriteFinance && user.tenant && (
          <Link
            to="/expense-support"
            className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100"
          >
            Categories & vendors
          </Link>
        )}
        {canReadAudit && (
          <Link
            to="/audit"
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-100"
          >
            Audit trail
          </Link>
        )}
        {canManageTenants && (
          <Link
            to="/tenants"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Manage companies
          </Link>
        )}
        {!canWriteFinance && canReadReports && (
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700">
            Read-only reports access
          </span>
        )}
        {isSuperAdmin && (
          <span className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-900">
            Platform admin
          </span>
        )}
        <Link
          to="/login"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Login page
        </Link>
      </div>
    </section>
  );
};
