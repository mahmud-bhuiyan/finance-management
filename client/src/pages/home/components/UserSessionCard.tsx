import type { AuthUser } from "../../../hooks/useAuth";
import { roleLabel } from "../../../lib/permissions";

type UserSessionCardProps = {
  user: AuthUser;
};

export const UserSessionCard = ({ user }: UserSessionCardProps) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-3 text-lg font-medium text-slate-900">Current session</h2>
    <ul className="space-y-2 text-sm text-slate-700">
      <li>
        Email: <span className="font-medium text-teal-800">{user.email}</span>
      </li>
      <li>Name: {user.name ?? "—"}</li>
      <li>Role: {roleLabel(user.role)}</li>
      <li>Company: {user.tenant?.name ?? "Platform (no company)"}</li>
      <li>User id: {user.id}</li>
    </ul>
  </section>
);
