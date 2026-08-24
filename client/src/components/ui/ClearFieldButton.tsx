type ClearFieldButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ClearFieldButton = ({
  onClick,
  label = "Clear",
  className = "",
}: ClearFieldButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-(--fms-muted) transition hover:bg-(--fms-surface-strong) hover:text-(--fms-ink) ${className}`}
  >
    <svg {...iconProps}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
);
