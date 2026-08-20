import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ErrorBanner } from "../../../components/feedback/ErrorBanner";

type RegisterFormProps = {
  name: string;
  email: string;
  password: string;
  error: string | null;
  submitting: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const RegisterForm = ({
  name,
  email,
  password,
  error,
  submitting,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <Input
        label="Name (optional)"
        type="text"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      {error && <ErrorBanner message={error} />}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
};
