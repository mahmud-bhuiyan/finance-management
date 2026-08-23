import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ApiError } from "../../../lib/api";
import {
  clearRememberedLogin,
  persistRememberedLogin,
  readRememberedLogin,
} from "../../../lib/rememberLogin";

const rememberedLogin = readRememberedLogin();

export const useLoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(rememberedLogin?.email ?? "");
  const [password, setPassword] = useState(rememberedLogin?.password ?? "");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedLogin));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      if (rememberMe) {
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
    error,
    submitting,
    setEmail,
    setPassword,
    setRememberMe,
    onSubmit,
  };
};
