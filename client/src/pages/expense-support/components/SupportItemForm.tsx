import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type {
  CreateSupportPayload,
  SupportItem,
  SupportKind,
} from "../../../lib/supportData";
import { supportKindSingular } from "../../../lib/supportData";

type SupportItemFormProps = {
  kind: SupportKind;
  submitting: boolean;
  editing: SupportItem | null;
  onSubmit: (payload: CreateSupportPayload) => Promise<void>;
  onCancelEdit: () => void;
};

export const SupportItemForm = ({
  kind,
  submitting,
  editing,
  onSubmit,
  onCancelEdit,
}: SupportItemFormProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setNotes(editing.notes ?? "");
      return;
    }
    setName("");
    setNotes("");
  }, [editing, kind]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    if (!editing) {
      setName("");
      setNotes("");
    }
  };

  const label = supportKindSingular(kind);

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="surface p-5"
    >
      <h2 className="text-lg font-medium text-slate-900">
        {editing ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={120}
          disabled={submitting}
        />
        <label className="block space-y-1.5 text-sm text-slate-700">
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
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting
            ? "Saving…"
            : editing
              ? "Save changes"
              : `Add ${label.toLowerCase()}`}
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
