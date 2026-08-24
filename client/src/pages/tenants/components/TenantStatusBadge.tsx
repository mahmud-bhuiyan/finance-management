import type { Tenant } from "../lib/tenantApi";
import { statusBadgeClass } from "../lib/tenantDisplay";

type TenantStatusBadgeProps = {
  status: Tenant["status"];
  className?: string;
};

export const TenantStatusBadge = ({
  status,
  className = "inline-flex rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide uppercase",
}: TenantStatusBadgeProps) => (
  <span className={`${className} ${statusBadgeClass[status]}`}>{status}</span>
);
