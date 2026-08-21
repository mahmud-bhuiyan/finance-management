import { Button } from "../../../components/ui/Button";
import type { Expense, ExpenseListMeta } from "../../../lib/expenses";
import { formatExpenseAmount } from "../../../lib/expenses";
import type { FieldDefinition } from "../../../lib/fields";
import { paymentMethodLabel } from "../../../lib/paymentMethods";

type ExpenseListProps = {
  expenses: Expense[];
  fields: FieldDefinition[];
  meta: ExpenseListMeta;
  canWrite: boolean;
  busyId: string | null;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
  onPageChange: (page: number) => void;
};

const displayCustomValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

export const ExpenseList = ({
  expenses,
  fields,
  meta,
  canWrite,
  busyId,
  onEdit,
  onDelete,
  onPageChange,
}: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        No expenses match these filters.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Files</th>
              {fields.map((field) => (
                <th key={field.id} className="px-4 py-3 font-medium">
                  {field.label}
                </th>
              ))}
              {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                  {expense.occurredOn}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {formatExpenseAmount(expense.amount)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {expense.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {expense.department?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {expense.vendor?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {paymentMethodLabel(expense.paymentMethod)}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                  {expense.notes || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {expense.attachmentCount > 0
                    ? expense.attachmentCount
                    : "—"}
                </td>
                {fields.map((field) => (
                  <td key={field.id} className="px-4 py-3 text-slate-700">
                    {displayCustomValue(expense.customValues[field.key])}
                  </td>
                ))}
                {canWrite && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === expense.id}
                        onClick={() => onEdit(expense)}
                        className="text-sm font-medium text-teal-800 hover:underline disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <Button
                        disabled={busyId === expense.id}
                        onClick={() => void onDelete(expense.id)}
                        className="bg-red-700 px-3 py-1 hover:bg-red-800"
                      >
                        {busyId === expense.id ? "…" : "Delete"}
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>
          Page {meta.page} of {meta.totalPages} · {meta.total} total
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
