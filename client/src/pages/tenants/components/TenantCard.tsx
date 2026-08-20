import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { ApiError } from "../../../lib/api";
import type { Tenant } from "../hooks/useTenants";
import { CreateAdminForm } from "./CreateAdminForm";

type TenantCardProps = {
  tenant: Tenant;
  onToggleStatus: (id: string, status: Tenant["status"]) => Promise<void>;
  onCreateAdmin: (
    tenantId: string,
    input: { email: string; password: string; name?: string },
  ) => Promise<void>;
  onError: (message: string | null) => void;
};

export const TenantCard = ({
  tenant,
  onToggleStatus,
  onCreateAdmin,
  onError,
}: TenantCardProps) => {
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const nextStatus = tenant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const handleToggle = async () => {
    setToggling(true);
    onError(null);
    try {
      await onToggleStatus(tenant.id, nextStatus);
    } catch (error) {
      onError(error instanceof ApiError ? error.message : "Could not update company");
    } finally {
      setToggling(false);
    }
  };

  const handleCreateAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    onError(null);
    try {
      await onCreateAdmin(tenant.id, {
        email: adminEmail,
        password: adminPassword,
        name: adminName.trim() || undefined,
      });
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : "Could not create company admin",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-slate-900">{tenant.name}</h2>
          <p className="text-sm text-slate-500">
            slug: {tenant.slug} · {tenant.status}
          </p>
        </div>
        <Button type="button" onClick={() => void handleToggle()} disabled={toggling}>
          {toggling ? "Updating…" : `Mark ${nextStatus.toLowerCase()}`}
        </Button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-800">Company admins</h3>
        {tenant.admins.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No company admins yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {tenant.admins.map((admin) => (
              <li key={admin.id}>
                {admin.email}
                {admin.name ? ` (${admin.name})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateAdminForm
        name={adminName}
        email={adminEmail}
        password={adminPassword}
        submitting={submitting}
        onNameChange={setAdminName}
        onEmailChange={setAdminEmail}
        onPasswordChange={setAdminPassword}
        onSubmit={handleCreateAdmin}
      />
    </article>
  );
};
