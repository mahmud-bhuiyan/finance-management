import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import type { CreateFieldPayload, FieldTarget } from "../../lib/fields";
import { FIELD_TARGETS, targetLabel } from "../../lib/fields";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { CreateFieldForm } from "./components/CreateFieldForm";
import { FieldDefinitionList } from "./components/FieldDefinitionList";
import { FieldPreviewPanel } from "./components/FieldPreviewPanel";
import { useFieldDefinitions } from "./hooks/useFieldDefinitions";

export const FieldsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canManageFields =
    !!user && roleCan(user.role, PERMISSIONS.FIELDS_MANAGE);
  const [target, setTarget] = useState<FieldTarget>("EXPENSE");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fieldsApi = useFieldDefinitions(!authLoading && canManageFields, target);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageFields) {
    return <Navigate to="/" replace />;
  }

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    fieldsApi.setError(null);
    try {
      await action();
    } catch (error) {
      fieldsApi.setError(
        error instanceof ApiError ? error.message : "Field action failed",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (payload: CreateFieldPayload) => {
    setCreating(true);
    fieldsApi.setError(null);
    try {
      await fieldsApi.createField(payload);
    } catch (error) {
      fieldsApi.setError(
        error instanceof ApiError ? error.message : "Could not create field",
      );
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Company admin
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            Custom fields
          </h1>
          <p className="mt-2 text-slate-600">
            Configure dynamic fields for expenses and income without schema
            changes. Changes are tenant-scoped and audited on the server.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline"
          >
            ← Back home
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {FIELD_TARGETS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTarget(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                target === item
                  ? "bg-teal-700 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {targetLabel(item)}
            </button>
          ))}
        </div>

        {fieldsApi.error && <ErrorBanner message={fieldsApi.error} />}

        <CreateFieldForm
          target={target}
          submitting={creating}
          onSubmit={handleCreate}
        />

        {fieldsApi.loading ? (
          <LoadingState message="Loading fields…" />
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-medium text-slate-900">
                {targetLabel(target)} fields
              </h2>
              <FieldDefinitionList
                fields={fieldsApi.fields}
                busyId={busyId}
                onToggleEnabled={(id, enabled) =>
                  runAction(id, () => fieldsApi.updateField(id, { enabled }))
                }
                onMove={(id, direction) =>
                  runAction(id, () => fieldsApi.moveField(id, direction))
                }
                onDelete={(id) =>
                  runAction(id, () => fieldsApi.deleteField(id))
                }
                onUpdateLabel={(id, label) =>
                  runAction(id, () => fieldsApi.updateField(id, { label }))
                }
              />
            </section>

            <FieldPreviewPanel fields={fieldsApi.fields} />
          </>
        )}
      </main>
    </div>
  );
};
