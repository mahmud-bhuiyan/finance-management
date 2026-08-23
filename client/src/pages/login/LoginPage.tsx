import { Link } from "react-router-dom";
import { AuthScreen, LockIcon } from "../../components/layout/AuthScreen";
import { LoginForm } from "./components/LoginForm";
import { useLoginForm } from "./hooks/useLoginForm";

export const LoginPage = () => {
  const form = useLoginForm();

  return (
    <AuthScreen
      icon={<LockIcon />}
      title="Welcome back"
      subtitle="Sign in to your finance workspace."
      footer={
        <>
          Don’t have an account?{" "}
          <Link className="font-bold underline" to="/register">
            Sign up free
          </Link>
        </>
      }
    >
      <LoginForm
        email={form.email}
        password={form.password}
        rememberMe={form.rememberMe}
        error={form.error}
        submitting={form.submitting}
        onEmailChange={form.setEmail}
        onPasswordChange={form.setPassword}
        onRememberMeChange={form.setRememberMe}
        onSubmit={form.onSubmit}
      />
    </AuthScreen>
  );
};
