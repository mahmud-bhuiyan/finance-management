import { useMemo, useState } from "react";
import { DynamicFieldForm } from "../../../components/forms/DynamicFieldForm";
import type { FieldDefinition } from "../../../lib/fields";

type FieldPreviewPanelProps = {
  fields: FieldDefinition[];
};

export const FieldPreviewPanel = ({ fields }: FieldPreviewPanelProps) => {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const previewValues = useMemo(() => {
    const next: Record<string, unknown> = { ...values };
    for (const field of fields) {
      if (field.enabled && next[field.key] === undefined && field.defaultValue !== null) {
        next[field.key] = field.defaultValue;
      }
    }
    return next;
  }, [fields, values]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">Live preview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Reusable dynamic form renderer — enabled fields only, ordered by sort
        order. Step 08 expense forms will reuse this component.
      </p>
      <div className="mt-4">
        <DynamicFieldForm
          fields={fields}
          values={previewValues}
          onChange={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
        />
      </div>
      {Object.keys(previewValues).length > 0 && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
          {JSON.stringify(previewValues, null, 2)}
        </pre>
      )}
    </section>
  );
};
