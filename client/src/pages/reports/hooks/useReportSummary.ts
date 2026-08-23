import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import {
  fetchReportSummary,
  type ReportQuery,
  type ReportSummary,
} from "../../../lib/reports";

export const reportQueryKeys = {
  all: ["reports"] as const,
  summary: (query: ReportQuery) =>
    [...reportQueryKeys.all, "summary", query] as const,
};

const canFetchReport = (enabled: boolean, query: ReportQuery) =>
  enabled && !(query.preset === "custom" && (!query.from || !query.to));

export const useReportSummary = (enabled: boolean, query: ReportQuery) => {
  const [manualError, setManualError] = useState<string | null>(null);

  const summaryQuery = useQuery({
    queryKey: reportQueryKeys.summary(query),
    queryFn: () => fetchReportSummary(query),
    enabled: canFetchReport(enabled, query),
  });

  const queryError = summaryQuery.error
    ? toQueryErrorMessage(summaryQuery.error, "Could not load report")
    : null;

  return {
    data: (summaryQuery.data ?? null) as ReportSummary | null,
    loading: summaryQuery.isPending,
    error: manualError ?? queryError,
    setError: setManualError,
  };
};
