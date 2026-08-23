import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
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
  updatedAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
};

const fetchAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const data = await apiFetch<{ user: AuthUser }>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: fetchAuthUser,
    retry: false,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({
      email,
      password,
      rememberMe,
    }: {
      email: string;
      password: string;
      rememberMe: boolean;
    }) =>
      apiFetch<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      name?: string;
    }) =>
      apiFetch<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.me(), null);
    },
  });

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ) => {
    await loginMutation.mutateAsync({ email, password, rememberMe });
  };

  const register = async (input: {
    email: string;
    password: string;
    name?: string;
  }) => {
    await registerMutation.mutateAsync(input);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data ?? null,
        loading: meQuery.isPending,
        login,
        register,
        logout,
        refresh,
      }}
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
