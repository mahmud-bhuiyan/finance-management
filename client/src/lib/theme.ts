export type ThemePreference = "LIGHT" | "DARK";

export const applyThemePreference = (themePreference: ThemePreference) => {
  document.documentElement.classList.toggle("dark", themePreference === "DARK");
};

export const themeLabel = (themePreference: ThemePreference) =>
  themePreference === "DARK" ? "Dark" : "Light";
