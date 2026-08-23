import type { AuthUser } from "../../../hooks/useAuth";
import { roleLabel } from "../../../lib/permissions";

type UserSessionCardProps = {
  user: AuthUser;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-(--fms-border) py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
    <dt className="text-[0.7rem] font-semibold tracking-[0.14em] text-(--fms-faint) uppercase">
      {label}
    </dt>
    <dd className="truncate font-medium text-(--fms-ink)">{value}</dd>
  </div>
);

export const UserSessionCard = ({ user }: UserSessionCardProps) => (
  <section className="surface p-6">
    <h2 className="font-display text-2xl font-medium italic text-(--fms-ink)">
      Current session
    </h2>
    <dl className="mt-2">
      <Row label="Email" value={user.email} />
      <Row label="Name" value={user.name ?? "—"} />
      <Row label="Role" value={roleLabel(user.role)} />
      <Row
        label="Company"
        value={user.tenant?.name ?? "Platform (no company)"}
      />
      <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <dt className="text-[0.7rem] font-semibold tracking-[0.14em] text-(--fms-faint) uppercase">
          User id
        </dt>
        <dd className="truncate font-mono text-xs text-(--fms-muted)">
          {user.id}
        </dd>
      </div>
    </dl>
  </section>
);
