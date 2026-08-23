import type { FieldDefinition } from "../../../lib/fields";
import { FieldDefinitionCard } from "./FieldDefinitionCard";

type FieldDefinitionListProps = {
  fields: FieldDefinition[];
  busyId: string | null;
  onToggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateLabel: (id: string, label: string) => Promise<void>;
};

export const FieldDefinitionList = ({
  fields,
  busyId,
  onToggleEnabled,
  onMove,
  onDelete,
  onUpdateLabel,
}: FieldDefinitionListProps) => {
  if (fields.length === 0) {
    return (
      <p className="surface-dashed p-6 text-sm text-slate-500">
        No fields yet for this target. Add one above.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <FieldDefinitionCard
          key={field.id}
          field={field}
          index={index}
          total={fields.length}
          busy={busyId === field.id}
          onToggleEnabled={onToggleEnabled}
          onMove={onMove}
          onDelete={onDelete}
          onUpdateLabel={onUpdateLabel}
        />
      ))}
    </div>
  );
};
