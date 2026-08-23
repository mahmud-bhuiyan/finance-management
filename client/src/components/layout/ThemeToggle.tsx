import { useTheme } from "../../hooks/useTheme";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SunIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.52 18.52l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M18.52 5.48l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 7.5 7.5 0 1 0 20 14.5Z" />
  </svg>
);

const iconButtonClass = (active: boolean) =>
  [
    "grid h-8 w-8 place-items-center rounded-lg transition-colors",
    active
      ? "bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-(--fms-accent)"
      : "text-(--fms-muted) hover:text-(--fms-ink)",
  ].join(" ");

export const ThemeToggle = () => {
  const { themePreference, setThemePreference } = useTheme();
  const isDark = themePreference === "DARK";

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl border border-(--fms-border) p-0.5"
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        className={iconButtonClass(!isDark)}
        onClick={() => setThemePreference("LIGHT")}
        aria-label="Light theme"
        aria-pressed={!isDark}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        className={iconButtonClass(isDark)}
        onClick={() => setThemePreference("DARK")}
        aria-label="Dark theme"
        aria-pressed={isDark}
      >
        <MoonIcon />
      </button>
    </div>
  );
};
