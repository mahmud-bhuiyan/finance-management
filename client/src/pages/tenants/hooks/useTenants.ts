import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../../lib/api";

export type TenantAdmin = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string | null;
  createdAt: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  admins: TenantAdmin[];
};

export const useTenants = (enabled: boolean) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiFetch<{ tenants: Tenant[] }>(
      "/tenants",
    );
    setTenants(data.tenants);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load companies",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, refresh]);

  const createTenant = async (name: string) => {
    const data = await apiFetch<{ tenant: Tenant }>(
      "/tenants",
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );
    setTenants((current) => [data.tenant, ...current]);
    return data.tenant;
  };

  const updateTenantStatus = async (id: string, status: Tenant["status"]) => {
    const data = await apiFetch<{ tenant: Tenant }>(
      `/tenants/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
    setTenants((current) =>
      current.map((tenant) => (tenant.id === id ? data.tenant : tenant)),
    );
  };

  const createAdmin = async (
    tenantId: string,
    input: { email: string; password: string; name?: string },
  ) => {
    const data = await apiFetch<{ admin: TenantAdmin }>(
      `/tenants/${tenantId}/admins`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    setTenants((current) =>
      current.map((tenant) =>
        tenant.id === tenantId
          ? { ...tenant, admins: [...tenant.admins, data.admin] }
          : tenant,
      ),
    );
  };

  return {
    tenants,
    loading,
    error,
    setError,
    createTenant,
    updateTenantStatus,
    createAdmin,
  };
};
