import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import type { AuthUser } from "../../../hooks/useAuth";

type UserSessionCardProps = {
  user: AuthUser;
  onLogout: () => void;
};

export const UserSessionCard = ({ user, onLogout }: UserSessionCardProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-medium text-slate-900">Current user</h2>
      <ul className="space-y-2 text-sm text-slate-700">
        <li>
          Email: <span className="font-medium text-teal-800">{user.email}</span>
        </li>
        <li>Name: {user.name ?? "—"}</li>
        <li>Role: {user.role}</li>
        <li>User id: {user.id}</li>
      </ul>
      <div className="mt-4 flex gap-3">
        <Button type="button" onClick={onLogout}>
          Sign out
        </Button>
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
