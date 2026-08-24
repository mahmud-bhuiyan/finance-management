import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

type TenantFormFooterProps = {
  cancelTo: string;
  submitLabel: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  formId?: string;
  hint?: string;
};

export const TenantFormFooter = ({
  cancelTo,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  formId,
  hint = "Changes apply to this company only.",
}: TenantFormFooterProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_4%,transparent)] px-5 py-4">
    <p className="text-xs text-(--fms-muted)">{hint}</p>
    <div className="flex flex-wrap gap-2">
      <Link
        to={cancelTo}
        className="inline-flex items-center rounded-xl border border-(--fms-border-strong) bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-(--fms-ink) transition-colors hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)]"
      >
        Cancel
      </Link>
      <Button
        type="submit"
        form={formId}
        disabled={submitting || submitDisabled}
      >
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </div>
  </div>
);
