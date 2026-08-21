import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import {
  createSupportItem,
  deleteSupportItem,
  listSupportItems,
  updateSupportItem,
  type CreateSupportPayload,
  type SupportItem,
  type SupportKind,
  type UpdateSupportPayload,
} from "../../../lib/supportData";

export const useSupportData = (enabled: boolean, kind: SupportKind) => {
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await listSupportItems(kind, { includeInactive: true });
    setItems(data);
  }, [kind]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void (async () => {
      try {
        setError(null);
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load items",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, refresh]);

  const createItem = async (payload: CreateSupportPayload) => {
    const item = await createSupportItem(kind, payload);
    await refresh();
    return item;
  };

  const updateItem = async (id: string, payload: UpdateSupportPayload) => {
    const item = await updateSupportItem(kind, id, payload);
    await refresh();
    return item;
  };

  const removeItem = async (id: string) => {
    await deleteSupportItem(kind, id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return {
    items,
    loading,
    error,
    setError,
    refresh,
    createItem,
    updateItem,
    removeItem,
  };
};
