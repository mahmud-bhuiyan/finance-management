import { useAccessProbes } from "../hooks/useAccessProbes";
import type { AuthUser } from "../../../hooks/useAuth";

type AccessProbeCardProps = {
  user: AuthUser;
};

export const AccessProbeCard = ({ user }: AccessProbeCardProps) => {
  const { probes, running, runProbes } = useAccessProbes(user);

  return (
    <section className="surface p-6">
      <h2 className="font-display text-2xl font-medium italic text-(--fms-ink)">Access probes</h2>
      <p className="mb-4 text-sm text-(--fms-muted)">
        Calls protected RBAC endpoints for this signed-in user. Expected results
        depend on role and company membership.
      </p>

      <ul className="space-y-3">
        {probes.map((probe) => (
          <li
            key={probe.label}
            className="rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-900">
                {probe.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                  probe.status === "ok"
                    ? "bg-emerald-100 text-emerald-800"
                    : probe.status === "denied"
                      ? "bg-amber-100 text-amber-800"
                      : probe.status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-200 text-slate-700"
                }`}
              >
                {probe.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{probe.detail}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => void runProbes()}
        disabled={running}
        className="mt-4 rounded-xl bg-[linear-gradient(180deg,var(--fms-accent-soft),var(--fms-accent))] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 dark:text-[#04110f]"
      >
        {running ? "Running probes…" : "Run access probes"}
      </button>
    </section>
  );
};
