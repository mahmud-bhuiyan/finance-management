import { themeLabel } from "../../lib/theme";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle = () => {
  const { themePreference, toggleTheme, updating } = useTheme();

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      disabled={updating}
      className="flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={`Switch to ${themePreference === "DARK" ? "light" : "dark"} theme`}
    >
      <span>Theme</span>
      <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
        {themeLabel(themePreference)}
      </span>
    </button>
  );
};
