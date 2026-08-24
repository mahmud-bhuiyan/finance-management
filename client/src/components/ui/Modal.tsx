import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

export type ModalVariant = "default" | "prompt" | "workspace";
export type ModalSize = "sm" | "md" | "lg" | "wide";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** @deprecated Prefer `size="wide"`. */
  wide?: boolean;
  kicker?: string;
  subtitle?: string;
  badge?: ReactNode;
  leading?: ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  wide: "max-w-4xl",
};

export const Modal = ({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
  kicker,
  subtitle,
  badge,
  leading,
  variant = "default",
  size,
}: ModalProps) => {
  const resolvedSize = size ?? (wide ? "wide" : "md");
  const isPrompt = variant === "prompt";
  const isWorkspace = variant === "workspace";

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
        className={`surface relative z-10 flex max-h-[min(90vh,48rem)] w-full flex-col overflow-hidden p-0 shadow-(--fms-shadow) ${sizeClass[resolvedSize]} ${
          isPrompt
            ? "before:absolute before:inset-x-0 before:top-0 before:h-1 before:rounded-t-3xl before:bg-[linear-gradient(90deg,var(--fms-accent-soft),var(--fms-accent))]"
            : ""
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 px-5 py-4 ${
            isPrompt
              ? "border-b border-[color-mix(in_srgb,var(--fms-border)_70%,transparent)] pt-5"
              : "border-b border-(--fms-border)"
          } ${isWorkspace ? "bg-[color-mix(in_srgb,var(--fms-accent)_5%,transparent)]" : ""}`}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {leading}
            <div className="min-w-0">
              {kicker ? (
                <p className="text-xs font-semibold tracking-[0.14em] text-(--fms-accent) uppercase">
                  {kicker}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="modal-title"
                  className={`font-semibold text-(--fms-ink) ${
                    kicker ? "mt-1 text-lg" : "text-base"
                  }`}
                >
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle ? (
                <p className="mt-1 text-sm text-(--fms-muted)">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <div
          className={`overflow-y-auto px-5 py-4 ${
            isWorkspace
              ? "bg-[color-mix(in_srgb,var(--fms-surface-strong)_35%,transparent)]"
              : ""
          } ${isPrompt ? "px-6 py-5" : ""}`}
        >
          {children}
        </div>
        {footer != null ? footer : null}
      </div>
    </div>
  );
};
