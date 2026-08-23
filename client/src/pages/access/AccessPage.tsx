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
    <PageFrame>
      <PageHeader
        kicker="Account"
        title="Role & access"
        description="RBAC maps roles to permissions and enforces them on the server."
      />

        {rbac.error && <ErrorBanner message={rbac.error} />}

        <section className="surface p-6">
          <h2 className="font-display text-2xl font-medium italic text-(--fms-ink)">
            Current access
          </h2>
          {rbac.loading ? (
            <LoadingState message="Loading permissions…" />
          ) : (
            <div className="mt-3 space-y-3 text-sm text-(--fms-muted)">
              <p>
                Role:{" "}
                <span className="font-medium text-(--fms-accent)">
                  {roleLabel(user.role)}
                </span>
              </p>
              <p>Company: {user.tenant?.name ?? "Platform (no company)"}</p>
              <div>
                <p className="mb-2 font-medium text-(--fms-ink)">Permissions</p>
                <ul className="flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <li
                      key={permission}
                      className="rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_14%,transparent)] px-3 py-1 text-xs font-medium text-(--fms-accent)"
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
