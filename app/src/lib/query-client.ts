"use client";

import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes — stale-while-revalidate window
          gcTime: 30 * 60 * 1000, // 30 minutes — keep unused cache
          refetchOnWindowFocus: true,
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}
