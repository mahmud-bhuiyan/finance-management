import { useState } from "react";
import { ApiError } from "../../../lib/api";
import { PERMISSIONS, roleCan } from "../../../lib/permissions";
import type { AuthUser } from "../../../hooks/useAuth";
import { probeAccess } from "../hooks/useRbacProfile";

type ProbeResult = {
  label: string;
  status: "idle" | "ok" | "denied" | "error";
  detail: string;
};

type AccessProbeCardProps = {
  user: AuthUser;
};

const initialProbes = (): ProbeResult[] => [
  {
    label: "Tenant management (Super Admin)",
    status: "idle",
    detail: "Not tested yet",
  },
  {
    label: "Finance write (Company Admin)",
    status: "idle",
    detail: "Not tested yet",
  },
  {
    label: "Reports read (tenant users)",
    status: "idle",
    detail: "Not tested yet",
  },
];

export const AccessProbeCard = ({ user }: AccessProbeCardProps) => {
  const [probes, setProbes] = useState(initialProbes);
  const [running, setRunning] = useState(false);

  const runProbes = async () => {
    setRunning(true);

    const next = initialProbes();

    const runOne = async (
      index: number,
      path: string,
      expectedAllowed: boolean,
    ) => {
      try {
        const data = await probeAccess(path);
        next[index] = {
          label: next[index].label,
          status: expectedAllowed ? "ok" : "error",
          detail: data.message,
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          next[index] = {
            label: next[index].label,
            status: expectedAllowed ? "denied" : "ok",
            detail: err.message,
          };
          return;
        }

        next[index] = {
          label: next[index].label,
          status: "error",
          detail: err instanceof Error ? err.message : "Request failed",
        };
      }
    };

    await runOne(
      0,
      "/rbac/probes/tenants-manage",
      roleCan(user.role, PERMISSIONS.TENANTS_MANAGE),
    );
    await runOne(
      1,
      "/rbac/probes/finance-write",
      roleCan(user.role, PERMISSIONS.FINANCE_WRITE),
    );
    await runOne(
      2,
      "/rbac/probes/reports-read",
      roleCan(user.role, PERMISSIONS.REPORTS_READ),
    );

    setProbes(next);
    setRunning(false);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-medium text-slate-900">Access probes</h2>
      <p className="mb-4 text-sm text-slate-600">
        Calls protected RBAC endpoints for this signed-in user. Expected results
        depend on role and company membership.
      </p>

      <ul className="space-y-3">
        {probes.map((probe) => (
          <li
            key={probe.label}
            className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
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
        className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {running ? "Running probes…" : "Run access probes"}
      </button>
    </section>
  );
};
