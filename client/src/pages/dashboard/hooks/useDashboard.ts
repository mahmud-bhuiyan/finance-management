import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchDashboardSummary,
  type DashboardQuery,
  type DashboardSummary,
} from "../../../lib/dashboard";
import { toQueryErrorMessage } from "../../../lib/queryClient";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: (query: DashboardQuery) =>
    [...dashboardQueryKeys.all, "summary", query] as const,
};

const canFetchDashboard = (enabled: boolean, query: DashboardQuery) =>
  enabled && !(query.preset === "custom" && (!query.from || !query.to));

export const useDashboard = (enabled: boolean, query: DashboardQuery) => {
  const [manualError, setManualError] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: dashboardQueryKeys.summary(query),
    queryFn: () => fetchDashboardSummary(query),
    enabled: canFetchDashboard(enabled, query),
  });

  const queryError = summaryQuery.error
    ? toQueryErrorMessage(summaryQuery.error, "Could not load dashboard")
    : null;

  return {
    data: (summaryQuery.data ?? null) as DashboardSummary | null,
    loading: summaryQuery.isPending,
    error: manualError ?? queryError,
    setError: setManualError,
  };
};
