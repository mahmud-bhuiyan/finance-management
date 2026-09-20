import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ApiError } from "../../../lib/api";
import {
  clearRememberedLogin,
  persistRememberedLogin,
  readRememberedLogin,
} from "../../../lib/rememberLogin";
import type { DemoAccount } from "../components/DemoAccountPicker";
import { useDemoAccounts } from "./useDemoAccounts";

const rememberedLogin = readRememberedLogin();

export const useLoginForm = () => {
  const { login } = useAuth();
  const { accounts: demoAccounts } = useDemoAccounts();
  const navigate = useNavigate();
  const [email, setEmail] = useState(rememberedLogin?.email ?? "");
  const [password, setPassword] = useState(rememberedLogin?.password ?? "");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedLogin));
  const [selectedDemoEmail, setSelectedDemoEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isDemoLogin = Boolean(
    selectedDemoEmail && selectedDemoEmail === email.trim().toLowerCase(),
  );

  const setEmailValue = (value: string) => {
    setEmail(value);
    if (
      selectedDemoEmail &&
      value.trim().toLowerCase() !== selectedDemoEmail
    ) {
      setSelectedDemoEmail(null);
    }
  };

  const selectDemoAccount = (account: DemoAccount) => {
    setSelectedDemoEmail(account.email);
    setEmail(account.email);
    setPassword("");
    setRememberMe(false);
    setError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, isDemoLogin ? false : rememberMe, isDemoLogin);
      if (rememberMe && !isDemoLogin) {
        persistRememberedLogin(email, password);
      } else {
        clearRememberedLogin();
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    password,
    rememberMe,
    demoAccounts,
    isDemoLogin,
    error,
    submitting,
    selectedDemoEmail,
    setEmail: setEmailValue,
    setPassword,
    setRememberMe,
    selectDemoAccount,
    onSubmit,
  };
};
