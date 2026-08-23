import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";
import { useActiveSupportPickers } from "../../hooks/useActiveSupportPickers";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import type {
  CreateExpensePayload,
  Expense,
  ExpenseListFilters,
} from "../../lib/expenses";
import { currentYearMonth } from "../../lib/expenses";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import type { SupportItem } from "../../lib/supportData";
import { ExpenseAttachments } from "./components/ExpenseAttachments";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { ExpenseMonthPicker } from "./components/ExpenseMonthPicker";
import { useExpenses } from "./hooks/useExpenses";

export const ExpensesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const canWrite =
    !!user && roleCan(user.role, PERMISSIONS.FINANCE_WRITE);
  const canRead =
    !!user &&
    (canWrite || roleCan(user.role, PERMISSIONS.REPORTS_READ)) &&
    !!user.tenant;
  const initial = useMemo(() => currentYearMonth(), []);
  const [filters, setFilters] = useState<ExpenseListFilters>({
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
  const [editing, setEditing] = useState<Expense | null>(null);
  const expensesApi = useExpenses(!authLoading && canRead, filters);
  const supportPickers = useActiveSupportPickers(!authLoading && canRead);
  const categories = supportPickers.categories;
  const departments = supportPickers.departments;
  const vendors = supportPickers.vendors;

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
    current: Expense["category"],
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

  const patchFilters = (next: Partial<ExpenseListFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const handleSubmit = async (payload: CreateExpensePayload) => {
    setSubmitting(true);
    expensesApi.setError(null);
    try {
      if (editing) {
        await expensesApi.updateExpense(editing.id, payload);
        setEditing(null);
      } else {
        const created = await expensesApi.createExpense(payload);
        setEditing(created);
      }
    } catch (error) {
      expensesApi.setError(
        error instanceof ApiError ? error.message : "Could not save expense",
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Soft-delete this expense? It will leave the list.")) {
      return;
    }
    setBusyId(id);
    expensesApi.setError(null);
    try {
      await expensesApi.deleteExpense(id);
      if (editing?.id === id) {
        setEditing(null);
      }
    } catch (error) {
      expensesApi.setError(
        error instanceof ApiError ? error.message : "Could not delete expense",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageFrame>
      <PageHeader
        kicker={canWrite ? "Company admin" : "Read only"}
        title="Expenses"
        description="Filter and page the list, then attach receipts while editing an expense. Uploads stay on the server and download only through the API."
      />

        <ExpenseMonthPicker
          year={filters.year}
          month={filters.month}
          onChange={(next) => {
            patchFilters({ year: next.year, month: next.month, page: 1 });
            setEditing(null);
          }}
        />

        <ExpenseFilters
          filters={filters}
          categories={categories}
          departments={departments}
          vendors={vendors}
          onChange={patchFilters}
        />

        {expensesApi.error && <ErrorBanner message={expensesApi.error} />}

        {canWrite && (
          <>
            <ExpenseForm
              fields={expensesApi.fields}
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
              <ExpenseAttachments
                expenseId={editing.id}
                canWrite={canWrite}
              />
            )}
          </>
        )}

        {expensesApi.loading ? (
          <LoadingState message="Loading expenses…" />
        ) : (
          <ExpenseList
            expenses={expensesApi.expenses}
            fields={expensesApi.fields}
            meta={expensesApi.meta}
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
