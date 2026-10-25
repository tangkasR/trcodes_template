"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/utils/errors";
import { listParamsToSearch } from "@/common/utils/zod";
import type { ListParams, ListResponse } from "@/common/utils/zod";


import type { UserRow } from "./user.schema";

export const userKeys = {
  all: ["users"] as const,
  list: (params: ListParams) => ["users", "list", params] as const,
};

export function useUsers(params: ListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/users?${listParamsToSearch(params)}`, {
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
      return res.json() as Promise<ListResponse<UserRow>>;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
