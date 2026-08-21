import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status?: string;
  tenantId: string | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ ok: boolean; user: AuthUser }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ ok: boolean; user: AuthUser }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    setUser(data.user);
  };

  const register = async (input: {
    email: string;
    password: string;
    name?: string;
  }) => {
    const data = await apiFetch<{ ok: boolean; user: AuthUser }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    setUser(data.user);
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
