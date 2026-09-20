import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  DisableIcon,
  EditIcon,
  EnableIcon,
  IconActionButton,
} from "../../../components/ui/ActionIcons";
import type { FieldDefinition } from "../../../lib/fields";
import { fieldTypeLabel } from "../../../lib/fields";

type FieldDefinitionCardProps = {
  field: FieldDefinition;
  index: number;
  total: number;
  busy: boolean;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
  onDelete: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => Promise<void>;
};

export const FieldDefinitionCard = ({
  field,
  index,
  total,
  busy,
  onToggleEnabled,
  onMove,
  onDelete,
  onUpdateLabel,
}: FieldDefinitionCardProps) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(field.label);

  const saveLabel = async () => {
    const trimmed = label.trim();
    if (!trimmed || trimmed === field.label) {
      setEditing(false);
      setLabel(field.label);
      return;
    }

    await onUpdateLabel(field.id, trimmed);
    setEditing(false);
  };

  return (
    <article className="surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <Button type="button" disabled={busy} onClick={() => void saveLabel()}>
                Save
              </Button>
              <button
                type="button"
                className="text-sm text-slate-600 hover:underline"
                onClick={() => {
                  setEditing(false);
                  setLabel(field.label);
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <h3 className="text-base font-medium text-slate-900">{field.label}</h3>
          )}
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-mono text-teal-800">{field.key}</span>
            {" · "}
            {fieldTypeLabel(field.fieldType)}
            {" · "}
            sort {field.sortOrder}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {field.required && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                Required
              </span>
            )}
            {!field.enabled && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                Disabled
              </span>
            )}
            {field.showInReports && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                Reports
              </span>
            )}
            {field.visibleToNormalUser && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                Normal user visible
              </span>
            )}
          </div>
          {field.fieldType === "DROPDOWN" && field.options?.choices?.length ? (
            <p className="mt-2 text-xs text-slate-500">
              Choices: {field.options.choices.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <IconActionButton
            label="Rename field"
            disabled={busy}
            onClick={() => setEditing(true)}
          >
            <EditIcon />
          </IconActionButton>
          <IconActionButton
            label={field.enabled ? "Disable field" : "Enable field"}
            disabled={busy}
            onClick={() => onToggleEnabled(field.id, !field.enabled)}
          >
            {field.enabled ? <DisableIcon /> : <EnableIcon />}
          </IconActionButton>
          <IconActionButton
            label="Move field up"
            tone="muted"
            disabled={busy || index === 0}
            onClick={() => void onMove(field.id, "up")}
          >
            <ChevronUpIcon />
          </IconActionButton>
          <IconActionButton
            label="Move field down"
            tone="muted"
            disabled={busy || index === total - 1}
            onClick={() => void onMove(field.id, "down")}
          >
            <ChevronDownIcon />
          </IconActionButton>
          <IconActionButton
            label="Delete field"
            tone="rose"
            disabled={busy}
            onClick={() => onDelete(field.id)}
          >
            <DeleteIcon />
          </IconActionButton>
        </div>
      </div>
    </article>
  );
};
