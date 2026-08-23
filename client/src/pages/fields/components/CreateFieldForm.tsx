import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { CreateFieldPayload, FieldTarget, FieldType } from "../../../lib/fields";
import { FIELD_TYPES, fieldTypeLabel } from "../../../lib/fields";

type CreateFieldFormProps = {
  target: FieldTarget;
  submitting: boolean;
  onSubmit: (payload: CreateFieldPayload) => Promise<void>;
};

export const CreateFieldForm = ({
  target,
  submitting,
  onSubmit,
}: CreateFieldFormProps) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [choicesText, setChoicesText] = useState("");
  const [showInReports, setShowInReports] = useState(true);
  const [visibleToNormalUser, setVisibleToNormalUser] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const choices = choicesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await onSubmit({
      target,
      label: label.trim(),
      ...(key.trim() ? { key: key.trim() } : {}),
      fieldType,
      required,
      showInReports,
      visibleToNormalUser,
      ...(fieldType === "DROPDOWN"
        ? { options: { choices } }
        : {}),
    });

    setLabel("");
    setKey("");
    setFieldType("TEXT");
    setRequired(false);
    setChoicesText("");
    setShowInReports(true);
    setVisibleToNormalUser(false);
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="surface p-5"
    >
      <h2 className="text-lg font-medium text-slate-900">Add field</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          required
          disabled={submitting}
        />
        <Input
          label="Key (optional)"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="auto-generated from label"
          disabled={submitting}
        />
        <label className="block space-y-1.5 text-sm text-slate-700">
          <span className="font-medium text-slate-800">Type</span>
          <select
            value={fieldType}
            onChange={(event) => setFieldType(event.target.value as FieldType)}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {fieldTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            Required
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showInReports}
              onChange={(event) => setShowInReports(event.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            Show in reports
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibleToNormalUser}
              onChange={(event) =>
                setVisibleToNormalUser(event.target.checked)
              }
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            Visible to normal users
          </label>
        </div>
      </div>

      {fieldType === "DROPDOWN" && (
        <label className="mt-4 block space-y-1.5 text-sm text-slate-700">
          <span className="font-medium text-slate-800">
            Dropdown choices (one per line)
          </span>
          <textarea
            value={choicesText}
            onChange={(event) => setChoicesText(event.target.value)}
            rows={4}
            required
            disabled={submitting}
            placeholder={"Draft\nApproved"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
          />
        </label>
      )}

      <div className="mt-4">
        <Button type="submit" disabled={submitting || !label.trim()}>
          {submitting ? "Adding…" : "Add field"}
        </Button>
      </div>
    </form>
  );
};
