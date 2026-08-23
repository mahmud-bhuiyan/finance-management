import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import { CreateTenantForm } from "./components/CreateTenantForm";
import { TenantCard } from "./components/TenantCard";
import { useTenants } from "./hooks/useTenants";

export const TenantsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const tenants = useTenants(!authLoading && user?.role === "SUPER_ADMIN");
  const [companyName, setCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "SUPER_ADMIN") {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    tenants.setError(null);
    try {
      await tenants.createTenant(companyName.trim());
      setCompanyName("");
    } catch (error) {
      tenants.setError(
        error instanceof ApiError ? error.message : "Could not create company",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageFrame>
      <PageHeader
        kicker="Super Admin"
        title="Companies"
        description="Create tenants and assign company admins. Inactive companies cannot sign in."
      />

        {tenants.error && <ErrorBanner message={tenants.error} />}

        <CreateTenantForm
          name={companyName}
          submitting={creating}
          onNameChange={setCompanyName}
          onSubmit={(event) => void handleCreate(event)}
        />

        {tenants.loading ? (
          <p className="text-sm text-slate-500">Loading companies…</p>
        ) : tenants.tenants.length === 0 ? (
          <p className="text-sm text-slate-500">No companies yet.</p>
        ) : (
          <div className="space-y-4">
            {tenants.tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onToggleStatus={tenants.updateTenantStatus}
                onCreateAdmin={tenants.createAdmin}
                onError={tenants.setError}
              />
            ))}
          </div>
        )}
    </PageFrame>
  );
};
