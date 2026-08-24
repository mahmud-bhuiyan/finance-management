import { useEffect, useState, type InputHTMLAttributes } from "react";
import { FormField } from "../forms/FormField";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ClearableControl } from "./ClearableControl";

type DebouncedSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onDebouncedChange: (value: string) => void;
  delayMs?: number;
  clearable?: boolean;
  clearLabel?: string;
  label?: string;
  srOnlyLabel?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  resetKey?: number | string;
  onDraftChange?: (value: string) => void;
};

export const DebouncedSearchInput = ({
  value,
  onDebouncedChange,
  delayMs = 300,
  clearable = false,
  clearLabel = "Clear search",
  label,
  srOnlyLabel,
  labelClassName = "",
  wrapperClassName = "",
  className = "",
  resetKey,
  onDraftChange,
  ...inputProps
}: DebouncedSearchInputProps) => {
  const [draft, setDraft] = useState(value);
  const debouncedDraft = useDebouncedValue(draft, delayMs);
  const showClear = clearable && draft.length > 0;

  useEffect(() => {
    setDraft(value);
  }, [value, resetKey]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    if (debouncedDraft === draft && debouncedDraft !== value) {
      onDebouncedChange(debouncedDraft);
    }
  }, [debouncedDraft, draft, value, onDebouncedChange]);

  const handleClear = () => {
    setDraft("");
    onDebouncedChange("");
  };

  const inputClassName = [
    label && !labelClassName ? "w-full px-3 py-2 text-(--fms-ink)" : "",
    showClear ? "pr-9!" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputElement = (
    <input
      type="search"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      className={inputClassName}
      {...inputProps}
    />
  );

  const input = clearable ? (
    <ClearableControl
      showClear={showClear}
      onClear={handleClear}
      clearLabel={clearLabel}
    >
      {inputElement}
    </ClearableControl>
  ) : (
    inputElement
  );

  if (label && !labelClassName) {
    return (
      <FormField label={label}>
        {input}
      </FormField>
    );
  }

  if (label || srOnlyLabel) {
    return (
      <label className={wrapperClassName}>
        {label ? <span className={labelClassName}>{label}</span> : null}
        {srOnlyLabel ? <span className="sr-only">{srOnlyLabel}</span> : null}
        {input}
      </label>
    );
  }

  return <div className={wrapperClassName}>{input}</div>;
};
