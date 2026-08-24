import type { SelectHTMLAttributes } from "react";
import { FormField } from "../forms/FormField";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const Select = ({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectProps) => {
  const selectId = id ?? props.name;

  return (
    <FormField label={label} error={error}>
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-(--fms-ink) ${className}`}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
};
