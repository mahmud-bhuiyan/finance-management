import type { SupportKind } from "./supportData";

export type SupportListOptions = {
  includeInactive?: boolean;
  active?: boolean;
};

export const supportDataQueryKeys = {
  all: ["support-data"] as const,
  lists: () => [...supportDataQueryKeys.all, "list"] as const,
  list: (kind: SupportKind, options: SupportListOptions = {}) =>
    [...supportDataQueryKeys.lists(), kind, options] as const,
};
