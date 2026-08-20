import type { FormEvent } from "react";
import { AuthButton } from "../../../components/forms/AuthButton";
import { AuthInput } from "../../../components/forms/AuthInput";
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
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthInput
        label="Name"
        type="text"
        icon="user"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <AuthInput
        label="Email Address"
        type="email"
        icon="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <AuthInput
        label="Password"
        type="password"
        icon="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      {error && <ErrorBanner message={error} />}
      <div className="pt-1">
        <AuthButton type="submit" disabled={submitting}>
          {submitting ? "Signing up…" : "Sign up"}
        </AuthButton>
      </div>
    </form>
  );
};
