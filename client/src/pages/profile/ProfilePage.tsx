import { Navigate } from "react-router-dom";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { roleLabel } from "../../lib/permissions";
import { themeLabel } from "../../lib/theme";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-(--fms-border) py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
    <dt className="text-[0.7rem] font-semibold tracking-[0.14em] text-(--fms-faint) uppercase">
      {label}
    </dt>
    <dd className="truncate font-medium text-(--fms-ink)">{value}</dd>
  </div>
);

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageFrame>
      <PageHeader
        kicker="Account"
        title="My profile"
        description="Your name, role, and company for this session."
      />

      <section className="surface p-6">
        <dl>
          <Row label="Name" value={user.name ?? "—"} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={roleLabel(user.role)} />
          <Row
            label="Company"
            value={user.tenant?.name ?? "Platform (no company)"}
          />
          <Row label="Theme" value={themeLabel(user.themePreference)} />
        </dl>
      </section>
    </PageFrame>
  );
};
