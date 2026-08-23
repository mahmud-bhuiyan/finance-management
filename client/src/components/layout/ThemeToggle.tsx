import { themeLabel } from "../../lib/theme";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle = () => {
  const { themePreference, toggleTheme } = useTheme();
  const isDark = themePreference === "DARK";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-sm font-medium text-(--fms-muted)"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className="pl-1">Theme</span>
      <span className="relative inline-flex h-7 w-[3.4rem] items-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_16%,transparent)] p-0.5">
        <span
          className={[
            "grid h-6 w-6 place-items-center rounded-full bg-(--fms-accent) text-[0.55rem] font-bold text-white shadow-sm transition-transform dark:text-[#04110f]",
            isDark ? "translate-x-[1.55rem]" : "translate-x-0",
          ].join(" ")}
        >
          {isDark ? "D" : "L"}
        </span>
      </span>
      <span className="sr-only">{themeLabel(themePreference)}</span>
    </button>
  );
};
