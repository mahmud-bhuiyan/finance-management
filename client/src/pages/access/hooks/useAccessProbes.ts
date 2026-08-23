import { useMutation } from "@tanstack/react-query";
import { ApiError } from "../../../lib/api";
import { PERMISSIONS, roleCan } from "../../../lib/permissions";
import type { AuthUser } from "../../../hooks/useAuth";
import { probeAccess } from "./useRbacProfile";

type ProbeStatus = "idle" | "ok" | "denied" | "error";

export type AccessProbeResult = {
  label: string;
  status: ProbeStatus;
  detail: string;
};

const probeDefinitions = [
  {
    label: "Tenant management (Super Admin)",
    path: "/rbac/probes/tenants-manage",
    permission: PERMISSIONS.TENANTS_MANAGE,
  },
  {
    label: "Finance write (Company Admin)",
    path: "/rbac/probes/finance-write",
    permission: PERMISSIONS.FINANCE_WRITE,
  },
  {
    label: "Reports read (tenant users)",
    path: "/rbac/probes/reports-read",
    permission: PERMISSIONS.REPORTS_READ,
  },
] as const;

const initialProbes = (): AccessProbeResult[] =>
  probeDefinitions.map((probe) => ({
    label: probe.label,
    status: "idle",
    detail: "Not tested yet",
  }));

const runProbe = async (
  path: string,
  expectedAllowed: boolean,
): Promise<Pick<AccessProbeResult, "status" | "detail">> => {
  try {
    const data = await probeAccess(path);
    return {
      status: expectedAllowed ? "ok" : "error",
      detail: data.message,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return {
        status: expectedAllowed ? "denied" : "ok",
        detail: err.message,
      };
    }

    return {
      status: "error",
      detail: err instanceof Error ? err.message : "Request failed",
    };
  }
};

export const useAccessProbes = (user: AuthUser) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.all(
        probeDefinitions.map(async (probe, index) => {
          const outcome = await runProbe(
            probe.path,
            roleCan(user.role, probe.permission),
          );
          return {
            label: probeDefinitions[index].label,
            ...outcome,
          };
        }),
      );
      return results;
    },
  });

  return {
    probes: mutation.data ?? initialProbes(),
    running: mutation.isPending,
    runProbes: mutation.mutateAsync,
  };
};
