import { Link, Navigate } from "react-router-dom";
import { PageFrame } from "../../components/layout/PageFrame";
import { navIconFor } from "../../components/layout/NavIcons";
import { useAuth } from "../../hooks/useAuth";
import { navSectionsForUser } from "../../lib/nav";
import { roleLabel } from "../../lib/permissions";
import { UserSessionCard } from "./components/UserSessionCard";

const homeCopy = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "Create companies and company admins from Companies. Audit covers platform-wide activity.";
    case "COMPANY_ADMIN":
      return "Use the sidebar for expenses, income, reports, users, and custom fields.";
    case "NORMAL_USER":
      return "Dashboards, reports, and lists are read-only. You cannot create or edit financial records.";
    default:
      return "Use the sidebar to move around the workspace.";
  }
};

export const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const shortcuts = navSectionsForUser(user)
    .flatMap((section) => section.items)
    .filter((item) => item.to !== "/");

  const firstName = user.name?.split(" ")[0];

  return (
    <PageFrame>
      <div className="surface relative overflow-hidden p-7 lg:p-9">
        <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-(--fms-accent) uppercase">
          Finance Management System
        </p>
        <h1 className="font-display mt-3 max-w-xl text-4xl font-medium tracking-tight text-(--fms-ink) italic lg:text-6xl">
          Welcome{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-(--fms-muted)">
          {homeCopy(user.role)}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_srgb,var(--fms-accent)_14%,transparent)] px-3 py-1 text-xs font-semibold tracking-wide text-(--fms-accent)">
            {roleLabel(user.role)}
          </span>
          {user.tenant ? (
            <span className="rounded-full border border-(--fms-border) px-3 py-1 text-xs font-medium text-(--fms-muted)">
              {user.tenant.name}
            </span>
          ) : (
            <span className="rounded-full border border-(--fms-border) px-3 py-1 text-xs font-medium text-(--fms-muted)">
              Platform
            </span>
          )}
        </div>
      </div>

      {shortcuts.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-[0.16em] text-(--fms-faint) uppercase">
            Jump in
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-3">
            {shortcuts.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="surface group flex items-center gap-3 p-4 transition hover:-translate-y-0.5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--fms-accent)_12%,transparent)] text-(--fms-accent)">
                  {navIconFor(item.to)}
                </span>
                <span className="text-sm font-semibold text-(--fms-ink) group-hover:text-(--fms-accent)">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <UserSessionCard user={user} />
    </PageFrame>
  );
};
