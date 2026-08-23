export type ThemePreference = "LIGHT" | "DARK";

export const THEME_STORAGE_KEY = "fms-theme-preference";
export const THEME_USER_STORAGE_KEY = "fms-theme-user-id";

export const isThemePreference = (value: string): value is ThemePreference =>
  value === "LIGHT" || value === "DARK";

export const applyThemePreference = (themePreference: ThemePreference) => {
  document.documentElement.classList.toggle("dark", themePreference === "DARK");
};

export const readStoredThemePreference = (): ThemePreference | null => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value && isThemePreference(value) ? value : null;
  } catch {
    return null;
  }
};

export const readStoredThemeUserId = (): string | null => {
  try {
    return localStorage.getItem(THEME_USER_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const persistThemePreference = (
  themePreference: ThemePreference,
  userId?: string | null,
) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    if (userId) {
      localStorage.setItem(THEME_USER_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(THEME_USER_STORAGE_KEY);
    }
  } catch {
    // Ignore quota errors and private browsing.
  }
  applyThemePreference(themePreference);
};

export const themeLabel = (themePreference: ThemePreference) =>
  themePreference === "DARK" ? "Dark" : "Light";
