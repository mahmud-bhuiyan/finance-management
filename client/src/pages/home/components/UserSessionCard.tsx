import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import type { AuthUser } from "../../../hooks/useAuth";

type UserSessionCardProps = {
  user: AuthUser;
  onLogout: () => void;
};

export const UserSessionCard = ({ user, onLogout }: UserSessionCardProps) => {
  const isSuperAdmin = user.role === "SUPER_ADMIN";

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
        {isSuperAdmin && (
          <Link
            to="/tenants"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Manage companies
          </Link>
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
