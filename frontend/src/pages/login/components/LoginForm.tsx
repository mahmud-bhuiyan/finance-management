import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
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
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
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
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />
      {error && <ErrorBanner message={error} />}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
};
