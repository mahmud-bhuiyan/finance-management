import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { TenantConfirmModal } from "./components/TenantConfirmModal";
import { TenantSuperAdminGate } from "./components/TenantSuperAdminGate";
import { TenantTable } from "./components/TenantTable";
import type { Tenant } from "./lib/tenantApi";
import { TENANT_LIST_PATHS } from "./lib/tenantPaths";
import { TenantsProvider, useTenants } from "./hooks/useTenants";

const tenantStatusTabs = [
  { to: TENANT_LIST_PATHS.active, label: "Active" },
  { to: TENANT_LIST_PATHS.inactive, label: "Inactive" },
];

type TenantsPageProps = {
  status: Tenant["status"];
};

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

export const TenantsPage = ({ status }: TenantsPageProps) => (
  <TenantSuperAdminGate>
    <TenantsProvider enabled status={status}>
      <PageFrame>
        <div className="flex flex-col gap-4">
          <PageHeader
            kicker="Super Admin"
            title="Companies"
            description="Create tenants and assign company admins. Inactive companies cannot sign in."
          >
            <Tabs
              items={tenantStatusTabs}
              ariaLabel="Company status"
              className="mt-3"
            />
          </PageHeader>

          <TenantsPageContent />
        </div>
      </PageFrame>
    </TenantsProvider>
  </TenantSuperAdminGate>
);
