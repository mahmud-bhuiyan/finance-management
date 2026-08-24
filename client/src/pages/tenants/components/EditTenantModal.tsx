import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants } from "../hooks/useTenants";

export const EditTenantModal = () => {
  const {
    editTenant,
    closeEdit,
    updateTenantName,
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
      title={editTenant ? `Edit ${editTenant.name}` : "Edit company"}
      onClose={handleClose}
      wide
      footer={
        <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="submit"
            form="edit-tenant-name-form"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving…" : "Save changes"}
          </Button>
        </div>
      }
    >
      {editTenant && (
        <div className="space-y-6">
          <form
            id="edit-tenant-name-form"
            onSubmit={(event) => void handleSaveName(event)}
            className="space-y-4"
          >
            <Input
              label="Company name"
              name="companyName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
            <p className="text-xs text-(--fms-muted)">
              Slug: <span className="font-mono">{editTenant.slug}</span>
            </p>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-(--fms-ink)">
              Company admins
            </h3>
            {editTenant.admins.length === 0 ? (
              <p className="text-sm text-(--fms-muted)">
                No company admins yet.
              </p>
            ) : (
              <ul className="space-y-1 text-sm text-(--fms-ink)">
                {editTenant.admins.map((admin) => (
                  <li key={admin.id}>
                    {admin.email}
                    {admin.name ? ` (${admin.name})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={(event) => void handleCreateAdmin(event)}
            className="grid gap-3 sm:grid-cols-3"
          >
            <Input
              label="Admin name"
              name="adminName"
              value={adminName}
              onChange={(event) => setAdminName(event.target.value)}
              autoComplete="name"
            />
            <Input
              label="Admin email"
              type="email"
              name="adminEmail"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              required
              autoComplete="off"
            />
            <Input
              label="Admin password"
              type="password"
              name="adminPassword"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <div className="sm:col-span-3">
              <Button type="submit" disabled={isCreatingAdmin}>
                {isCreatingAdmin ? "Adding…" : "Add company admin"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
