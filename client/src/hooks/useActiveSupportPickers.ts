import { useQueries } from "@tanstack/react-query";
import { listSupportItems, SUPPORT_KINDS } from "../lib/supportData";
import { supportDataQueryKeys } from "../lib/supportQueryKeys";

const activePickerOptions = { active: true } as const;

export const useActiveSupportPickers = (enabled: boolean) => {
  const results = useQueries({
    queries: SUPPORT_KINDS.map((kind) => ({
      queryKey: supportDataQueryKeys.list(kind, activePickerOptions),
      queryFn: () => listSupportItems(kind, activePickerOptions),
      enabled,
    })),
  });

  return {
    categories: results[0].data ?? [],
    departments: results[1].data ?? [],
    vendors: results[2].data ?? [],
    loading: results.some((result) => result.isPending),
  };
};
