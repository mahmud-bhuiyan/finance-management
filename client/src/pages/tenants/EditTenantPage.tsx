import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { ApiError } from "../../lib/api";
import { TenantAdminsSection } from "./components/TenantAdminsSection";
import { TenantGeneralSection } from "./components/TenantGeneralSection";
import { TenantSummaryAside } from "./components/TenantSummaryAside";
import { TenantSuperAdminGate } from "./components/TenantSuperAdminGate";
import { useTenant } from "./hooks/useTenant";
import { useTenantMutations } from "./hooks/useTenantMutations";

export const EditTenantPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const location = useLocation();
  const { tenant, loading, notFound, error: loadError } = useTenant(tenantId);
  const {
    updateTenantName,
    updateTenantSlug,
    createAdmin,
    isUpdating,
    isCreatingAdmin,
  } = useTenantMutations();
  const [error, setError] = useState<string | null>(
    (location.state as { error?: string } | null)?.error ?? null,
  );

  useEffect(() => {
    if ((location.state as { error?: string } | null)?.error) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (notFound) {
    return <Navigate to="/tenants" replace />;
  }

  const handleUpdateName = async (name: string) => {
    if (!tenant) {
      return;
    }

    setError(null);
    try {
      await updateTenantName(tenant.id, name);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update company",
      );
      throw err;
    }
  };

  const handleUpdateSlug = async (slug: string) => {
    if (!tenant) {
      return;
    }

    setError(null);
    try {
      await updateTenantSlug(tenant.id, slug);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update slug",
      );
      throw err;
    }
  };

  const handleCreateAdmin = async (
    input: { email: string; password: string; name?: string },
  ) => {
    if (!tenant) {
      return;
    }

    setError(null);
    try {
      await createAdmin(tenant.id, input);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create company admin",
      );
      throw err;
    }
  };

  return (
    <TenantSuperAdminGate>
      <PageFrame>
        <PageHeader
          kicker="Manage company"
          title={tenant?.name ?? "Company"}
          description="Update company details and assign admins."
          actions={
            <Link
              to="/tenants"
              className="inline-flex items-center rounded-xl border border-(--fms-border-strong) bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-(--fms-ink) transition-colors hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)]"
            >
              Back to companies
            </Link>
          }
        />

        {(error || loadError) && (
          <ErrorBanner message={error ?? loadError ?? ""} />
        )}

        {loading ? (
          <LoadingState message="Loading company…" />
        ) : tenant ? (
          <div className="space-y-6">
            <TenantSummaryAside tenant={tenant} />

            <TenantGeneralSection
              currentName={tenant.name}
              currentSlug={tenant.slug}
              submitting={isUpdating}
              onUpdateName={handleUpdateName}
              onUpdateSlug={handleUpdateSlug}
            />

            <TenantAdminsSection
              tenant={tenant}
              submitting={isCreatingAdmin}
              onCreateAdmin={handleCreateAdmin}
            />
          </div>
        ) : null}
      </PageFrame>
    </TenantSuperAdminGate>
  );
};
