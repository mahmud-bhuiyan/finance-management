import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { AuditLogDetailModal } from "./components/AuditLogDetailModal";
import { AuditLogFilters } from "./components/AuditLogFilters";
import { AuditLogTable } from "./components/AuditLogTable";
import { AuditProvider, useAudit } from "./hooks/useAudit";

const AuditPageContent = () => {
  const { loading, error } = useAudit();

  return (
    <>
      {error && <ErrorBanner message={error} />}

      <div className="space-y-3">
        <AuditLogFilters />
        {loading ? (
          <LoadingState message="Loading audit logs…" />
        ) : (
          <AuditLogTable />
        )}
      </div>

      <AuditLogDetailModal />
    </>
  );
};

export const AuditPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canReadAudit = !!user && roleCan(user.role, PERMISSIONS.AUDIT_READ);

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
    <AuditProvider enabled>
      <PageFrame>
        <PageHeader
          kicker="Account"
          title="Audit trail"
          description="Create, update, and delete actions with actor, entity, and before/after snapshots. Company admins see their company only; Super Admin sees platform-wide entries."
        />

        <AuditPageContent />
      </PageFrame>
    </AuditProvider>
  );
};
