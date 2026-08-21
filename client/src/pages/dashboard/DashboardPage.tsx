import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import type { DashboardFilters } from "../../lib/dashboard";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { listSupportItems, type SupportItem } from "../../lib/supportData";
import { DashboardCharts } from "./components/DashboardCharts";
import { DashboardFiltersPanel } from "./components/DashboardFilters";
import { KpiCards } from "./components/KpiCards";
import { useDashboard } from "./hooks/useDashboard";

const todayUtc = () => new Date().toISOString().slice(0, 10);

const monthStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
};

export const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE);
  const canRead =
    !!user &&
    (canWrite || roleCan(user.role, PERMISSIONS.REPORTS_READ)) &&
    !!user.tenant;

  const [filters, setFilters] = useState<DashboardFilters>(() => ({
    preset: "this_month",
    from: monthStartUtc(),
    to: todayUtc(),
    categoryId: "",
    departmentId: "",
    vendorId: "",
  }));
  const [categories, setCategories] = useState<SupportItem[]>([]);
  const [departments, setDepartments] = useState<SupportItem[]>([]);
  const [vendors, setVendors] = useState<SupportItem[]>([]);

  const query = useMemo(
    () => ({
      preset: filters.preset,
      from: filters.from || undefined,
      to: filters.to || undefined,
      categoryId: filters.categoryId || undefined,
      departmentId: filters.departmentId || undefined,
      vendorId: filters.vendorId || undefined,
    }),
    [filters],
  );

  const dashboard = useDashboard(!authLoading && canRead, query);

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
        // Charts still work without dimension pickers.
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

  const patchFilters = (next: Partial<DashboardFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            {canWrite ? "Company admin" : "Read only"}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            KPI cards and a few charts for the filtered expense range. Income
            and net balance stay at zero until the income module (Step 14).
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
            <Link to="/" className="text-teal-800 hover:underline">
              ← Back home
            </Link>
            <Link to="/expenses" className="text-teal-800 hover:underline">
              Expenses
            </Link>
          </div>
          {dashboard.data && (
            <p className="mt-2 text-xs text-slate-500">
              Showing {dashboard.data.filters.from} → {dashboard.data.filters.to}
            </p>
          )}
        </div>

        <DashboardFiltersPanel
          filters={filters}
          categories={categories}
          departments={departments}
          vendors={vendors}
          onChange={patchFilters}
        />

        {dashboard.error && <ErrorBanner message={dashboard.error} />}

        {dashboard.loading && !dashboard.data ? (
          <LoadingState message="Loading dashboard…" />
        ) : dashboard.data ? (
          <>
            <KpiCards kpis={dashboard.data.kpis} />
            <DashboardCharts charts={dashboard.data.charts} />
          </>
        ) : null}
      </main>
    </div>
  );
};
