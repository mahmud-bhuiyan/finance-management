import type { Tenant, TenantAdmin } from "./tenantApi";

export const statusBadgeClass: Record<Tenant["status"], string> = {
  ACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-(--fms-accent)",
  INACTIVE:
    "bg-[color-mix(in_srgb,var(--fms-muted)_18%,transparent)] text-(--fms-muted)",
};

export const tenantInitials = (tenant: Tenant) => {
  const parts = tenant.name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return tenant.name.slice(0, 2).toUpperCase();
};

export const adminInitials = (admin: TenantAdmin) => {
  const source = admin.name?.trim() || admin.email;
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};
