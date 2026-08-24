import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { TenantConfirmModal } from "./components/TenantConfirmModal";
import { TenantSuperAdminGate } from "./components/TenantSuperAdminGate";
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

      <TenantConfirmModal />
    </>
  );
};

export const TenantsPage = () => (
  <TenantSuperAdminGate>
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
  </TenantSuperAdminGate>
);
