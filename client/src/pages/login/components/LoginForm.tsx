import type { FormEvent } from "react";
import { AuthButton } from "../../../components/forms/AuthButton";
import { AuthInput } from "../../../components/forms/AuthInput";
import { ErrorBanner } from "../../../components/feedback/ErrorBanner";

type LoginFormProps = {
  email: string;
  password: string;
  error: string | null;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
};

export const LoginForm = ({
  email,
  password,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      {error && <ErrorBanner message={error} />}
      <div className="pt-1">
        <AuthButton type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </AuthButton>
      </div>
    </form>
  );
};
