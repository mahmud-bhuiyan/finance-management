import { Link } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { useLoginForm } from "./hooks/useLoginForm";

export const LoginPage = () => {
  const form = useLoginForm();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold text-slate-950">Sign in</h1>
      <p className="mb-8 text-slate-600">Step 02 auth — use your FMS account.</p>

      <LoginForm
        email={form.email}
        password={form.password}
        error={form.error}
        submitting={form.submitting}
        onEmailChange={form.setEmail}
        onPasswordChange={form.setPassword}
        onSubmit={form.onSubmit}
      />

      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link className="font-medium text-teal-700 hover:underline" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};
