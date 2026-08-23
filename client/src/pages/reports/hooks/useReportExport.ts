import { useMutation } from "@tanstack/react-query";
import { ApiError } from "../../../lib/api";
import { toQueryErrorMessage } from "../../../lib/queryClient";
import {
  downloadReportCsv,
  downloadReportExcel,
  downloadReportPdf,
  type ReportQuery,
} from "../../../lib/reports";

export type ReportExportKind = "csv" | "xlsx" | "pdf";

const exportReport = (kind: ReportExportKind, query: ReportQuery) => {
  switch (kind) {
    case "csv":
      return downloadReportCsv(query);
    case "xlsx":
      return downloadReportExcel(query);
    case "pdf":
      return downloadReportPdf(query);
  }
};

const exportLabel = (kind: ReportExportKind) => {
  switch (kind) {
    case "csv":
      return "CSV";
    case "xlsx":
      return "Excel";
    case "pdf":
      return "PDF";
  }
};

export const useReportExport = () => {
  const mutation = useMutation({
    mutationFn: ({
      kind,
      query,
    }: {
      kind: ReportExportKind;
      query: ReportQuery;
    }) => exportReport(kind, query),
  });

  const exportError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : toQueryErrorMessage(
          mutation.error,
          `${exportLabel(mutation.variables?.kind ?? "csv")} download failed`,
        )
    : null;

  return {
    exportReport: mutation.mutateAsync,
    exporting: mutation.isPending ? (mutation.variables?.kind ?? null) : null,
    exportError,
    resetExportError: mutation.reset,
  };
};
