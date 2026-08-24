import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { Input } from "../../components/ui/Input";
import { ApiError } from "../../lib/api";
import { TenantAdminsSection } from "./components/TenantAdminsSection";
import { TenantFormFooter } from "./components/TenantFormFooter";
import { TenantFormSection } from "./components/TenantFormSection";
import { TenantSummaryAside } from "./components/TenantSummaryAside";
import { TenantSuperAdminGate } from "./components/TenantSuperAdminGate";
import type { Tenant } from "./lib/tenantApi";
import { useTenantMutations } from "./hooks/useTenantMutations";

export const CreateTenantPage = () => {
  const navigate = useNavigate();
  const { createTenant, createAdmin, isCreating, isCreatingAdmin } =
    useTenantMutations();
  const [name, setName] = useState("");
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminStep = createdTenant !== null;
  const canSaveName = name.trim().length >= 2;

  const handleSaveName = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const tenant = await createTenant(name.trim());
      setCreatedTenant(tenant);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create company",
      );
    }
  };

  const handleCreateAdmin = async (input: {
    email: string;
    password: string;
    name?: string;
  }) => {
    if (!createdTenant) {
      return;
    }

    setError(null);
    try {
      await createAdmin(createdTenant.id, input);
      navigate("/tenants", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create company admin",
      );
      throw err;
    }
  };

  return (
    <TenantSuperAdminGate>
      <PageFrame>
        <PageHeader
          kicker="Super Admin"
          title="Create company"
          description={
            adminStep
              ? `Add the first admin for ${createdTenant.name}.`
              : "Start with the company name, then assign an admin."
          }
          actions={
            <Link
              to="/tenants"
              className="inline-flex items-center rounded-xl border border-(--fms-border-strong) bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-(--fms-ink) transition-colors hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)]"
            >
              Back to companies
            </Link>
          }
        />

        {error && <ErrorBanner message={error} />}

        <section className="surface overflow-hidden">
          <div className="space-y-6 p-5">
            {adminStep ? (
              <>
                <TenantSummaryAside tenant={createdTenant} />

                <TenantAdminsSection
                  tenant={createdTenant}
                  submitting={isCreatingAdmin}
                  onCreateAdmin={handleCreateAdmin}
                />
              </>
            ) : (
              <>
                <form
                  id="create-tenant-name-form"
                  onSubmit={(event) => void handleSaveName(event)}
                >
                  <TenantFormSection
                    title="General"
                    description="The display name for this company."
                  >
                    <Input
                      label="Company name"
                      name="companyName"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Acme Ltd"
                      required
                      minLength={2}
                      disabled={isCreating}
                    />
                  </TenantFormSection>
                </form>

                <TenantFormFooter
                  cancelTo="/tenants"
                  submitLabel="Save company"
                  submitting={isCreating}
                  submitDisabled={!canSaveName}
                  formId="create-tenant-name-form"
                  hint="Save the company first, then add an admin."
                />
              </>
            )}
          </div>
        </section>
      </PageFrame>
    </TenantSuperAdminGate>
  );
};
