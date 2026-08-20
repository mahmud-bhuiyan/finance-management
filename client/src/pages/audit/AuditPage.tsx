import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { AuditLogList } from "./components/AuditLogList";
import { useAuditLogs } from "./hooks/useAuditLogs";

export const AuditPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canReadAudit = !!user && roleCan(user.role, PERMISSIONS.AUDIT_READ);
  const audit = useAuditLogs(!authLoading && canReadAudit);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canReadAudit) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Finance Management System
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Audit trail
          </h1>
          <p className="mt-2 text-slate-600">
            Step 05 records create/update/delete actions with actor, entity, and
            before/after snapshots. Company admins see their company only; Super
            Admin sees platform-wide entries.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline"
          >
            ← Back home
          </Link>
        </div>

        {audit.error && <ErrorBanner message={audit.error} />}

        {audit.loading ? (
          <LoadingState message="Loading audit logs…" />
        ) : (
          <AuditLogList logs={audit.logs} />
        )}
      </main>
    </div>
  );
};
