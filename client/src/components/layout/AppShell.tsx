import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ThemeProvider } from "../../hooks/useTheme";
import { LoadingState } from "../feedback/LoadingState";
import { Sidebar } from "./Sidebar";

export const AppShell = () => {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return <LoadingState message="Loading session…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <ThemeProvider user={user}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 dark:border-slate-600 dark:text-slate-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {user.tenant?.name ?? "Finance Management"}
          </p>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-lg dark:bg-slate-900">
              <Sidebar
                user={user}
                onLogout={() => void logout()}
                onNavigate={closeMobile}
              />
            </aside>
          </div>
        ) : null}

        <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
          <Sidebar user={user} onLogout={() => void logout()} />
        </aside>

        <div className="lg:pl-64">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
};
