// src/modules/feature/components/FeatureTable.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { usePermission } from "@/common/context/PermissionContext";
import { ACTION_LABEL } from "@/common/constants/rbac.constant";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import { formatDateTime } from "@/common/utils/format-date-time";
import { deleteFeatureAction } from "../feature.actions";
import type { FeatureRow } from "../feature.schema";
import FeatureModal from "./FeatureModal";
import { useQueryClient } from "@tanstack/react-query";
import { useListParams } from "@/common/hooks/use-list-params";
import { FeatureKeys, useFeatures } from "../feature.hooks";
import DataTable, { Column } from "@/common/components/DataTable";
import SearchBox from "@/common/components/SearchBox";

export default function FeatureTable() {
  const { can } = usePermission();

  const queryClient = useQueryClient();
  const { params, setQuery, setPage, setLimit } = useListParams();
  const query = useFeatures(params);

  const [modal, setModal] = useState<{ feature: FeatureRow | null } | null>(
    null
  );
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const canAdd = can("feature", "add");
  const canEdit = can("feature", "edit");
  const canDelete = can("feature", "delete");
  const offset = (params.page - 1) * params.limit;

  async function handleDelete(row: FeatureRow) {
    const ok = await swalConfirm({
      title: `Hapus feature "${row.name}"?`,
      text: "Semua pengaturan izin untuk fitur ini di semua role ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingUuid(row.uuid);
    const res = await deleteFeatureAction(row.uuid);
    setDeletingUuid(null);

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: FeatureKeys.all });
      swalSuccess(res.message ?? "Fitur berhasil dihapus");
    } else swalError("Gagal menghapus", res.message);
  }

  const columns: Column<FeatureRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Fitur",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">
            <code>{row.key}</code>
            {row.isSystem && (
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                Bawaan
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      header: "Deskripsi",
      cell: (row) => row.desc ?? <span className="text-slate-400">-</span>,
    },
    {
      header: "Aksi tersedia",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.availableActions.map((a) => (
            <span
              key={a}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {ACTION_LABEL[a]}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Diperbarui",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.updatedAt),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-24",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <button
              type="button"
              onClick={() => setModal({ feature: row })}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              aria-label={`Ubah ${row.name}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && !row.isSystem && (
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingUuid === row.uuid}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Hapus ${row.name}`}
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={params.q}
          onSearch={setQuery}
          placeholder="Cari fitur..."
        />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ feature: null })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="size-4" />
            Fitur
          </button>
        )}
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.uuid}
        emptyText={params.q ? "Fitur tidak ditemukan" : "Belum ada fitur"}
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
      {modal && (
        <FeatureModal
          key={modal.feature?.uuid ?? "new"} // state form dibuat baru setiap modal dibuka
          feature={modal.feature}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
