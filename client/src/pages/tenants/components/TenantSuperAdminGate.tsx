import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { useAuth } from "../../../hooks/useAuth";

type TenantSuperAdminGateProps = {
  children: ReactNode;
};

export const TenantSuperAdminGate = ({ children }: TenantSuperAdminGateProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "SUPER_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};
