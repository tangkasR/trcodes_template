"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/common/utils/errors";
import { listParamsToSearch } from "@/common/utils/zod";
import type { ListParams, ListResponse } from "@/common/utils/zod";

import type { AuditLogRow } from "./audit-log.schema";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (params: ListParams) => ["audit-logs", "list", params] as const,
};

export function useAuditLogs(params: ListParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/audit-logs?${listParamsToSearch(params)}`, {
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
      return res.json() as Promise<ListResponse<AuditLogRow>>;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
