import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
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
import { SupportItemForm } from "./components/SupportItemForm";
import { SupportItemList } from "./components/SupportItemList";
import { useSupportData } from "./hooks/useSupportData";

export const ExpenseSupportPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE) && !!user.tenant;
  const [kind, setKind] = useState<SupportKind>("category");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SupportItem | null>(null);
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

  const handleSubmit = async (payload: CreateSupportPayload) => {
    setSubmitting(true);
    supportApi.setError(null);
    try {
      if (editing) {
        await supportApi.updateItem(editing.id, payload);
        setEditing(null);
      } else {
        await supportApi.createItem(payload);
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
        setEditing(null);
      }
    } catch (error) {
      supportApi.setError(
        error instanceof ApiError ? error.message : "Action failed",
      );
    } finally {
      setBusyId(null);
    }
  };

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
                setEditing(null);
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

        <SupportItemForm
          kind={kind}
          submitting={submitting}
          editing={editing}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditing(null)}
        />

        {supportApi.loading ? (
          <LoadingState message={`Loading ${supportKindLabel(kind).toLowerCase()}…`} />
        ) : (
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-slate-900">
              {supportKindLabel(kind)}
            </h2>
            <SupportItemList
              items={supportApi.items}
              busyId={busyId}
              emptyLabel={`No ${supportKindLabel(kind).toLowerCase()} yet. Add one above.`}
              onEdit={setEditing}
              onToggleActive={(id, active) =>
                runAction(id, () => supportApi.updateItem(id, { active }))
              }
              onDelete={(id) => {
                if (
                  !window.confirm(
                    `Soft-delete this ${supportKindSingular(kind).toLowerCase()}? It will leave the list.`,
                  )
                ) {
                  return Promise.resolve();
                }
                return runAction(id, () => supportApi.removeItem(id));
              }}
            />
          </section>
        )}
    </PageFrame>
  );
};
