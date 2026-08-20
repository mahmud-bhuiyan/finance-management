import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export type RbacProfile = {
  role: string;
  tenantId: string | null;
  permissions: string[];
};

export const useRbacProfile = (enabled: boolean) => {
  const [profile, setProfile] = useState<RbacProfile | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<{ ok: boolean; rbac: RbacProfile }>(
        "/rbac/me",
      );
      setProfile(data.rbac);
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : "Failed to load access");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, loading, error, refresh };
};

export const probeAccess = (path: string) =>
  apiFetch<{ ok: boolean; access: string; message: string }>(path);
