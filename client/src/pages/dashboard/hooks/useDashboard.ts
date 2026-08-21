import { useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import {
  fetchDashboardSummary,
  type DashboardQuery,
  type DashboardSummary,
} from "../../../lib/dashboard";

export const useDashboard = (enabled: boolean, query: DashboardQuery) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (query.preset === "custom" && (!query.from || !query.to)) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const next = await fetchDashboardSummary(query);
        if (!cancelled) {
          setData(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load dashboard",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    query.preset,
    query.from,
    query.to,
    query.categoryId,
    query.departmentId,
    query.vendorId,
    query.paymentMethod,
  ]);

  return { data, loading, error, setError };
};
