import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorBanner } from "../../components/feedback/ErrorBanner";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../lib/api";
import type { CreateExpensePayload, Expense } from "../../lib/expenses";
import { currentYearMonth } from "../../lib/expenses";
import { PERMISSIONS, roleCan } from "../../lib/permissions";
import { listSupportItems, type SupportItem } from "../../lib/supportData";
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
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<SupportItem[]>([]);
  const [departments, setDepartments] = useState<SupportItem[]>([]);
  const [vendors, setVendors] = useState<SupportItem[]>([]);
  const expensesApi = useExpenses(!authLoading && canRead, year, month);

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
        // Expense list can still work without pickers; form shows empty selects.
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

  const defaultDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const handleSubmit = async (payload: CreateExpensePayload) => {
    setSubmitting(true);
    expensesApi.setError(null);
    try {
      if (editing) {
        await expensesApi.updateExpense(editing.id, payload);
        setEditing(null);
      } else {
        await expensesApi.createExpense(payload);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            {canWrite ? "Company admin" : "Read only"}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-950">
            Expenses
          </h1>
          <p className="mt-2 text-slate-600">
            Core expense records use date and amount. Optional category,
            department, and vendor come from support data. Custom fields come
            from the field builder.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
            <Link to="/" className="text-teal-800 hover:underline">
              ← Back home
            </Link>
            {canWrite && (
              <Link to="/expense-support" className="text-teal-800 hover:underline">
                Manage categories / vendors
              </Link>
            )}
          </div>
        </div>

        <ExpenseMonthPicker
          year={year}
          month={month}
          onChange={(next) => {
            setYear(next.year);
            setMonth(next.month);
            setEditing(null);
          }}
        />

        {expensesApi.error && <ErrorBanner message={expensesApi.error} />}

        {canWrite && (
          <ExpenseForm
            fields={expensesApi.fields}
            categories={categories}
            departments={departments}
            vendors={vendors}
            submitting={submitting}
            editing={editing}
            defaultDate={defaultDate}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditing(null)}
          />
        )}

        {expensesApi.loading ? (
          <LoadingState message="Loading expenses…" />
        ) : (
          <ExpenseList
            expenses={expensesApi.expenses}
            fields={expensesApi.fields}
            canWrite={canWrite}
            busyId={busyId}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
};
