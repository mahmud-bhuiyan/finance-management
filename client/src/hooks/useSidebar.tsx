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
  persistSidebarCollapsed,
  readStoredSidebarCollapsed,
  readStoredSidebarUserId,
} from "../lib/sidebar";
import { authQueryKeys, useAuth, type AuthUser } from "./useAuth";

type SidebarContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (sidebarCollapsed: boolean) => void;
  toggleSidebar: () => void;
  syncing: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const initializedUserIdRef = useRef<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(
    () => readStoredSidebarCollapsed() ?? false,
  );

  const updateMutation = useMutation({
    mutationFn: (nextCollapsed: boolean) =>
      apiFetch<{ user: AuthUser }>("/auth/me/sidebar", {
        method: "PATCH",
        body: JSON.stringify({ sidebarCollapsed: nextCollapsed }),
      }),
    onSuccess: (data) => {
      const localCollapsed = readStoredSidebarCollapsed();
      if (
        localCollapsed === null ||
        localCollapsed !== data.user.sidebarCollapsed
      ) {
        return;
      }
      queryClient.setQueryData(authQueryKeys.me(), data.user);
    },
  });

  const applySidebar = useCallback(
    (nextCollapsed: boolean, userId?: string | null) => {
      persistSidebarCollapsed(nextCollapsed, userId);
      setSidebarCollapsedState(nextCollapsed);
    },
    [],
  );

  const syncSidebarToServer = useCallback(
    (nextCollapsed: boolean) => {
      if (!user || nextCollapsed === user.sidebarCollapsed) {
        return;
      }
      updateMutation.mutate(nextCollapsed);
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

    const storedUserId = readStoredSidebarUserId();
    const storedCollapsed = readStoredSidebarCollapsed();

    if (storedUserId === user.id && storedCollapsed !== null) {
      applySidebar(storedCollapsed, user.id);
      if (storedCollapsed !== user.sidebarCollapsed) {
        syncSidebarToServer(storedCollapsed);
      }
      return;
    }

    applySidebar(user.sidebarCollapsed, user.id);
  }, [applySidebar, loading, syncSidebarToServer, user]);

  const setSidebarCollapsed = useCallback(
    (nextCollapsed: boolean) => {
      if (nextCollapsed === sidebarCollapsed) {
        return;
      }

      applySidebar(nextCollapsed, user?.id);
      syncSidebarToServer(nextCollapsed);
    },
    [applySidebar, sidebarCollapsed, syncSidebarToServer, user?.id],
  );

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [setSidebarCollapsed, sidebarCollapsed]);

  return (
    <SidebarContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        syncing: updateMutation.isPending,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
};
