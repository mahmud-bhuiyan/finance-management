import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

type CreateTenantFormProps = {
  name: string;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const CreateTenantForm = ({
  name,
  submitting,
  onNameChange,
  onSubmit,
}: CreateTenantFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="surface flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="New company name"
          name="companyName"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Acme Ltd"
          required
          minLength={2}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create company"}
      </Button>
    </form>
  );
};
