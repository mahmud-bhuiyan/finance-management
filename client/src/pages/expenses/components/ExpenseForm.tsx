import { useEffect, useState, type FormEvent } from "react";
import { DynamicFieldForm } from "../../../components/forms/DynamicFieldForm";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type {
  CreateExpensePayload,
  Expense,
} from "../../../lib/expenses";
import type { FieldDefinition } from "../../../lib/fields";

type ExpenseFormProps = {
  fields: FieldDefinition[];
  submitting: boolean;
  editing: Expense | null;
  defaultDate: string;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
  onCancelEdit: () => void;
};

const todayDate = () => new Date().toISOString().slice(0, 10);

export const ExpenseForm = ({
  fields,
  submitting,
  editing,
  defaultDate,
  onSubmit,
  onCancelEdit,
}: ExpenseFormProps) => {
  const [occurredOn, setOccurredOn] = useState(defaultDate || todayDate());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (editing) {
      setOccurredOn(editing.occurredOn);
      setAmount(editing.amount);
      setNotes(editing.notes ?? "");
      setCustomValues(editing.customValues);
      return;
    }

    setOccurredOn(defaultDate || todayDate());
    setAmount("");
    setNotes("");
    setCustomValues({});
  }, [editing, defaultDate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      occurredOn,
      amount,
      ...(notes.trim() ? { notes: notes.trim() } : { notes: "" }),
      customValues,
    });

    if (!editing) {
      setAmount("");
      setNotes("");
      setCustomValues({});
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-medium text-slate-900">
        {editing ? "Edit expense" : "Add expense"}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          required
          disabled={submitting}
        />
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          disabled={submitting}
        />
      </div>
      <label className="mt-4 block space-y-1.5 text-sm text-slate-700">
        <span className="font-medium text-slate-800">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={500}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
        />
      </label>

      {fields.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-3 text-sm font-medium text-slate-800">
            Custom fields
          </p>
          <DynamicFieldForm
            fields={fields}
            values={customValues}
            onChange={(key, value) =>
              setCustomValues((current) => ({ ...current, [key]: value }))
            }
            readOnly={submitting}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting || !amount}>
          {submitting ? "Saving…" : editing ? "Save changes" : "Add expense"}
        </Button>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
