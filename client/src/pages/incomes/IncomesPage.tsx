import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import type {
  CreateIncomePayload,
  Income,
  IncomeListFilters,
} from "../../lib/incomes";
import { currentYearMonth } from "../../lib/incomes";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { listSupportItems, type SupportItem } from "../../lib/supportData";
import { IncomeAttachments } from "./components/IncomeAttachments";
import { IncomeFilters } from "./components/IncomeFilters";
import { IncomeForm } from "./components/IncomeForm";
import { IncomeList } from "./components/IncomeList";
import { IncomeMonthPicker } from "./components/IncomeMonthPicker";
import { useIncomes } from "./hooks/useIncomes";

export const IncomesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE);
  const canRead =
    !!user &&
    (canWrite || roleCan(user.role, PERMISSIONS.REPORTS_READ)) &&
    !!user.tenant;
  const initial = useMemo(() => currentYearMonth(), []);
  const [filters, setFilters] = useState<IncomeListFilters>({
    year: initial.year,
    month: initial.month,
    q: "",
    categoryId: "",
    departmentId: "",
    vendorId: "",
    paymentMethod: "",
    page: 1,
    pageSize: 20,
    sortBy: "occurredOn",
    sortDir: "desc",
  });
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Income | null>(null);
  const [categories, setCategories] = useState<SupportItem[]>([]);
  const [departments, setDepartments] = useState<SupportItem[]>([]);
  const [vendors, setVendors] = useState<SupportItem[]>([]);
  const incomesApi = useIncomes(!authLoading && canRead, filters);

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
        // Income list can still work without pickers; form shows empty selects.
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

  const defaultDate = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;

  const withCurrent = (
    options: SupportItem[],
    current: Income["category"],
  ): SupportItem[] => {
    if (!current || options.some((item) => item.id === current.id)) {
      return options;
    }
    return [
      {
        id: current.id,
        tenantId: user.tenant?.id ?? "",
        name: `${current.name} (inactive)`,
        notes: null,
        active: false,
        createdAt: "",
        updatedAt: "",
      },
      ...options,
    ];
  };

  const categoryOptions = withCurrent(categories, editing?.category ?? null);
  const departmentOptions = withCurrent(
    departments,
    editing?.department ?? null,
  );
  const vendorOptions = withCurrent(vendors, editing?.vendor ?? null);

  const patchFilters = (next: Partial<IncomeListFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const handleSubmit = async (payload: CreateIncomePayload) => {
    setSubmitting(true);
    incomesApi.setError(null);
    try {
      if (editing) {
        await incomesApi.updateIncome(editing.id, payload);
        setEditing(null);
      } else {
        const created = await incomesApi.createIncome(payload);
        setEditing(created);
      }
    } catch (error) {
      incomesApi.setError(
        error instanceof ApiError ? error.message : "Could not save income",
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Soft-delete this income? It will leave the list.")) {
      return;
    }
    setBusyId(id);
    incomesApi.setError(null);
    try {
      await incomesApi.deleteIncome(id);
      if (editing?.id === id) {
        setEditing(null);
      }
    } catch (error) {
      incomesApi.setError(
        error instanceof ApiError ? error.message : "Could not delete income",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageFrame>
      <PageHeader
        kicker={canWrite ? "Company admin" : "Read only"}
        title="Income"
        description="Record income on the shared ledger. Categories, departments, and customers reuse Categories & vendors. Totals feed Net Balance on the dashboard."
      />

        <IncomeMonthPicker
          year={filters.year}
          month={filters.month}
          onChange={(next) => {
            patchFilters({ year: next.year, month: next.month, page: 1 });
            setEditing(null);
          }}
        />

        <IncomeFilters
          filters={filters}
          categories={categories}
          departments={departments}
          vendors={vendors}
          onChange={patchFilters}
        />

        {incomesApi.error && <ErrorBanner message={incomesApi.error} />}

        {canWrite && (
          <>
            <IncomeForm
              fields={incomesApi.fields}
              categories={categoryOptions}
              departments={departmentOptions}
              vendors={vendorOptions}
              submitting={submitting}
              editing={editing}
              defaultDate={defaultDate}
              onSubmit={handleSubmit}
              onCancelEdit={() => setEditing(null)}
            />
            {editing && (
              <IncomeAttachments
                incomeId={editing.id}
                canWrite={canWrite}
                listAttachments={incomesApi.listAttachments}
                uploadAttachment={incomesApi.uploadAttachment}
                deleteAttachment={incomesApi.deleteAttachment}
              />
            )}
          </>
        )}

        {incomesApi.loading ? (
          <LoadingState message="Loading incomes…" />
        ) : (
          <IncomeList
            incomes={incomesApi.incomes}
            fields={incomesApi.fields}
            meta={incomesApi.meta}
            canWrite={canWrite}
            busyId={busyId}
            onEdit={setEditing}
            onDelete={handleDelete}
            onPageChange={(page) => patchFilters({ page })}
          />
        )}
    </PageFrame>
  );
};
