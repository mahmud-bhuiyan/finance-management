import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import type {
  CreateTenantUserPayload,
  TenantUserRole,
  TenantUserStatus,
} from "../../lib/users";
import { CreateUserForm } from "./components/CreateUserForm";
import { UserList } from "./components/UserList";
import { useTenantUsers } from "./hooks/useTenantUsers";

export const UsersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canManage =
    !!user &&
    roleCan(user.role, PERMISSIONS.USERS_MANAGE) &&
    !!user.tenant;
  const usersApi = useTenantUsers(!authLoading && canManage);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManage) {
    return <Navigate to="/" replace />;
  }

  const handleCreate = async (payload: CreateTenantUserPayload) => {
    setSubmitting(true);
    usersApi.setError(null);
    try {
      await usersApi.createUser(payload);
    } catch (error) {
      usersApi.setError(
        error instanceof ApiError ? error.message : "Could not create user",
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const runUpdate = async (
    id: string,
    action: () => Promise<unknown>,
  ) => {
    setBusyId(id);
    usersApi.setError(null);
    try {
      await action();
    } catch (error) {
      usersApi.setError(
        error instanceof ApiError ? error.message : "Update failed",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleChangeRole = (id: string, role: TenantUserRole) => {
    void runUpdate(id, () => usersApi.updateUser(id, { role }));
  };

  const handleChangeStatus = (id: string, status: TenantUserStatus) => {
    void runUpdate(id, () => usersApi.updateUser(id, { status }));
  };

  return (
    <PageFrame>
      <PageHeader
        kicker="Company admin"
        title="Users"
        description={`Invite company members, change roles, and deactivate accounts for ${user.tenant?.name ?? "your company"}.`}
      />

        {usersApi.error && <ErrorBanner message={usersApi.error} />}

        <CreateUserForm submitting={submitting} onSubmit={handleCreate} />

        {usersApi.loading && usersApi.users.length === 0 ? (
          <LoadingState message="Loading users…" />
        ) : (
          <UserList
            users={usersApi.users}
            currentUserId={user.id}
            busyId={busyId}
            onChangeRole={handleChangeRole}
            onChangeStatus={handleChangeStatus}
          />
        )}
    </PageFrame>
  );
};
