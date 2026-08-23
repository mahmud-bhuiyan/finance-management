import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import {
  persistThemePreference,
  readStoredThemePreference,
  type ThemePreference,
} from "../lib/theme";
import { authQueryKeys, useAuth, type AuthUser } from "./useAuth";

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (themePreference: ThemePreference) => void;
  toggleTheme: () => void;
  syncing: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const initializedUserIdRef = useRef<string | null>(null);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => readStoredThemePreference() ?? "LIGHT",
  );

  const updateMutation = useMutation({
    mutationFn: (nextTheme: ThemePreference) =>
      apiFetch<{ user: AuthUser }>("/auth/me/theme", {
        method: "PATCH",
        body: JSON.stringify({ themePreference: nextTheme }),
      }),
    onSuccess: (data) => {
      const localTheme = readStoredThemePreference();
      if (!localTheme || localTheme !== data.user.themePreference) {
        return;
      }
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
  });

  const applyTheme = useCallback(
    (nextTheme: ThemePreference, userId?: string | null) => {
      persistThemePreference(nextTheme, userId);
      setThemePreferenceState(nextTheme);
    },
    [],
  );

  const syncThemeToServer = useCallback(
    (nextTheme: ThemePreference) => {
      if (!user || nextTheme === user.themePreference) {
        return;
      }
      updateMutation.mutate(nextTheme);
    },
    [updateMutation, user],
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      initializedUserIdRef.current = null;
      return;
    }

    if (initializedUserIdRef.current === user.id) {
      return;
    }

    initializedUserIdRef.current = user.id;
    applyTheme(user.themePreference, user.id);
  }, [applyTheme, loading, user]);

  const setThemePreference = useCallback(
    (nextTheme: ThemePreference) => {
      if (nextTheme === themePreference) {
        return;
      }

      applyTheme(nextTheme, user?.id);
      syncThemeToServer(nextTheme);
    },
    [applyTheme, syncThemeToServer, themePreference, user?.id],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemePreference =
      themePreference === "DARK" ? "LIGHT" : "DARK";
    setThemePreference(nextTheme);
  }, [setThemePreference, themePreference]);

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference,
        toggleTheme,
        syncing: updateMutation.isPending,
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
