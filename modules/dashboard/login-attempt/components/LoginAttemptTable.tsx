// src/modules/login-attempt/components/LoginAttemptTable.tsx
"use client";

import { formatDateTime } from "@/common/utils/format-date-time";
import type { LoginAttemptRow } from "../login-attempt.schema";
import { useListParams } from "@/common/hooks/use-list-params";
import { useLoginAttempts } from "../login-attempt.hooks";
import DataTable, { Column } from "@/common/components/DataTable";
import SearchBox from "@/common/components/SearchBox";

export default function LoginAttemptTable() {
  const { params, setQuery, setPage, setLimit } = useListParams();
  const query = useLoginAttempts(params);

  const offset = (params.page - 1) * params.limit;

  const columns: Column<LoginAttemptRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Email",
      cell: (row) => (
        <span className="font-medium text-slate-900">{row.email}</span>
      ),
    },
    {
      header: "IP Address",
      className: "w-48",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {row.ip}
        </span>
      ),
    },
    {
      header: "Waktu Percobaan",
      className: "w-56 whitespace-nowrap",
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={params.q}
          onSearch={setQuery}
          placeholder="Cari email atau IP address..."
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.uuid}
        emptyText={
          params.q ? "Data log tidak ditemukan" : "Belum ada riwayat percobaan login"
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
