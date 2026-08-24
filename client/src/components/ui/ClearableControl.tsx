import type { ReactNode } from "react";
import { ClearFieldButton } from "./ClearFieldButton";

type ClearableControlProps = {
  showClear: boolean;
  onClear: () => void;
  clearLabel?: string;
  clearButtonClassName?: string;
  children: ReactNode;
};

export const ClearableControl = ({
  showClear,
  onClear,
  clearLabel = "Clear",
  clearButtonClassName = "absolute top-1/2 right-2 -translate-y-1/2",
  children,
}: ClearableControlProps) => (
  <div className="relative">
    {children}
    {showClear ? (
      <ClearFieldButton
        onClick={onClear}
        label={clearLabel}
        className={clearButtonClassName}
      />
    ) : null}
  </div>
);
