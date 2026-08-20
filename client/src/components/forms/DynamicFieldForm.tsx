import type { FieldDefinition } from "../../lib/fields";
import { enabledFields } from "../../lib/fields";
import { DynamicFieldInput } from "./DynamicFieldInput";

type DynamicFieldFormProps = {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  readOnly?: boolean;
};

export const DynamicFieldForm = ({
  fields,
  values,
  onChange,
  readOnly = false,
}: DynamicFieldFormProps) => {
  const visibleFields = enabledFields(fields);

  if (visibleFields.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No enabled fields to render yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => (
        <DynamicFieldInput
          key={field.id}
          field={field}
          value={values[field.key] ?? field.defaultValue ?? ""}
          onChange={(value) => onChange(field.key, value)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};
