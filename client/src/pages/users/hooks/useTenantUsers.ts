import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import {
  createTenantUser,
  listTenantUsers,
  updateTenantUser,
  type CreateTenantUserPayload,
  type TenantUser,
  type UpdateTenantUserPayload,
} from "../../../lib/users";

export const useTenantUsers = (enabled: boolean) => {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listTenantUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createUser = async (payload: CreateTenantUserPayload) => {
    const data = await createTenantUser(payload);
    setUsers((current) => [...current, data.user]);
    return data.user;
  };

  const updateUser = async (id: string, payload: UpdateTenantUserPayload) => {
    const data = await updateTenantUser(id, payload);
    setUsers((current) =>
      current.map((user) => (user.id === id ? data.user : user)),
    );
    return data.user;
  };

  return {
    users,
    loading,
    error,
    setError,
    refresh,
    createUser,
    updateUser,
  };
};
