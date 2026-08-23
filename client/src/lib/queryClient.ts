import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";

export const toQueryErrorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
