import { NavLink } from "react-router-dom";
import type { AuthUser } from "../../hooks/useAuth";
import { navSectionsForUser } from "../../lib/nav";
import { roleLabel } from "../../lib/permissions";
import { Button } from "../ui/Button";
import { ThemeToggle } from "./ThemeToggle";

type SidebarProps = {
  user: AuthUser;
  onLogout: () => void;
  onNavigate?: () => void;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm font-medium",
    isActive
      ? "bg-teal-700 text-white"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  ].join(" ");

export const Sidebar = ({ user, onLogout, onNavigate }: SidebarProps) => {
  const sections = navSectionsForUser(user);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-5 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          Finance Management
        </p>
        <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {user.tenant?.name ?? "Platform"}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {sections.map((section) => (
          <div key={section.id} className="mb-5 last:mb-0">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
        <ThemeToggle />
        <p className="mt-3 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {user.name ?? user.email}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{roleLabel(user.role)}</p>
        <Button type="button" className="mt-3 w-full" onClick={onLogout}>
          Sign out
        </Button>
      </div>
    </div>
  );
};
