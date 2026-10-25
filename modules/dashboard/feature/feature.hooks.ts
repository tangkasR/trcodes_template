"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/utils/errors";
import { listParamsToSearch } from "@/common/utils/zod";
import type { ListParams, ListResponse } from "@/common/utils/zod";


import type { FeatureRow } from "./feature.schema";

export const FeatureKeys = {
  all: ["features"] as const,
  list: (params: ListParams) => ["features", "list", params] as const,
};

export function useFeatures(params: ListParams) {
  return useQuery({
    queryKey: FeatureKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/features?${listParamsToSearch(params)}`, {
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
      return res.json() as Promise<ListResponse<FeatureRow>>;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
