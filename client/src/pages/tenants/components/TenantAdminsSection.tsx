import { useState, type FormEvent } from "react";
import type { Tenant } from "../lib/tenantApi";
import { adminInitials } from "../lib/tenantDisplay";
import { TenantAdminForm } from "./TenantAdminForm";
import { TenantFormSection } from "./TenantFormSection";

type TenantAdminsSectionProps = {
  tenant: Tenant;
  submitting: boolean;
  onCreateAdmin: (
    input: { email: string; password: string; name?: string },
  ) => Promise<void>;
};

export const TenantAdminsSection = ({
  tenant,
  submitting,
  onCreateAdmin,
}: TenantAdminsSectionProps) => {
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleCreateAdmin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await onCreateAdmin({
        email: adminEmail,
        password: adminPassword,
        name: adminName.trim() || undefined,
      });
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch {
      // Parent surfaces the error banner.
    }
  };

  return (
    <TenantFormSection
      title="Company admins"
      description="People who can sign in and manage this company."
    >
      {tenant.admins.length === 0 ? (
        <p className="surface-dashed mb-5 px-4 py-5 text-sm text-(--fms-muted)">
          No company admins yet. Add one below so someone can sign in.
        </p>
      ) : (
        <ul className="mb-5 overflow-hidden rounded-xl border border-(--fms-border)">
          {tenant.admins.map((admin, index) => (
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
        <p className="text-sm font-medium text-(--fms-ink)">Invite admin</p>
        <p className="mt-1 text-xs text-(--fms-muted)">
          Creates a sign-in account with full admin access.
        </p>

        <TenantAdminForm
          className="mt-4 space-y-4"
          values={{
            name: adminName,
            email: adminEmail,
            password: adminPassword,
          }}
          onNameChange={setAdminName}
          onEmailChange={setAdminEmail}
          onPasswordChange={setAdminPassword}
          onSubmit={handleCreateAdmin}
          submitting={submitting}
        />
      </div>
    </TenantFormSection>
  );
};
