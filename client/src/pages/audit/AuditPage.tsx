import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
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
    <PageFrame>
      <PageHeader
        kicker="Account"
        title="Audit trail"
        description="Create, update, and delete actions with actor, entity, and before/after snapshots. Company admins see their company only; Super Admin sees platform-wide entries."
      />

        {audit.error && <ErrorBanner message={audit.error} />}

        {audit.loading ? (
          <LoadingState message="Loading audit logs…" />
        ) : (
          <AuditLogList logs={audit.logs} />
        )}
    </PageFrame>
  );
};
