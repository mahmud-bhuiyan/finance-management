import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Tenant } from "../lib/tenantApi";

const iconProps = {
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

const EditIcon = () => (
  <svg {...iconProps}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const PauseIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M10 15V9" />
    <path d="M14 15V9" />
  </svg>
);

const ReactivateIcon = () => (
  <svg {...iconProps}>
    <path d="M3 2v6h6" />
    <path d="M3 13a9 9 0 0 0 15 5.7" />
    <path d="M21 12V6h-6" />
    <path d="M21 11a9 9 0 0 0-15-5.7" />
  </svg>
);

const DeleteIcon = () => (
  <svg {...iconProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14h12l1-14" />
  </svg>
);

const iconActionClass = (tone: "accent" | "rose" = "accent") =>
  [
    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-40",
    tone === "rose"
      ? "text-(--fms-rose) hover:bg-[color-mix(in_srgb,var(--fms-rose)_12%,transparent)]"
      : "text-(--fms-accent) hover:bg-[color-mix(in_srgb,var(--fms-accent)_12%,transparent)]",
  ].join(" ");

type IconActionButtonProps = {
  label: string;
  tone?: "accent" | "rose";
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const IconActionButton = ({
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

type TenantTableActionsProps = {
  tenant: Tenant;
  isActiveTab: boolean;
  disabled: boolean;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
};

export const TenantTableActions = ({
  tenant,
  isActiveTab,
  disabled,
  onDeactivate,
  onActivate,
  onDelete,
}: TenantTableActionsProps) => (
  <div className="flex items-center justify-center gap-1">
    <Link
      to={`/tenants/${tenant.id}/edit`}
      className={iconActionClass()}
      aria-label="Edit company"
      title="Edit company"
    >
      <EditIcon />
    </Link>

    {isActiveTab ? (
      <IconActionButton
        label="Deactivate company"
        disabled={disabled}
        onClick={onDeactivate}
      >
        <PauseIcon />
      </IconActionButton>
    ) : (
      <IconActionButton
        label="Reactivate"
        disabled={disabled}
        onClick={onActivate}
      >
        <ReactivateIcon />
      </IconActionButton>
    )}

    {!isActiveTab ? (
      <IconActionButton
        label="Delete company"
        tone="rose"
        disabled={disabled}
        onClick={onDelete}
      >
        <DeleteIcon />
      </IconActionButton>
    ) : null}
  </div>
);
