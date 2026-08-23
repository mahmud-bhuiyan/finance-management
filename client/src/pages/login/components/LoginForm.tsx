import type { FormEvent } from "react";
import { ErrorBanner } from "../../../components/feedback/ErrorBanner";
import { AuthInput } from "../../../components/forms/AuthInput";
import { Button } from "../../../components/ui/Button";

type LoginFormProps = {
  email: string;
  password: string;
  rememberMe: boolean;
  error: string | null;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
};

export const LoginForm = ({
  email,
  password,
  rememberMe,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
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
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-(--fms-ink)">
        <input
          type="checkbox"
          name="rememberMe"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded-sm border-(--fms-border-strong) accent-(--fms-accent)"
        />
        Remember me
      </label>
      {error && <ErrorBanner message={error} />}
      <div className="pt-1">
        <Button type="submit" className="w-full py-3" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </div>
    </form>
  );
};
