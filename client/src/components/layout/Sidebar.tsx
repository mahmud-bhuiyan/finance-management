import { NavLink } from "react-router-dom";
import type { AuthUser } from "../../hooks/useAuth";
import { navSectionsForUser } from "../../lib/nav";
import { roleLabel } from "../../lib/permissions";
import { Button } from "../ui/Button";
import { BrandMark, navIconFor } from "./NavIcons";
import { ThemeToggle } from "./ThemeToggle";

type SidebarProps = {
  user: AuthUser;
  onLogout: () => void;
  onNavigate?: () => void;
};

const initialsFor = (user: AuthUser) => {
  const source = (user.name ?? user.email).trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const Sidebar = ({ user, onLogout, onNavigate }: SidebarProps) => {
  const sections = navSectionsForUser(user);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <BrandMark />
        <div className="min-w-0">
          <p className="font-display text-[0.7rem] font-semibold tracking-[0.18em] text-(--fms-accent) uppercase">
            Finance
          </p>
          <p className="truncate text-sm font-semibold text-(--fms-ink)">
            {user.tenant?.name ?? "Platform"}
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {sections.map((section) => (
          <div key={section.id} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.16em] text-(--fms-faint) uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      ["nav-link", isActive ? "is-active" : ""].join(" ")
                    }
                    onClick={onNavigate}
                  >
                    {navIconFor(item.to)}
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-[1.15rem] border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface-strong)_80%,transparent)] p-3">
        <ThemeToggle />
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-xs font-semibold text-(--fms-accent)">
            {initialsFor(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-(--fms-ink)">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-[0.7rem] text-(--fms-faint)">
              {roleLabel(user.role)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={onLogout}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};
