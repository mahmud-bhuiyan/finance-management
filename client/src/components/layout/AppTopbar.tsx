import type { AuthUser } from "../../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

type AppTopbarProps = {
  user: AuthUser;
  onLogout: () => void;
  onMenuClick?: () => void;
};

export const AppTopbar = ({ user, onLogout, onMenuClick }: AppTopbarProps) => (
  <header className="surface sticky top-2 z-20 mx-2 mt-2 flex items-center justify-between gap-3 overflow-visible px-4 py-3">
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
      <ThemeToggle />
      <UserMenu user={user} onLogout={onLogout} />
    </div>
  </header>
);
