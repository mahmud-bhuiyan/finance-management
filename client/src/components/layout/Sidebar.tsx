import { NavLink } from "react-router-dom";
import type { AuthUser } from "../../hooks/useAuth";
import { navSectionsForUser } from "../../lib/nav";
import { BrandMark, navIconFor } from "./NavIcons";

type SidebarProps = {
  user: AuthUser;
  onNavigate?: () => void;
};

export const Sidebar = ({ user, onNavigate }: SidebarProps) => {
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
    </div>
  );
};
