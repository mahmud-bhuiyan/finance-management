import type { AuthUser } from "../../hooks/useAuth";
import { roleLabel } from "../../lib/permissions";
import { Button } from "../ui/Button";
import { ThemeToggle } from "./ThemeToggle";

type AppTopbarProps = {
  user: AuthUser;
  onLogout: () => void;
  onMenuClick?: () => void;
};

const initialsFor = (user: AuthUser) => {
  const source = (user.name ?? user.email).trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export const AppTopbar = ({ user, onLogout, onMenuClick }: AppTopbarProps) => (
  <header className="surface flex items-center justify-between gap-3 overflow-hidden px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      {onMenuClick ? (
        <button
          type="button"
          className="rounded-xl border border-(--fms-border) px-3 py-1.5 text-sm font-medium text-(--fms-ink) lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          Menu
        </button>
      ) : null}
      <p className="truncate text-sm font-semibold text-(--fms-ink) lg:hidden">
        {user.tenant?.name ?? "Finance Management"}
      </p>
    </div>

    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <ThemeToggle inline />

      <div className="hidden items-center gap-2 sm:flex">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-xs font-semibold text-(--fms-accent)">
          {initialsFor(user)}
        </span>
        <div className="max-w-48 min-w-0">
          <p className="truncate text-sm font-semibold text-(--fms-ink)">
            {user.name ?? user.email}
          </p>
          <p className="truncate text-[0.7rem] text-(--fms-faint)">
            {roleLabel(user.role)}
          </p>
        </div>
      </div>

      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-xs font-semibold text-(--fms-accent) sm:hidden"
        aria-hidden="true"
      >
        {initialsFor(user)}
      </span>

      <Button
        type="button"
        variant="ghost"
        className="px-3 py-1.5"
        onClick={onLogout}
      >
        Sign out
      </Button>
    </div>
  </header>
);
