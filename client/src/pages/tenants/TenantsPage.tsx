import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Super Admin
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            Companies
          </h1>
          <p className="mt-2 text-slate-600">
            Create tenants and assign company admins. Inactive companies cannot
            sign in.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline"
          >
            ← Back home
          </Link>
        </div>

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
      </main>
    </div>
  );
};
