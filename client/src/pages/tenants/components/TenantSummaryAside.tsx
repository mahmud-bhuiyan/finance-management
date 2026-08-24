import type { ReactNode } from "react";
import type { Tenant } from "../lib/tenantApi";
import { tenantInitials } from "../lib/tenantDisplay";
import { TenantStatusBadge } from "./TenantStatusBadge";

const SummaryRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0 flex-1 space-y-1">
    <dt className="text-[0.68rem] font-semibold tracking-[0.12em] text-(--fms-muted) uppercase">
      {label}
    </dt>
    <dd className="truncate text-sm text-(--fms-ink)">{value}</dd>
  </div>
);

type TenantSummaryAsideProps = {
  tenant: Tenant;
};

export const TenantSummaryAside = ({ tenant }: TenantSummaryAsideProps) => (
  <aside className="h-fit rounded-2xl border border-(--fms-border) bg-(--fms-surface) p-4">
    <div className="mb-4 flex items-center gap-3 border-b border-(--fms-border) pb-4">
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,var(--fms-accent-soft),var(--fms-accent))] text-sm font-bold text-white dark:text-[#04110f]"
      >
        {tenantInitials(tenant)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-(--fms-ink)">{tenant.name}</p>
        <TenantStatusBadge status={tenant.status} className="mt-1.5" />
      </div>
    </div>

    <dl className="flex gap-4">
      <SummaryRow
        label="Slug"
        value={<span className="font-mono text-xs">{tenant.slug}</span>}
      />
      <SummaryRow
        label="Admins"
        value={tenant.admins.length.toLocaleString()}
      />
      <SummaryRow
        label="Created"
        value={new Date(tenant.createdAt).toLocaleDateString()}
      />
    </dl>
  </aside>
);
