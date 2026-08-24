import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export type TenantAdminFormValues = {
  name: string;
  email: string;
  password: string;
};

type TenantAdminFormProps = {
  values: TenantAdminFormValues;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  submitting?: boolean;
  className?: string;
};

export const TenantAdminForm = ({
  values,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitting = false,
  className = "grid gap-4 sm:grid-cols-2",
}: TenantAdminFormProps) => (
  <form
    onSubmit={(event) => void onSubmit(event)}
    className={className}
  >
    <Input
      label="Admin name (optional)"
      name="adminName"
      value={values.name}
      onChange={(event) => onNameChange(event.target.value)}
      autoComplete="name"
      placeholder="Jane Doe"
      disabled={submitting}
    />
    <Input
      label="Admin email"
      type="email"
      name="adminEmail"
      value={values.email}
      onChange={(event) => onEmailChange(event.target.value)}
      required
      autoComplete="off"
      placeholder="admin@company.com"
      disabled={submitting}
    />
    <div className="sm:col-span-2">
      <Input
        label="Temporary password"
        type="password"
        name="adminPassword"
        value={values.password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        disabled={submitting}
      />
    </div>
    <div className="flex justify-end sm:col-span-2">
      <Button type="submit" variant="ghost" disabled={submitting}>
        {submitting ? "Adding…" : "Add admin"}
      </Button>
    </div>
  </form>
);
