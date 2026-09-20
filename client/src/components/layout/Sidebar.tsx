import { NavLink } from "react-router-dom";
import type { AuthUser } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";
import { navSectionsForUser } from "../../lib/nav";
import { BrandMark, navIconFor } from "./NavIcons";

type SidebarProps = {
  user: AuthUser;
  onNavigate?: () => void;
  /** Desktop drawer only — mobile always shows full labels. */
  collapsed?: boolean;
};

const collapseIconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ChevronLeftIcon = () => (
  <svg {...collapseIconProps}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg {...collapseIconProps}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const Sidebar = ({ user, onNavigate, collapsed = false }: SidebarProps) => {
  const { toggleSidebar } = useSidebar();
  const sections = navSectionsForUser(user);
  const showCollapseToggle = onNavigate === undefined;

  return (
    <div className="flex h-full flex-col">
      <div
        className={[
          "flex items-center py-5",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
        ].join(" ")}
      >
        <BrandMark />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="font-display text-[0.7rem] font-semibold tracking-[0.18em] text-(--fms-accent) uppercase">
              Finance
            </p>
            <p className="truncate text-sm font-semibold text-(--fms-ink)">
              {user.tenant?.name ?? "Platform"}
            </p>
          </div>
        ) : null}
      </div>

      <nav
        className={[
          "min-h-0 flex-1 overflow-y-auto pb-4",
          collapsed ? "px-2" : "px-3",
        ].join(" ")}
        aria-label="Main"
      >
        {sections.map((section) => (
          <div key={section.id} className="mb-5 last:mb-0">
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-[0.65rem] font-semibold tracking-[0.16em] text-(--fms-faint) uppercase">
                {section.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      [
                        "nav-link",
                        isActive ? "is-active" : "",
                        collapsed ? "nav-link--collapsed" : "",
                      ].join(" ")
                    }
                    onClick={onNavigate}
                  >
                    {navIconFor(item.to)}
                    {!collapsed ? item.label : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {showCollapseToggle ? (
        <div className={collapsed ? "px-2 pb-4" : "px-3 pb-4"}>
          <button
            type="button"
            className={[
              "flex w-full items-center rounded-xl border border-(--fms-border) text-sm font-medium text-(--fms-muted) transition-colors hover:text-(--fms-ink)",
              collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-3 py-2",
            ].join(" ")}
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
};
