import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  submitting = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) => (
  <Modal
    open={open}
    title={title}
    variant="prompt"
    onClose={onClose}
    footer={
      <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant}
          disabled={submitting}
          onClick={() => void onConfirm()}
        >
          {submitting ? "Working…" : confirmLabel}
        </Button>
      </div>
    }
  >
    {description ? (
      <div className="text-sm leading-relaxed text-(--fms-muted)">
        {description}
      </div>
    ) : null}
  </Modal>
);
