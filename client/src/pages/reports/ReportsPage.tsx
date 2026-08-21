import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import {
  downloadReportCsv,
  downloadReportExcel,
  downloadReportPdf,
  type ReportFilters,
} from "../../lib/reports";
import { listSupportItems, type SupportItem } from "../../lib/supportData";
import { ReportFiltersPanel } from "./components/ReportFilters";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportTables } from "./components/ReportTables";
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
  const [categories, setCategories] = useState<SupportItem[]>([]);
  const [departments, setDepartments] = useState<SupportItem[]>([]);
  const [vendors, setVendors] = useState<SupportItem[]>([]);
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!canRead) {
      return;
    }
    void (async () => {
      try {
        const [nextCategories, nextDepartments, nextVendors] = await Promise.all([
          listSupportItems("category", { active: true }),
          listSupportItems("department", { active: true }),
          listSupportItems("vendor", { active: true }),
        ]);
        setCategories(nextCategories);
        setDepartments(nextDepartments);
        setVendors(nextVendors);
      } catch {
        // Tables still work without dimension pickers.
      }
    })();
  }, [canRead]);

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
      setExportError("Custom range needs from and to dates.");
      return;
    }
    setExporting(kind);
    setExportError(null);
    try {
      if (kind === "csv") {
        await downloadReportCsv(query);
      } else if (kind === "xlsx") {
        await downloadReportExcel(query);
      } else {
        await downloadReportPdf(query);
      }
    } catch (err) {
      const label =
        kind === "csv" ? "CSV" : kind === "xlsx" ? "Excel" : "PDF";
      setExportError(
        err instanceof ApiError ? err.message : `${label} download failed`,
      );
    } finally {
      setExporting(null);
    }
  };

  const busy = exporting !== null || report.loading;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            {canWrite ? "Company admin" : "Read only"}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            Reports
          </h1>
          <p className="mt-2 text-slate-600">
            Monthly and dimension breakdowns for the selected period, plus CSV,
            Excel, and PDF export of matching data.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-teal-800 hover:underline">
              ← Back home
            </Link>
            <Link to="/dashboard" className="text-teal-800 hover:underline">
              Dashboard
            </Link>
            <Link to="/expenses" className="text-teal-800 hover:underline">
              Expenses
            </Link>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleExport("csv")}
            >
              {exporting === "csv" ? "Downloading…" : "Download CSV"}
            </Button>
            <Button
              type="button"
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
          </div>
          {report.data && (
            <p className="mt-2 text-xs text-slate-500">
              Showing {report.data.filters.from} → {report.data.filters.to}
            </p>
          )}
        </div>

        <ReportFiltersPanel
          filters={filters}
          categories={categories}
          departments={departments}
          vendors={vendors}
          onChange={patchFilters}
        />

        {(report.error || exportError) && (
          <ErrorBanner message={report.error ?? exportError ?? ""} />
        )}

        {report.loading && !report.data ? (
          <LoadingState message="Loading report…" />
        ) : report.data ? (
          <>
            <ReportSummaryCards summary={report.data.summary} />
            <ReportTables data={report.data} />
          </>
        ) : null}
      </main>
    </div>
  );
};
