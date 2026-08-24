import type { ReactNode } from "react";

export const formFieldClassName =
  "block space-y-2 text-sm text-(--fms-muted)";

export const formFieldLabelClassName =
  "block font-medium text-(--fms-ink)";

type FormFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export const FormField = ({
  label,
  error,
  children,
  className = "",
}: FormFieldProps) => (
  <label className={`${formFieldClassName} ${className}`.trim()}>
    <span className={formFieldLabelClassName}>{label}</span>
    {children}
    {error && <span className="text-xs text-(--fms-rose)">{error}</span>}
  </label>
);
