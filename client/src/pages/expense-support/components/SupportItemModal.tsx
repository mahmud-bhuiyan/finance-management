import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import type {
  CreateSupportPayload,
  SupportItem,
  SupportKind,
} from "../../../lib/supportData";
import { supportKindSingular } from "../../../lib/supportData";

type SupportItemModalProps = {
  open: boolean;
  kind: SupportKind;
  submitting: boolean;
  editing: SupportItem | null;
  onSubmit: (payload: CreateSupportPayload) => Promise<void>;
  onClose: () => void;
};

export const SupportItemModal = ({
  open,
  kind,
  submitting,
  editing,
  onSubmit,
  onClose,
}: SupportItemModalProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editing) {
      setName(editing.name);
      setNotes(editing.notes ?? "");
      return;
    }
    setName("");
    setNotes("");
  }, [open, editing, kind]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  const label = supportKindSingular(kind);
  const title = editing
    ? `Edit ${label.toLowerCase()}`
    : `Add ${label.toLowerCase()}`;

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
          <Button type="button" variant="ghost" disabled={submitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="support-item-form"
            disabled={submitting || !name.trim()}
          >
            {submitting
              ? "Saving…"
              : editing
                ? "Save changes"
                : `Add ${label.toLowerCase()}`}
          </Button>
        </div>
      }
    >
      <form id="support-item-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4">
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={120}
            disabled={submitting}
          />
          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-medium text-slate-800">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={500}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
};
