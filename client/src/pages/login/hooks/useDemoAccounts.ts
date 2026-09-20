import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api";
import type { DemoAccount } from "../components/DemoAccountPicker";

type DemoUsersResponse = {
  users: DemoAccount[];
};

export const demoAccountQueryKeys = {
  all: ["auth", "demo-users"] as const,
};

export const useDemoAccounts = () => {
  const query = useQuery({
    queryKey: demoAccountQueryKeys.all,
    queryFn: () => apiFetch<DemoUsersResponse>("/auth/demo-users"),
    staleTime: 60 * 1000,
    retry: 2,
  });

  return {
    accounts: query.data?.users ?? [],
    loading: query.isPending,
  };
};
