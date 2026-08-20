import { Link } from "react-router-dom";
import { RegisterForm } from "./components/RegisterForm";
import { useRegisterForm } from "./hooks/useRegisterForm";

export const RegisterPage = () => {
  const form = useRegisterForm();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold text-slate-950">Create account</h1>
      <p className="mb-8 text-slate-600">
        Register with email and a password (min 8 characters).
      </p>

      <RegisterForm
        name={form.name}
        email={form.email}
        password={form.password}
        error={form.error}
        submitting={form.submitting}
        onNameChange={form.setName}
        onEmailChange={form.setEmail}
        onPasswordChange={form.setPassword}
        onSubmit={form.onSubmit}
      />

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-teal-700 hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
};
