import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

type TenantSlugEditorProps = {
  currentSlug: string;
  submitting: boolean;
  onConfirmChange: (slug: string) => Promise<void>;
};

export const TenantSlugEditor = ({
  currentSlug,
  submitting,
  onConfirmChange,
}: TenantSlugEditorProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentSlug);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setDraft(currentSlug);
    setEditing(false);
    setConfirmOpen(false);
  }, [currentSlug]);

  const trimmedDraft = draft.trim();
  const normalizedDraft = normalizeSlug(trimmedDraft);
  const slugChanged = normalizedDraft !== currentSlug;
  const slugValid =
    normalizedDraft.length >= 2 && slugPattern.test(normalizedDraft);

  const handleCancelEdit = () => {
    setDraft(currentSlug);
    setEditing(false);
  };

  const handleRequestChange = () => {
    if (!slugChanged || !slugValid) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmChange = async () => {
    await onConfirmChange(normalizedDraft);
    setConfirmOpen(false);
    setEditing(false);
  };

  return (
    <>
      <div className="space-y-3">
        {!editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface-strong)_55%,transparent)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-(--fms-ink)">URL slug</p>
              <p className="mt-1 font-mono text-sm text-(--fms-muted)">
                {currentSlug}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              Change slug
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface-strong)_55%,transparent)] p-4">
            <Input
              label="URL slug"
              name="companySlug"
              value={draft}
              onChange={(event) => setDraft(normalizeSlug(event.target.value))}
              placeholder="acme-ltd"
              required
              minLength={2}
              maxLength={80}
              spellCheck={false}
              autoComplete="off"
            />
            <p className="text-xs text-(--fms-muted)">
              Lowercase letters, numbers, and hyphens only.
            </p>
            {!slugValid && trimmedDraft.length > 0 ? (
              <p className="text-xs text-(--fms-rose)">
                Enter a valid slug with at least 2 characters.
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!slugChanged || !slugValid || submitting}
                onClick={handleRequestChange}
              >
                Update slug
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        title="Change company slug?"
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => void handleConfirmChange()}
            >
              {submitting ? "Updating…" : "Change slug"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-(--fms-ink)">
          Change the URL slug from{" "}
          <span className="font-mono text-(--fms-accent)">{currentSlug}</span> to{" "}
          <span className="font-mono text-(--fms-accent)">{normalizedDraft}</span>
          ? Any links or integrations using the old slug will stop working.
        </p>
      </Modal>
    </>
  );
};
