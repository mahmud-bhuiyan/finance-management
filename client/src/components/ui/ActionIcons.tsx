import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

export const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const EditIcon = () => (
  <svg {...iconProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const DeleteIcon = () => (
  <svg {...iconProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14h12l1-14" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M10 15V9" />
    <path d="M14 15V9" />
  </svg>
);

export const ReactivateIcon = () => (
  <svg {...iconProps}>
    <path d="M3 2v6h6" />
    <path d="M3 13a9 9 0 0 0 15 5.7" />
    <path d="M21 12V6h-6" />
    <path d="M21 11a9 9 0 0 0-15-5.7" />
  </svg>
);

export const EnableIcon = () => (
  <svg {...iconProps}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </svg>
);

export const DisableIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </svg>
);

export const DownloadIcon = () => (
  <svg {...iconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const ChevronUpIcon = () => (
  <svg {...iconProps}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export const ChevronDownIcon = () => (
  <svg {...iconProps}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export type IconActionTone = "accent" | "rose" | "muted";

export const iconActionClass = (tone: IconActionTone = "accent") =>
  [
    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-40",
    tone === "rose"
      ? "text-(--fms-rose) hover:bg-[color-mix(in_srgb,var(--fms-rose)_12%,transparent)]"
      : tone === "muted"
        ? "text-(--fms-muted) hover:bg-[color-mix(in_srgb,var(--fms-muted)_12%,transparent)]"
        : "text-(--fms-accent) hover:bg-[color-mix(in_srgb,var(--fms-accent)_12%,transparent)]",
  ].join(" ");

type IconActionButtonProps = {
  label: string;
  tone?: IconActionTone;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export const IconActionButton = ({
  label,
  tone = "accent",
  disabled,
  onClick,
  children,
}: IconActionButtonProps) => (
  <button
    type="button"
    className={iconActionClass(tone)}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

type IconActionLinkProps = LinkProps & {
  label: string;
  tone?: IconActionTone;
};

export const IconActionLink = ({
  label,
  tone = "accent",
  className,
  children,
  ...props
}: IconActionLinkProps) => (
  <Link
    {...props}
    className={[iconActionClass(tone), className].filter(Boolean).join(" ")}
    aria-label={label}
    title={label}
  >
    {children}
  </Link>
);
