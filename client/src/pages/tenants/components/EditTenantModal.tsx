import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants, type Tenant, type TenantAdmin } from "../hooks/useTenants";
import { TenantAdminForm } from "./TenantAdminForm";
import { TenantNameForm } from "./TenantNameForm";
import { TenantSlugEditor } from "./TenantSlugEditor";

const statusBadgeClass: Record<Tenant["status"], string> = {
  ACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-(--fms-accent)",
  INACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-muted)_18%,transparent)] text-(--fms-muted)",
};

const tenantInitials = (tenant: Tenant) => {
  const parts = tenant.name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return tenant.name.slice(0, 2).toUpperCase();
};

const adminInitials = (admin: TenantAdmin) => {
  const source = admin.name?.trim() || admin.email;
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

const SummaryRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="space-y-1">
    <dt className="text-[0.68rem] font-semibold tracking-[0.12em] text-(--fms-muted) uppercase">
      {label}
    </dt>
    <dd className="text-sm text-(--fms-ink)">{value}</dd>
  </div>
);

export const EditTenantModal = () => {
  const {
    editTenant,
    closeEdit,
    updateTenantName,
    updateTenantSlug,
    createAdmin,
    isUpdating,
    isCreatingAdmin,
    setError,
  } = useTenants();
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    if (editTenant) {
      setName(editTenant.name);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    }
  }, [editTenant]);

  const handleClose = () => {
    closeEdit();
  };

  const handleSaveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!editTenant) {
      return;
    }

    setError(null);
    try {
      await updateTenantName(editTenant.id, name.trim());
      closeEdit();
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Could not update company",
      );
    }
  };

  const handleUpdateSlug = async (slug: string) => {
    if (!editTenant) {
      return;
    }

    setError(null);
    try {
      await updateTenantSlug(editTenant.id, slug);
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Could not update slug",
      );
      throw error;
    }
  };

  const handleCreateAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (!editTenant) {
      return;
    }

    setError(null);
    try {
      await createAdmin(editTenant.id, {
        email: adminEmail,
        password: adminPassword,
        name: adminName.trim() || undefined,
      });
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Could not create company admin",
      );
    }
  };

  return (
    <Modal
      open={!!editTenant}
      title={editTenant?.name ?? "Company"}
      kicker="Manage company"
      variant="workspace"
      size="lg"
      onClose={handleClose}
      leading={
        editTenant ? (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,var(--fms-accent-soft),var(--fms-accent))] text-sm font-bold text-white dark:text-[#04110f]"
          >
            {tenantInitials(editTenant)}
          </span>
        ) : undefined
      }
      badge={
        editTenant ? (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide uppercase ${statusBadgeClass[editTenant.status]}`}
          >
            {editTenant.status}
          </span>
        ) : undefined
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_4%,transparent)] px-5 py-4">
          <p className="text-xs text-(--fms-muted)">
            Changes apply to this company only.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-tenant-name-form"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      }
    >
      {editTenant && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-(--fms-border) bg-(--fms-surface) p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <SummaryRow
                label="Slug"
                value={
                  <span className="font-mono text-xs">{editTenant.slug}</span>
                }
              />
              <SummaryRow
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide uppercase ${statusBadgeClass[editTenant.status]}`}
                  >
                    {editTenant.status}
                  </span>
                }
              />
              <SummaryRow
                label="Admins"
                value={editTenant.admins.length.toLocaleString()}
              />
              <SummaryRow
                label="Created"
                value={new Date(editTenant.createdAt).toLocaleDateString()}
              />
            </dl>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-(--fms-border) bg-(--fms-surface) p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-(--fms-ink)">
                  General
                </h3>
                <p className="mt-1 text-sm text-(--fms-muted)">
                  Update the display name and URL slug for this company.
                </p>
              </div>

              <div className="space-y-5">
                <TenantNameForm
                  id="edit-tenant-name-form"
                  name={name}
                  onNameChange={setName}
                  onSubmit={handleSaveName}
                />

                <TenantSlugEditor
                  currentSlug={editTenant.slug}
                  submitting={isUpdating}
                  onConfirmChange={handleUpdateSlug}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-(--fms-border) bg-(--fms-surface) p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-(--fms-ink)">
                  Company admins
                </h3>
                <p className="mt-1 text-sm text-(--fms-muted)">
                  People who can sign in and manage this company.
                </p>
              </div>

              {editTenant.admins.length === 0 ? (
                <p className="surface-dashed px-4 py-5 text-sm text-(--fms-muted)">
                  No company admins yet. Add one below so someone can sign in.
                </p>
              ) : (
                <ul className="mb-5 overflow-hidden rounded-xl border border-(--fms-border)">
                  {editTenant.admins.map((admin, index) => (
                    <li
                      key={admin.id}
                      className={`flex items-center gap-3 bg-[color-mix(in_srgb,var(--fms-surface-strong)_55%,transparent)] px-4 py-3 ${
                        index > 0 ? "border-t border-(--fms-border)" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_16%,transparent)] text-xs font-semibold text-(--fms-accent)"
                      >
                        {adminInitials(admin)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-(--fms-ink)">
                          {admin.name?.trim() || admin.email}
                        </p>
                        {admin.name?.trim() ? (
                          <p className="truncate text-xs text-(--fms-muted)">
                            {admin.email}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-xl border border-dashed border-(--fms-border-strong) bg-[color-mix(in_srgb,var(--fms-accent)_4%,transparent)] p-4">
                <p className="text-sm font-medium text-(--fms-ink)">
                  Invite admin
                </p>
                <p className="mt-1 text-xs text-(--fms-muted)">
                  Creates a sign-in account with full admin access.
                </p>

                <TenantAdminForm
                  className="mt-4 grid gap-4 sm:grid-cols-2"
                  values={{
                    name: adminName,
                    email: adminEmail,
                    password: adminPassword,
                  }}
                  onNameChange={setAdminName}
                  onEmailChange={setAdminEmail}
                  onPasswordChange={setAdminPassword}
                  onSubmit={handleCreateAdmin}
                  submitting={isCreatingAdmin}
                />
              </div>
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
};
