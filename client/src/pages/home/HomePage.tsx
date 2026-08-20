import { Navigate } from "react-router-dom";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { UserSessionCard } from "./components/UserSessionCard";

export const HomePage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Finance Management System
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Step 03 tenants are running
        </h1>
        <p className="text-lg text-slate-600">
          Super Admin can create companies and company admins. Other roles stay
          signed in with the httpOnly JWT cookie.
        </p>

        <UserSessionCard user={user} onLogout={() => void logout()} />
      </main>
    </div>
  );
};
