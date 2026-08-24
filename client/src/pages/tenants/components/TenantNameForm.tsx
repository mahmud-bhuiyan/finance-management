import type { FormEvent, ReactNode } from "react";
import { Input } from "../../../components/ui/Input";

type TenantNameFormProps = {
  id?: string;
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder?: string;
  className?: string;
  children?: ReactNode;
};

export const TenantNameForm = ({
  id,
  name,
  onNameChange,
  onSubmit,
  placeholder = "Acme Ltd",
  className = "space-y-5",
  children,
}: TenantNameFormProps) => (
  <form
    id={id}
    onSubmit={(event) => void onSubmit(event)}
    className={className}
  >
    <Input
      label="Company name"
      name="companyName"
      value={name}
      onChange={(event) => onNameChange(event.target.value)}
      placeholder={placeholder}
      required
      minLength={2}
    />
    {children}
  </form>
);
