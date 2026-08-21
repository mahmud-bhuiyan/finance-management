import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "../feedback/LoadingState";

export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading session…" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
