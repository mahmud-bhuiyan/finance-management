import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants } from "../hooks/useTenants";

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
      onClose={handleClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-tenant-form" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create company"}
          </Button>
        </div>
      }
    >
      <form
        id="create-tenant-form"
        onSubmit={(event) => void handleSubmit(event)}
        className="space-y-4"
      >
        <Input
          label="Company name"
          name="companyName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Ltd"
          required
          minLength={2}
        />
      </form>
    </Modal>
  );
};
