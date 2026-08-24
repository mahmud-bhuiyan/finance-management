import { NavLink } from "react-router-dom";

export type TabItem = {
  to: string;
  label: string;
};

export type TabsProps = {
  items: TabItem[];
  ariaLabel?: string;
  className?: string;
};

const tabClass = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-[color-mix(in_srgb,var(--fms-accent)_16%,transparent)] text-(--fms-ink) shadow-[0_0_0_1px_color-mix(in_srgb,var(--fms-accent)_22%,transparent)]"
      : "text-(--fms-muted) hover:bg-[color-mix(in_srgb,var(--fms-accent)_8%,transparent)] hover:text-(--fms-ink)",
  ].join(" ");

export const Tabs = ({
  items,
  ariaLabel = "Tabs",
  className = "",
}: TabsProps) => (
  <div
    className={`flex flex-wrap gap-2 ${className}`.trim()}
    role="tablist"
    aria-label={ariaLabel}
  >
    {items.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={tabClass}
        role="tab"
      >
        {item.label}
      </NavLink>
    ))}
  </div>
);
