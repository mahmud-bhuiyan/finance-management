import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = ({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <label className="block space-y-2 text-sm text-(--fms-muted)">
      <span className="block font-medium text-(--fms-ink)">{label}</span>
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-(--fms-ink) ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-(--fms-rose)">{error}</span>
      )}
    </label>
  );
};
