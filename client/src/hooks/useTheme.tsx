import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import { applyThemePreference, type ThemePreference } from "../lib/theme";
import { authQueryKeys, useAuth, type AuthUser } from "./useAuth";

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (themePreference: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
  updating: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const themePreference = user?.themePreference ?? "LIGHT";

  useEffect(() => {
    if (loading) {
      return;
    }
    applyThemePreference(themePreference);
  }, [loading, themePreference]);

  const updateMutation = useMutation({
    mutationFn: (nextTheme: ThemePreference) =>
      apiFetch<{ user: AuthUser }>("/auth/me/theme", {
        method: "PATCH",
        body: JSON.stringify({ themePreference: nextTheme }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
  });

  const setThemePreference = useCallback(
    async (nextTheme: ThemePreference) => {
      if (!user || nextTheme === themePreference) {
        applyThemePreference(nextTheme);
        return;
      }
      await updateMutation.mutateAsync(nextTheme);
    },
    [themePreference, updateMutation, user],
  );

  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemePreference =
      themePreference === "DARK" ? "LIGHT" : "DARK";
    await setThemePreference(nextTheme);
  }, [setThemePreference, themePreference]);

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference,
        toggleTheme,
        updating: updateMutation.isPending,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
