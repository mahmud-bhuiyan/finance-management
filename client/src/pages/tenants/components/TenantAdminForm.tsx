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
  onSubmit?: (event: FormEvent) => void;
  submitting?: boolean;
  className?: string;
  embedded?: boolean;
};

export const TenantAdminFields = ({
  values,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  submitting = false,
}: Omit<TenantAdminFormProps, "onSubmit" | "embedded" | "className">) => (
  <>
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
  </>
);

export const TenantAdminForm = ({
  values,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitting = false,
  className = "space-y-4",
  embedded = false,
}: TenantAdminFormProps) => {
  const fields = (
    <TenantAdminFields
      values={values}
      onNameChange={onNameChange}
      onEmailChange={onEmailChange}
      onPasswordChange={onPasswordChange}
      submitting={submitting}
    />
  );

  if (embedded) {
    return <div className={className}>{fields}</div>;
  }

  return (
    <form
      onSubmit={(event) => void onSubmit?.(event)}
      className={className}
    >
      {fields}
      <div className="flex justify-end">
        <Button type="submit" variant="ghost" disabled={submitting}>
          {submitting ? "Adding…" : "Add admin"}
        </Button>
      </div>
    </form>
  );
};
