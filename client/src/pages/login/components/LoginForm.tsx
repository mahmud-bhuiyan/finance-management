import type { FormEvent } from "react";
import { ErrorBanner } from "../../../components/feedback/ErrorBanner";
import { AuthInput } from "../../../components/forms/AuthInput";
import { Button } from "../../../components/ui/Button";
import {
  DemoAccountPicker,
  type DemoAccount,
} from "./DemoAccountPicker";

type LoginFormProps = {
  email: string;
  password: string;
  rememberMe: boolean;
  demoAccounts: DemoAccount[];
  isDemoLogin: boolean;
  selectedDemoEmail: string | null;
  error: string | null;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onDemoAccountSelect: (account: DemoAccount) => void;
  onSubmit: (event: FormEvent) => void;
};

export const LoginForm = ({
  email,
  password,
  rememberMe,
  demoAccounts,
  isDemoLogin,
  selectedDemoEmail,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onDemoAccountSelect,
  onSubmit,
}: LoginFormProps) => {
  const hasDemoAccounts = demoAccounts.length > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <DemoAccountPicker
        accounts={demoAccounts}
        selectedEmail={selectedDemoEmail}
        disabled={submitting}
        onSelect={onDemoAccountSelect}
      />

      {hasDemoAccounts && (
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--fms-border)" />
          </div>
          <p className="relative mx-auto w-fit bg-(--fms-surface) px-3 text-xs font-medium text-(--fms-muted)">
            Or sign in with your account
          </p>
        </div>
      )}

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
      {!isDemoLogin && (
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
      )}
      {!isDemoLogin && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-(--fms-ink)">
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded-sm border border-(--fms-border-strong) text-(--fms-accent) accent-(--fms-accent)"
          />
          Remember me
        </label>
      )}
      {error && <ErrorBanner message={error} />}
      <div className="pt-1">
        <Button type="submit" className="w-full py-3" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </div>
    </form>
  );
};
