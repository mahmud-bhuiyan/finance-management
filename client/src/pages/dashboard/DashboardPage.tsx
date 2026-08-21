import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
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
    paymentMethod: "",
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
      paymentMethod: filters.paymentMethod || undefined,
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
    <PageFrame maxWidth="max-w-6xl">
      <PageHeader
        kicker={canWrite ? "Company admin" : "Read only"}
        title="Dashboard"
        description="KPI cards plus line, area, pie, doughnut, bar, and stacked charts. Filter by period, category, department, vendor, or payment method. Net Balance is Income − Expense."
      >
        {dashboard.data ? (
          <p className="mt-2 text-xs text-slate-500">
            Showing {dashboard.data.filters.from} → {dashboard.data.filters.to}
          </p>
        ) : null}
      </PageHeader>

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
    </PageFrame>
  );
};
