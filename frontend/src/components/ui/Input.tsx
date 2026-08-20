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
    <label className="block space-y-1.5 text-sm text-slate-700">
      <span className="font-medium text-slate-800">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2 ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
};
