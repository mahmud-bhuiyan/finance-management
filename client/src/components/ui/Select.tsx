import type { ChangeEvent, SelectHTMLAttributes } from "react";
import { FormField } from "../forms/FormField";
import { ClearableControl } from "./ClearableControl";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  clearable?: boolean;
  clearLabel?: string;
};

export const Select = ({
  label,
  error,
  id,
  className = "",
  clearable = false,
  clearLabel = "Clear selection",
  value,
  onChange,
  children,
  ...props
}: SelectProps) => {
  const selectId = id ?? props.name;
  const showClear = clearable && Boolean(value);

  const handleClear = () => {
    onChange?.({
      target: { value: "", name: props.name },
    } as ChangeEvent<HTMLSelectElement>);
  };

  const select = (
    <select
      id={selectId}
      value={value}
      onChange={onChange}
      className={`w-full py-2 pl-3 pr-10 text-(--fms-ink) ${showClear ? "pr-14!" : ""} ${className}`}
      {...props}
    >
      {children}
    </select>
  );

  return (
    <FormField label={label} error={error}>
      {clearable ? (
        <ClearableControl
          showClear={showClear}
          onClear={handleClear}
          clearLabel={clearLabel}
          clearButtonClassName="absolute top-1/2 right-8 -translate-y-1/2"
        >
          {select}
        </ClearableControl>
      ) : (
        select
      )}
    </FormField>
  );
};
