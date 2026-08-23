import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import type { AuthUser } from "../../hooks/useAuth";
import { roleLabel } from "../../lib/permissions";

type UserMenuProps = {
  user: AuthUser;
  onLogout: () => void;
};

const initialsFor = (user: AuthUser) => {
  const source = (user.name ?? user.email).trim();
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const menuItemClass =
  "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-(--fms-ink) hover:bg-[color-mix(in_srgb,var(--fms-accent)_10%,transparent)]";

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setPosition({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const portalTarget =
    typeof document === "undefined"
      ? null
      : (document.querySelector(".app-shell") ?? document.body);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl py-0.5 pl-1.5 transition hover:bg-[color-mix(in_srgb,var(--fms-accent)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fms-accent)"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="hidden min-w-0 max-w-48 text-right sm:block">
          <span className="block truncate text-sm font-semibold text-(--fms-ink)">
            {user.name ?? user.email}
          </span>
          <span className="block truncate text-[0.7rem] text-(--fms-faint)">
            {roleLabel(user.role)}
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_18%,transparent)] text-xs font-semibold text-(--fms-accent)">
          {initialsFor(user)}
        </span>
      </button>

      {open && position && portalTarget
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              className="surface fixed z-50 w-48 p-2"
              style={{ top: position.top, right: position.right }}
            >
              <Link
                to="/profile"
                role="menuitem"
                className={menuItemClass}
                onClick={() => setOpen(false)}
              >
                My profile
              </Link>
              <button
                type="button"
                role="menuitem"
                className={`${menuItemClass} text-(--fms-rose)`}
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
              >
                Sign out
              </button>
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
};
