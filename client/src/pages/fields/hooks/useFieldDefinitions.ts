import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../../lib/api";
import type {
  CreateFieldPayload,
  FieldDefinition,
  FieldTarget,
  UpdateFieldPayload,
} from "../../../lib/fields";
import { sortFields } from "../../../lib/fields";

export const useFieldDefinitions = (enabled: boolean, target: FieldTarget) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await apiFetch<{ fields: FieldDefinition[] }>(
      `/fields?target=${target}`,
    );
    setFields(sortFields(data.fields));
  }, [target]);

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
          err instanceof ApiError ? err.message : "Failed to load fields",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, refresh]);

  const createField = async (payload: CreateFieldPayload) => {
    const data = await apiFetch<{ field: FieldDefinition }>(
      "/fields",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    setFields((current) => sortFields([...current, data.field]));
    return data.field;
  };

  const updateField = async (id: string, payload: UpdateFieldPayload) => {
    const data = await apiFetch<{ field: FieldDefinition }>(
      `/fields/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
    setFields((current) =>
      sortFields(
        current.map((field) => (field.id === id ? data.field : field)),
      ),
    );
    return data.field;
  };

  const deleteField = async (id: string) => {
    await apiFetch(`/fields/${id}`, { method: "DELETE" });
    setFields((current) => current.filter((field) => field.id !== id));
  };

  const moveField = async (id: string, direction: "up" | "down") => {
    const index = fields.findIndex((field) => field.id === id);
    if (index < 0) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= fields.length) {
      return;
    }

    const current = fields[index];
    const swap = fields[swapIndex];

    await updateField(current.id, { sortOrder: swap.sortOrder });
    await updateField(swap.id, { sortOrder: current.sortOrder });
    await refresh();
  };

  return {
    fields,
    loading,
    error,
    setError,
    refresh,
    createField,
    updateField,
    deleteField,
    moveField,
  };
};
