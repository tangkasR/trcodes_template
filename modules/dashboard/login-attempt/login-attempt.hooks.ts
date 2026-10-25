"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/utils/errors";
import { listParamsToSearch } from "@/common/utils/zod";
import type { ListParams, ListResponse } from "@/common/utils/zod";

import type { LoginAttemptRow } from "./login-attempt.schema";

export const loginAttemptKeys = {
  all: ["login-attempts"] as const,
  list: (params: ListParams) => ["login-attempts", "list", params] as const,
};

export function useLoginAttempts(params: ListParams) {
  return useQuery({
    queryKey: loginAttemptKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/login-attempts?${listParamsToSearch(params)}`, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiError(
          res.status,
          typeof body?.message === "string" ? body.message : "Gagal memuat data"
        );
      }
      return res.json() as Promise<ListResponse<LoginAttemptRow>>;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
