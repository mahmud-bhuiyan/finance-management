import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "../feedback/LoadingState";
import { AppAtmosphere } from "./AppAtmosphere";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="app-shell min-h-screen">
        <AppAtmosphere />
        <LoadingState message="Loading session…" fullPage />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-shell min-h-screen">
      <AppAtmosphere />
      <div className="app-content">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface)_88%,transparent)] px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="rounded-xl border border-(--fms-border) px-3 py-1.5 text-sm font-medium text-(--fms-ink)"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
          <p className="truncate text-sm font-semibold text-(--fms-ink)">
            {user.tenant?.name ?? "Finance Management"}
          </p>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#04110f]/50 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <aside className="surface relative h-full w-72 max-w-[85vw] rounded-none! border-y-0 border-l-0">
              <Sidebar
                user={user}
                onLogout={() => void logout()}
                onNavigate={closeMobile}
              />
            </aside>
          </div>
        ) : null}

        <aside className="surface fixed inset-y-3 left-3 z-20 hidden w-66 overflow-hidden lg:block">
          <Sidebar user={user} onLogout={() => void logout()} />
        </aside>

        <div className="lg:pl-72">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
