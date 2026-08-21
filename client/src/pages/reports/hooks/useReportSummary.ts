import { useEffect, useState } from "react";
import { ApiError } from "../../../lib/api";
import {
  fetchReportSummary,
  type ReportQuery,
  type ReportSummary,
} from "../../../lib/reports";

export const useReportSummary = (enabled: boolean, query: ReportQuery) => {
  const [data, setData] = useState<ReportSummary | null>(null);
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
        const next = await fetchReportSummary(query);
        if (!cancelled) {
          setData(next);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load report",
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
