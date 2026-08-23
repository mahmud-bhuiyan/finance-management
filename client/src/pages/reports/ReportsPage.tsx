import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { useActiveSupportPickers } from "../../hooks/useActiveSupportPickers";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import type { ReportFilters } from "../../lib/reports";
import { ReportFiltersPanel } from "./components/ReportFilters";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportTables } from "./components/ReportTables";
import { useReportExport } from "./hooks/useReportExport";
import { useReportSummary } from "./hooks/useReportSummary";

const todayUtc = () => new Date().toISOString().slice(0, 10);

const monthStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
};

type ExportKind = "csv" | "xlsx" | "pdf";

export const ReportsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE);
  const canRead =
    !!user &&
    (canWrite || roleCan(user.role, PERMISSIONS.REPORTS_READ)) &&
    !!user.tenant;

  const [filters, setFilters] = useState<ReportFilters>(() => ({
    preset: "this_month",
    from: monthStartUtc(),
    to: todayUtc(),
    categoryId: "",
    departmentId: "",
    vendorId: "",
    paymentMethod: "",
    type: "ALL",
  }));
  const supportPickers = useActiveSupportPickers(!authLoading && canRead);
  const {
    exportReport,
    exporting,
    exportError,
    resetExportError,
  } = useReportExport();
  const [validationError, setValidationError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      preset: filters.preset,
      from: filters.from || undefined,
      to: filters.to || undefined,
      categoryId: filters.categoryId || undefined,
      departmentId: filters.departmentId || undefined,
      vendorId: filters.vendorId || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      type: filters.type,
    }),
    [filters],
  );

  const report = useReportSummary(!authLoading && canRead, query);

  if (authLoading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canRead) {
    return <Navigate to="/" replace />;
  }

  const patchFilters = (next: Partial<ReportFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const handleExport = async (kind: ExportKind) => {
    if (filters.preset === "custom" && (!filters.from || !filters.to)) {
      setValidationError("Custom range needs from and to dates.");
      return;
    }
    setValidationError(null);
    resetExportError();
    try {
      await exportReport({ kind, query });
    } catch {
      // Error message is shown from hook state.
    }
  };

  const busy = exporting !== null || report.loading;

  return (
    <PageFrame>
      <PageHeader
        kicker={canWrite ? "Company admin" : "Read only"}
        title="Reports"
        description="Monthly and dimension breakdowns for the selected period, plus CSV, Excel, and PDF export of matching data."
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void handleExport("csv")}
            >
              {exporting === "csv" ? "Downloading…" : "Download CSV"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void handleExport("xlsx")}
            >
              {exporting === "xlsx" ? "Downloading…" : "Download Excel"}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleExport("pdf")}
            >
              {exporting === "pdf" ? "Downloading…" : "Download PDF"}
            </Button>
          </>
        }
      >
        {report.data ? (
          <p className="mt-2 text-xs text-slate-500">
            Showing {report.data.filters.from} → {report.data.filters.to}
          </p>
        ) : null}
      </PageHeader>

        <ReportFiltersPanel
          filters={filters}
          categories={supportPickers.categories}
          departments={supportPickers.departments}
          vendors={supportPickers.vendors}
          onChange={patchFilters}
        />

        {(report.error || exportError || validationError) && (
          <ErrorBanner message={report.error ?? exportError ?? validationError ?? ""} />
        )}

        {report.loading && !report.data ? (
          <LoadingState message="Loading report…" />
        ) : report.data ? (
          <>
            <ReportSummaryCards summary={report.data.summary} />
            <ReportTables data={report.data} />
          </>
        ) : null}
    </PageFrame>
  );
};
