import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import { useConfirmAction } from "../../hooks/useConfirmAction";
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
  const confirm = useConfirmAction();

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
      throw error;
    } finally {
      setBusyId(null);
    }
  };

  const handleChangeRole = (id: string, role: TenantUserRole) => {
    void runUpdate(id, () => usersApi.updateUser(id, { role }));
  };

  const userLabel = (id: string) =>
    usersApi.users.find((item) => item.id === id)?.email ?? "user";

  const handleChangeStatus = (id: string, status: TenantUserStatus) => {
    const email = userLabel(id);

    if (status === "ACTIVE") {
      confirm.requestConfirm({
        title: `Reactivate ${email}?`,
        description: "They will be able to sign in again once reactivated.",
        confirmLabel: "Reactivate",
        variant: "primary",
        onConfirm: () =>
          runUpdate(id, () => usersApi.updateUser(id, { status: "ACTIVE" })),
      });
      return;
    }

    confirm.requestConfirm({
      title: `Deactivate ${email}?`,
      description: "They will lose access until you reactivate their account.",
      confirmLabel: "Deactivate",
      variant: "danger",
      onConfirm: () =>
        runUpdate(id, () => usersApi.updateUser(id, { status: "INACTIVE" })),
    });
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

      <ConfirmModal
        open={!!confirm.pending}
        title={confirm.pending?.title ?? ""}
        description={confirm.pending?.description}
        confirmLabel={confirm.pending?.confirmLabel}
        cancelLabel={confirm.pending?.cancelLabel}
        variant={confirm.pending?.variant}
        submitting={confirm.submitting}
        onClose={confirm.closeConfirm}
        onConfirm={confirm.confirm}
      />
    </PageFrame>
  );
};
