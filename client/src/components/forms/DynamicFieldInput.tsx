import type { FieldDefinition } from "../../lib/fields";
import { fieldTypeLabel } from "../../lib/fields";
import { Input } from "../ui/Input";

type DynamicFieldInputProps = {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
};

const toStringValue = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

export const DynamicFieldInput = ({
  field,
  value,
  onChange,
  readOnly = false,
}: DynamicFieldInputProps) => {
  const disabled = readOnly || !field.enabled;
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2 disabled:bg-slate-100 disabled:text-slate-500";

  const label = (
    <span className="font-medium text-slate-800">
      {field.label}
      {field.required && <span className="text-red-600"> *</span>}
      <span className="ml-2 text-xs font-normal text-slate-500">
        ({fieldTypeLabel(field.fieldType)})
      </span>
    </span>
  );

  switch (field.fieldType) {
    case "LONG_TEXT":
      return (
        <label className="block space-y-2 text-sm text-slate-700">
          {label}
          <textarea
            value={toStringValue(value)}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            rows={4}
            className={inputClass}
          />
        </label>
      );

    case "NUMBER":
    case "CURRENCY":
      return (
        <Input
          label={field.label}
          type="number"
          step={field.fieldType === "CURRENCY" ? "0.01" : "any"}
          value={toStringValue(value)}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
          disabled={disabled}
          required={field.required}
        />
      );

    case "DATE":
      return (
        <Input
          label={field.label}
          type="date"
          value={toStringValue(value)}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={field.required}
        />
      );

    case "BOOLEAN":
      return (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
          />
          {label}
        </label>
      );

    case "DROPDOWN":
      return (
        <label className="block space-y-2 text-sm text-slate-700">
          {label}
          <select
            value={toStringValue(value)}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className={inputClass}
          >
            <option value="">Select…</option>
            {(field.options?.choices ?? []).map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </label>
      );

    case "FILE":
      return (
        <label className="block space-y-2 text-sm text-slate-700">
          {label}
          <input
            type="file"
            disabled={disabled}
            onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-900 hover:file:bg-teal-100"
          />
          {value ? (
            <span className="text-xs text-slate-500">
              Selected: {toStringValue(value)}
            </span>
          ) : null}
        </label>
      );

    case "TEXT":
    default:
      return (
        <Input
          label={field.label}
          type="text"
          value={toStringValue(value)}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={field.required}
        />
      );
  }
};
