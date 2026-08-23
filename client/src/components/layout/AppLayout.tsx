import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LoadingState } from "../feedback/LoadingState";
import { AppAtmosphere } from "./AppAtmosphere";
import { AppTopbar } from "./AppTopbar";
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
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#04110f]/50 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={closeMobile}
            />
            <aside className="surface relative h-full w-72 max-w-[85vw] rounded-none! border-y-0 border-l-0">
              <Sidebar user={user} onNavigate={closeMobile} />
            </aside>
          </div>
        ) : null}

        <aside className="surface fixed inset-y-2 left-2 z-20 hidden w-64 overflow-hidden lg:block">
          <Sidebar user={user} />
        </aside>

        <div className="lg:pl-68">
          <div className="sticky top-2 z-20 p-2">
            <AppTopbar
              user={user}
              onLogout={() => void logout()}
              onMenuClick={() => setMobileOpen(true)}
            />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
