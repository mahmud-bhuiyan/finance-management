import { Navigate } from "react-router-dom";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { roleLabel } from "../../lib/permissions";
import { UserSessionCard } from "./components/UserSessionCard";

const homeCopy = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "Create companies and company admins from Companies. Audit covers platform-wide activity.";
    case "COMPANY_ADMIN":
      return "Use the sidebar for expenses, income, reports, users, and custom fields.";
    case "NORMAL_USER":
      return "Dashboards, reports, and lists are read-only. You cannot create or edit financial records.";
    default:
      return "Use the sidebar to move around the workspace.";
  }
};

export const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageFrame maxWidth="max-w-3xl">
      <PageHeader
        kicker="Finance Management System"
        title={`Welcome${user.name ? `, ${user.name}` : ""}`}
        description={homeCopy(user.role)}
      />
      <p className="text-sm text-slate-600">
        Signed in as {roleLabel(user.role)}
        {user.tenant ? ` · ${user.tenant.name}` : ""}.
      </p>
      <UserSessionCard user={user} />
    </PageFrame>
  );
};
