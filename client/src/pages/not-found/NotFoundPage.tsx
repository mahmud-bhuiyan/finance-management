import { Link, useLocation } from "react-router-dom";
import { PageFrame } from "../../components/layout/PageFrame";
import { PageHeader } from "../../components/layout/PageHeader";

export const NotFoundPage = () => {
  const { pathname } = useLocation();

  return (
    <PageFrame>
      <PageHeader
        kicker="Error 404"
        title="Page not found"
        description="This address is not part of the workspace. Check the URL or return home."
        actions={
          <Link
            to="/"
            className="inline-flex rounded-xl bg-[linear-gradient(180deg,var(--fms-accent-soft),var(--fms-accent))] px-4 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_10px_24px_-12px_var(--fms-accent)] hover:brightness-110 dark:text-[#04110f]"
          >
            Back to home
          </Link>
        }
      />

      <section className="surface p-6">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-(--fms-faint) uppercase">
          Requested path
        </p>
        <p className="mt-2 font-mono text-sm break-all text-(--fms-ink)">{pathname}</p>
      </section>
    </PageFrame>
  );
};
