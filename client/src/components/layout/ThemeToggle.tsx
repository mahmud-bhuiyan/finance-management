import { themeLabel } from "../../lib/theme";
import { useTheme } from "../../hooks/useTheme";

type ThemeToggleProps = {
  inline?: boolean;
};

export const ThemeToggle = ({ inline = false }: ThemeToggleProps) => {
  const { themePreference, toggleTheme } = useTheme();
  const isDark = themePreference === "DARK";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={[
        "flex items-center rounded-xl px-1 py-1 text-sm font-medium text-(--fms-muted)",
        inline ? "gap-2 shrink-0" : "w-full justify-between",
      ].join(" ")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className={inline ? "" : "pl-1"}>Theme</span>
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
