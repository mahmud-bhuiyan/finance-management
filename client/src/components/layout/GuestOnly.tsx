import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "../feedback/LoadingState";
import { AppAtmosphere } from "./AppAtmosphere";

const GuestShell = ({ children }: { children: ReactNode }) => (
  <div className="app-shell min-h-screen">
    <AppAtmosphere />
    <div className="app-content">{children}</div>
  </div>
);

export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <GuestShell>
        <LoadingState message="Loading session…" fullPage />
      </GuestShell>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <GuestShell>{children}</GuestShell>;
};
