import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import { useConfirmAction } from "../../hooks/useConfirmAction";
import { ApiError } from "../../lib/api";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import {
  SUPPORT_KINDS,
  supportKindLabel,
  supportKindSingular,
  type CreateSupportPayload,
  type SupportItem,
  type SupportKind,
} from "../../lib/supportData";
import { SupportItemList } from "./components/SupportItemList";
import { SupportItemModal } from "./components/SupportItemModal";
import { useSupportData } from "./hooks/useSupportData";

export const ExpenseSupportPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE) && !!user.tenant;
  const [kind, setKind] = useState<SupportKind>("category");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SupportItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const confirm = useConfirmAction();
  const supportApi = useSupportData(!authLoading && canWrite, kind);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canWrite) {
    return <Navigate to="/" replace />;
  }

  const closeFormModal = () => {
    setEditing(null);
    setAddOpen(false);
  };

  const handleSubmit = async (payload: CreateSupportPayload) => {
    setSubmitting(true);
    supportApi.setError(null);
    try {
      if (editing) {
        await supportApi.updateItem(editing.id, payload);
        closeFormModal();
      } else {
        await supportApi.createItem(payload);
        closeFormModal();
      }
    } catch (error) {
      supportApi.setError(
        error instanceof ApiError ? error.message : "Could not save item",
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    supportApi.setError(null);
    try {
      await action();
      if (editing?.id === id) {
        closeFormModal();
      }
    } catch (error) {
      supportApi.setError(
        error instanceof ApiError ? error.message : "Action failed",
      );
      throw error;
    } finally {
      setBusyId(null);
    }
  };

  const itemLabel = (id: string) =>
    supportApi.items.find((item) => item.id === id)?.name ??
    supportKindSingular(kind).toLowerCase();

  const formModalOpen = addOpen || editing !== null;

  return (
    <PageFrame>
      <PageHeader
        kicker="Company admin"
        title="Categories & vendors"
        description="Manage categories, departments, and vendors used when recording expenses and income. Soft-deleted items leave history intact."
      />

        <div className="flex flex-wrap gap-2">
          {SUPPORT_KINDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setKind(item);
                closeFormModal();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                kind === item
                  ? "bg-teal-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {supportKindLabel(item)}
            </button>
          ))}
        </div>

        {supportApi.error && <ErrorBanner message={supportApi.error} />}

        {supportApi.loading ? (
          <LoadingState message={`Loading ${supportKindLabel(kind).toLowerCase()}…`} />
        ) : (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-slate-900">
                {supportKindLabel(kind)}
              </h2>
              <Button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setAddOpen(true);
                }}
              >
                Add {supportKindSingular(kind).toLowerCase()}
              </Button>
            </div>
            <SupportItemList
              items={supportApi.items}
              kind={kind}
              busyId={busyId}
              emptyLabel={`No ${supportKindLabel(kind).toLowerCase()} yet.`}
              onEdit={(item) => {
                setAddOpen(false);
                setEditing(item);
              }}
              onToggleActive={(id, active) => {
                const name = itemLabel(id);
                confirm.requestConfirm({
                  title: active
                    ? `Activate ${name}?`
                    : `Deactivate ${name}?`,
                  description: active
                    ? "This item will appear in expense and income pickers again."
                    : "This item will be hidden from pickers but existing records keep their link.",
                  confirmLabel: active ? "Activate" : "Deactivate",
                  variant: active ? "primary" : "danger",
                  onConfirm: () =>
                    runAction(id, () => supportApi.updateItem(id, { active })),
                });
              }}
              onDelete={(id) => {
                const name = itemLabel(id);
                confirm.requestConfirm({
                  title: `Soft-delete ${name}?`,
                  description: `This ${supportKindSingular(kind).toLowerCase()} will leave the list but history stays intact.`,
                  confirmLabel: "Delete",
                  variant: "danger",
                  onConfirm: () =>
                    runAction(id, () => supportApi.removeItem(id)),
                });
              }}
            />
          </section>
        )}

      <SupportItemModal
        open={formModalOpen}
        kind={kind}
        submitting={submitting}
        editing={editing}
        onSubmit={handleSubmit}
        onClose={closeFormModal}
      />

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
