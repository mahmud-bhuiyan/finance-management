import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

type CreateAdminFormProps = {
  email: string;
  password: string;
  name: string;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const CreateAdminForm = ({
  email,
  password,
  name,
  submitting,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onSubmit,
}: CreateAdminFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
      <Input
        label="Admin name"
        name="adminName"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        autoComplete="name"
      />
      <Input
        label="Admin email"
        type="email"
        name="adminEmail"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
        autoComplete="off"
      />
      <Input
        label="Admin password"
        type="password"
        name="adminPassword"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <div className="sm:col-span-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add company admin"}
        </Button>
      </div>
    </form>
  );
};
