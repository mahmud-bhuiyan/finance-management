import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { CreateTenantModal } from "./components/CreateTenantModal";
import { EditTenantModal } from "./components/EditTenantModal";
import { TenantConfirmModal } from "./components/TenantConfirmModal";
import { TenantTable } from "./components/TenantTable";
import { TenantsProvider, useTenants } from "./hooks/useTenants";

const TenantsPageContent = () => {
  const { loading, error } = useTenants();

  return (
    <>
      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingState message="Loading companies…" />
      ) : (
        <TenantTable />
      )}

      <CreateTenantModal />
      <EditTenantModal />
      <TenantConfirmModal />
    </>
  );
};

export const TenantsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <TenantsProvider enabled>
      <PageFrame>
        <PageHeader
          kicker="Super Admin"
          title="Companies"
          description="Create tenants and assign company admins. Inactive companies cannot sign in."
        />

        <TenantsPageContent />
      </PageFrame>
    </TenantsProvider>
  );
};
