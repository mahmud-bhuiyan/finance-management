import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export const Modal = ({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: ModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--fms-ink)_35%,transparent)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`surface relative z-10 flex max-h-[min(90vh,48rem)] w-full flex-col overflow-hidden p-0 shadow-[var(--fms-shadow)] ${wide ? "max-w-4xl" : "max-w-lg"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--fms-border) px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-(--fms-ink)">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-(--fms-muted) hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)] hover:text-(--fms-ink)"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer ?? (
          <div className="border-t border-(--fms-border) px-5 py-4">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
