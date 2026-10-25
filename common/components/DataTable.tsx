/* eslint-disable @next/next/no-location-assign-relative-destination */
// src/components/DataTable.tsx
"use client";

import { useEffect } from "react";
import { AlertCircle, Inbox, RefreshCw, Loader2 } from "lucide-react";
import Pagination from "@/common/components/Pagination";
import { ApiError } from "@/common/utils/errors";

export type Column<T> = {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[] | undefined;
  getKey: (row: T) => string;
  emptyText?: string;
  isPending: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  limit: number;
  total: number | undefined;
  totalPages: number | undefined;
  onPageChange: (page: number, replace?: boolean) => void;
  onLimitChange?: (limit: number) => void;
};

function TableSkeleton<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
      aria-busy="true"
      aria-label="Memuat data"
    >
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="border-b border-slate-200/80 bg-slate-50/90">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-4">
                  <div className="h-4 animate-pulse rounded-full bg-slate-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DataTable<T>({
  columns,
  rows,
  getKey,
  emptyText,
  isPending,
  isFetching,
  isPlaceholderData,
  error,
  onRetry,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: Props<T>) {
  const unauthorized = error instanceof ApiError && error.status === 401;
  const forbidden = error instanceof ApiError && error.status === 403;

  // sesi berakhir: kembali ke login
  useEffect(() => {
    if (unauthorized) window.location.assign("/login");
  }, [unauthorized]);

  // halaman sudah tidak ada (misalnya item terakhir di halaman itu dihapus): mundur ke halaman terakhir
  useEffect(() => {
    if (!isPlaceholderData && totalPages !== undefined && page > totalPages) {
      onPageChange(totalPages, true);
    }
  }, [isPlaceholderData, totalPages, page, onPageChange]);

  if (error && !rows) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center shadow-xs"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="size-6" />
        </div>
        <p className="mt-3 font-semibold text-red-900">Gagal memuat data</p>
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
        {!forbidden && !unauthorized && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-2xs transition hover:bg-red-50"
          >
            <RefreshCw className="size-3.5" />
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  if (isPending || !rows) return <TableSkeleton columns={columns} />;

  return (
    <div className="space-y-4">
      <div
        aria-busy={isFetching}
        className={`relative transition-opacity duration-200 ${
          isFetching && isPlaceholderData ? "opacity-60" : "opacity-100"
        }`}
      >
        {isFetching && !isPending && (
          <div className="absolute right-4 top-3 z-10 flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 shadow-2xs backdrop-blur-xs">
            <Loader2 className="size-3 animate-spin text-blue-600" />
            <span>Memperbarui data...</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/90">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    scope="col"
                    className={`px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                      col.className ?? ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Inbox className="size-6" />
                    </div>
                    <p className="mt-3 font-semibold text-slate-800">
                      {emptyText ?? "Tidak ada data ditemukan"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Coba sesuaikan kata kunci pencarian atau tambahkan data baru.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={getKey(row)}
                    className="transition-colors duration-150 hover:bg-slate-50/80"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.header}
                        className={`px-4 py-3.5 text-slate-700 ${
                          col.className ?? ""
                        }`}
                      >
                        {col.cell(row, i)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={Math.max(1, totalPages ?? 1)}
        total={total ?? 0}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
