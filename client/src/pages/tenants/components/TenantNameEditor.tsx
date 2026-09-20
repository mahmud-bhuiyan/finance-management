import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { Input } from "../../../components/ui/Input";

type TenantNameEditorProps = {
  currentName: string;
  submitting: boolean;
  onConfirmChange: (name: string) => Promise<void>;
};

export const TenantNameEditor = ({
  currentName,
  submitting,
  onConfirmChange,
}: TenantNameEditorProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setDraft(currentName);
    setEditing(false);
    setConfirmOpen(false);
  }, [currentName]);

  const trimmedDraft = draft.trim();
  const nameChanged = trimmedDraft !== currentName;
  const nameValid = trimmedDraft.length >= 2;

  const handleCancelEdit = () => {
    setDraft(currentName);
    setEditing(false);
  };

  const handleRequestChange = () => {
    if (!nameChanged || !nameValid) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmChange = async () => {
    await onConfirmChange(trimmedDraft);
    setConfirmOpen(false);
    setEditing(false);
  };

  return (
    <>
      <div className="space-y-3">
        {!editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface-strong)_55%,transparent)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-(--fms-ink)">Company name</p>
              <p className="mt-1 text-sm text-(--fms-muted)">{currentName}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              Change name
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface-strong)_55%,transparent)] p-4">
            <Input
              label="Company name"
              name="companyName"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Acme Ltd"
              required
              minLength={2}
            />
            {!nameValid && trimmedDraft.length > 0 ? (
              <p className="text-xs text-(--fms-rose)">
                Enter a name with at least 2 characters.
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!nameChanged || !nameValid || submitting}
                onClick={handleRequestChange}
              >
                Update name
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Change company name?"
        description={
          <>
            Change the company name from{" "}
            <span className="font-medium text-(--fms-accent)">{currentName}</span>{" "}
            to{" "}
            <span className="font-medium text-(--fms-accent)">{trimmedDraft}</span>
            ?
          </>
        }
        confirmLabel="Change name"
        submitting={submitting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmChange}
      />
    </>
  );
};
