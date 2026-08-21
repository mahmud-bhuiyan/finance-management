import { Link } from "react-router-dom";
import { AuthScreen, UserPlusIcon } from "../../components/layout/AuthScreen";
import { RegisterForm } from "./components/RegisterForm";
import { useRegisterForm } from "./hooks/useRegisterForm";

export const RegisterPage = () => {
  const form = useRegisterForm();

  return (
    <AuthScreen
      icon={<UserPlusIcon />}
      tone="pink"
      title="Create account"
      subtitle="Register to join a company workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-bold underline" to="/login">
            Log in
          </Link>
        </>
      }
    >
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
    </AuthScreen>
  );
};
