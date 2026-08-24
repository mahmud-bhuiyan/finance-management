import { useEffect, useState, type FormEvent } from "react";
import { DynamicFieldForm } from "../../../components/forms/DynamicFieldForm";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type {
  CreateExpensePayload,
  Expense,
} from "../../../lib/expenses";
import type { FieldDefinition } from "../../../lib/fields";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "../../../lib/paymentMethods";
import type { SupportItem } from "../../../lib/supportData";

type ExpenseFormProps = {
  fields: FieldDefinition[];
  categories: SupportItem[];
  departments: SupportItem[];
  vendors: SupportItem[];
  submitting: boolean;
  editing: Expense | null;
  defaultDate: string;
  onSubmit: (payload: CreateExpensePayload) => Promise<void>;
  onCancelEdit: () => void;
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const SupportSelect = ({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: SupportItem[];
  disabled: boolean;
  onChange: (value: string) => void;
}) => (
  <label className="block space-y-2 text-sm text-slate-700">
    <span className="font-medium text-slate-800">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2 disabled:opacity-60"
    >
      <option value="">— None —</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </label>
);

export const ExpenseForm = ({
  fields,
  categories,
  departments,
  vendors,
  submitting,
  editing,
  defaultDate,
  onSubmit,
  onCancelEdit,
}: ExpenseFormProps) => {
  const [occurredOn, setOccurredOn] = useState(defaultDate || todayDate());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (editing) {
      setOccurredOn(editing.occurredOn);
      setAmount(editing.amount);
      setNotes(editing.notes ?? "");
      setPaymentMethod(editing.paymentMethod ?? "");
      setCategoryId(editing.categoryId ?? "");
      setDepartmentId(editing.departmentId ?? "");
      setVendorId(editing.vendorId ?? "");
      setCustomValues(editing.customValues);
      return;
    }

    setOccurredOn(defaultDate || todayDate());
    setAmount("");
    setNotes("");
    setPaymentMethod("");
    setCategoryId("");
    setDepartmentId("");
    setVendorId("");
    setCustomValues({});
  }, [editing, defaultDate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      occurredOn,
      amount,
      ...(notes.trim() ? { notes: notes.trim() } : { notes: "" }),
      paymentMethod: (paymentMethod || null) as PaymentMethod | null,
      categoryId: categoryId || null,
      departmentId: departmentId || null,
      vendorId: vendorId || null,
      customValues,
    });

    if (!editing) {
      setAmount("");
      setNotes("");
      setPaymentMethod("");
      setCategoryId("");
      setDepartmentId("");
      setVendorId("");
      setCustomValues({});
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="surface p-5"
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
        <SupportSelect
          label="Category (optional)"
          value={categoryId}
          options={categories}
          disabled={submitting}
          onChange={setCategoryId}
        />
        <SupportSelect
          label="Department (optional)"
          value={departmentId}
          options={departments}
          disabled={submitting}
          onChange={setDepartmentId}
        />
        <SupportSelect
          label="Vendor (optional)"
          value={vendorId}
          options={vendors}
          disabled={submitting}
          onChange={setVendorId}
        />
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="font-medium text-slate-800">
            Payment method (optional)
          </span>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2 disabled:opacity-60"
          >
            <option value="">— None —</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block space-y-2 text-sm text-slate-700">
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
