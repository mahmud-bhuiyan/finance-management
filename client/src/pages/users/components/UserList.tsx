import { Button } from "../../../components/ui/Button";
import {
  tenantUserRoleLabel,
  type TenantUser,
  type TenantUserRole,
  type TenantUserStatus,
} from "../../../lib/users";

type UserListProps = {
  users: TenantUser[];
  currentUserId: string;
  busyId: string | null;
  onChangeRole: (id: string, role: TenantUserRole) => void;
  onChangeStatus: (id: string, status: TenantUserStatus) => void;
};

export const UserList = ({
  users,
  currentUserId,
  busyId,
  onChangeRole,
  onChangeStatus,
}: UserListProps) => {
  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        No users in this company yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const busy = busyId === user.id;
            const isActive = user.status === "ACTIVE";

            return (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.email}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {isSelf ? (
                    tenantUserRoleLabel(user.role)
                  ) : (
                    <select
                      value={
                        user.role === "COMPANY_ADMIN"
                          ? "COMPANY_ADMIN"
                          : "NORMAL_USER"
                      }
                      disabled={busy}
                      onChange={(event) =>
                        onChangeRole(
                          user.id,
                          event.target.value as TenantUserRole,
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none ring-teal-700/30 focus:ring-2"
                    >
                      <option value="NORMAL_USER">Normal user</option>
                      <option value="COMPANY_ADMIN">Company admin</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isActive
                        ? "rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    }
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isSelf ? (
                    <span className="text-xs text-slate-500">—</span>
                  ) : (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        onChangeStatus(
                          user.id,
                          isActive ? "INACTIVE" : "ACTIVE",
                        )
                      }
                    >
                      {busy
                        ? "…"
                        : isActive
                          ? "Deactivate"
                          : "Reactivate"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
