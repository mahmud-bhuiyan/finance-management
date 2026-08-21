import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { permissionsForRole, roleLabel } from "../../lib/permissions";
import { AccessProbeCard } from "./components/AccessProbeCard";
import { useRbacProfile } from "./hooks/useRbacProfile";

export const AccessPage = () => {
  const { user, loading: authLoading } = useAuth();
  const rbac = useRbacProfile(!authLoading && !!user);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permissions = rbac.profile?.permissions ?? permissionsForRole(user.role);

  return (
    <PageFrame maxWidth="max-w-3xl">
      <PageHeader
        kicker="Account"
        title="Role & access"
        description="RBAC maps roles to permissions and enforces them on the server."
      />

        {rbac.error && <ErrorBanner message={rbac.error} />}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-medium text-slate-900">
            Current access
          </h2>
          {rbac.loading ? (
            <LoadingState message="Loading permissions…" />
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Role:{" "}
                <span className="font-medium text-teal-800">
                  {roleLabel(user.role)}
                </span>
              </p>
              <p>Company: {user.tenant?.name ?? "Platform (no company)"}</p>
              <div>
                <p className="mb-2 font-medium text-slate-900">Permissions</p>
                <ul className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <li
                      key={permission}
                      className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900"
                    >
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <AccessProbeCard user={user} />
    </PageFrame>
  );
};
