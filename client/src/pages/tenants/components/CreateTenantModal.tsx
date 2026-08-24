import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants } from "../hooks/useTenants";
import { TenantNameForm } from "./TenantNameForm";

export const CreateTenantModal = () => {
  const {
    createOpen,
    closeCreate,
    createTenant,
    isCreating,
    setError,
  } = useTenants();
  const [name, setName] = useState("");

  const handleClose = () => {
    setName("");
    closeCreate();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createTenant(name.trim());
      setName("");
      closeCreate();
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Could not create company",
      );
    }
  };

  return (
    <Modal
      open={createOpen}
      title="Create company"
      kicker="New company"
      subtitle="Creates an empty tenant. Assign company admins from the edit screen after creation."
      variant="prompt"
      size="sm"
      onClose={handleClose}
      footer={null}
    >
      <TenantNameForm
        id="create-tenant-form"
        name={name}
        onNameChange={setName}
        onSubmit={handleSubmit}
      >
        <div className="space-y-3 pt-1">
          <Button
            type="submit"
            className="w-full"
            disabled={isCreating || name.trim().length < 2}
          >
            {isCreating ? "Creating…" : "Create company"}
          </Button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-2 text-sm font-medium text-(--fms-muted) transition-colors hover:text-(--fms-ink)"
          >
            Cancel
          </button>
        </div>
      </TenantNameForm>
    </Modal>
  );
};
