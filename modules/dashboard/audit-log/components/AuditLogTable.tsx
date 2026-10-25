"use client";

import { formatDateTime } from "@/common/utils/format-date-time";
import type { AuditLogRow } from "../audit-log.schema";
import { useListParams } from "@/common/hooks/use-list-params";
import { useAuditLogs } from "../audit-log.hooks";
import DataTable, { type Column } from "@/common/components/DataTable";
import SearchBox from "@/common/components/SearchBox";

function shortUuid(value: string | null) {
  if (!value) return null;
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export default function AuditLogTable() {
  const { params, setQuery, setPage, setLimit } = useListParams();
  const query = useAuditLogs(params);

  const offset = (params.page - 1) * params.limit;

  const columns: Column<AuditLogRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Waktu",
      className: "w-48 whitespace-nowrap",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      header: "Aktor",
      className: "w-56",
      cell: (row) =>
        row.actorName || row.actorEmail ? (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {row.actorName ?? "-"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {row.actorEmail ?? "-"}
            </p>
          </div>
        ) : (
          <span className="text-slate-400">Sistem</span>
        ),
    },
    {
      header: "Aksi",
      className: "w-48",
      cell: (row) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
          {row.action}
        </span>
      ),
    },
    {
      header: "Target",
      className: "w-40",
      cell: (row) =>
        row.targetType ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              {row.targetType}
            </p>
            {row.targetUuid && (
              <p className="font-mono text-xs text-slate-400" title={row.targetUuid}>
                {shortUuid(row.targetUuid)}
              </p>
            )}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      header: "Detail",
      cell: (row) => (
        <span className="block max-w-md text-sm text-slate-600">
          {row.detail ?? "-"}
        </span>
      ),
    },
    {
      header: "IP",
      className: "w-36",
      cell: (row) =>
        row.ip ? (
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
            {row.ip}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={params.q}
          onSearch={setQuery}
          placeholder="Cari aktor, aksi, target, atau detail..."
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.uuid}
        emptyText={
          params.q
            ? "Data audit tidak ditemukan"
            : "Belum ada aktivitas yang tercatat"
        }
        isPending={query.isPending}
        isFetching={query.isFetching}
        isPlaceholderData={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        page={params.page}
        limit={params.limit}
        total={query.data?.total}
        totalPages={query.data?.totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </>
  );
}
