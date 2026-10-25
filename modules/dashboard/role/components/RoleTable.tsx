// src/modules/role/components/RoleTable.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/common/components/DataTable";
import { usePermission } from "@/common/context/PermissionContext";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import { formatDateTime } from "@/common/utils/format-date-time";
import { deleteRoleAction } from "../role.actions";
import type { RoleRow } from "../role.schema";
import RoleModal from "./RoleModal";
import { useQueryClient } from "@tanstack/react-query";
import { useListParams } from "@/common/hooks/use-list-params";
import { roleKeys, useRoles } from "../role.hooks";
import SearchBox from "@/common/components/SearchBox";

export default function RoleTable() {
  const { can } = usePermission();

  const queryClient = useQueryClient();
  const { params, setQuery, setPage, setLimit } = useListParams();
  const query = useRoles(params);

  const [modal, setModal] = useState<{ role: RoleRow | null } | null>(null);
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null);

  const canAdd = can("role", "add");
  const canEdit = can("role", "edit");
  const canDelete = can("role", "delete");
  const canViewPermission = can("role-permission", "read");
  const offset = (params.page - 1) * params.limit;

  async function handleDelete(row: RoleRow) {
    const ok = await swalConfirm({
      title: `Hapus role "${row.name}"?`,
      text: "Semua pengaturan hak akses peran ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Ya, hapus",
    });
    if (!ok) return;

    setDeletingUuid(row.uuid);
    const res = await deleteRoleAction(row.uuid);
    setDeletingUuid(null);

    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      swalSuccess(res.message ?? "Peran berhasil dihapus");
    } else swalError("Gagal menghapus", res.message);
  }

  const columns: Column<RoleRow>[] = [
    { header: "No", className: "w-12", cell: (_, i) => offset + i + 1 },
    {
      header: "Peran",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{row.name}</span>
          {row.isProtected && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
              Bawaan
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Deskripsi",
      cell: (row) => row.desc ?? <span className="text-slate-400">-</span>,
    },
    {
      header: "User",
      className: "w-20",
      cell: (row) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {row.userCount}
        </span>
      ),
    },
    {
      header: "Diperbarui",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.updatedAt),
    },
  ];

  if (canViewPermission || canEdit || canDelete) {
    columns.push({
      header: "Aksi",
      className: "w-32",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {canViewPermission && (
            <Link
              href={`/dashboard/roles/${row.uuid}`}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              aria-label={`Atur izin ${row.name}`}
              title="Atur izin"
            >
              <KeyRound className="size-4" />
            </Link>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setModal({ role: row })}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              aria-label={`Ubah ${row.name}`}
              title="Edit"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDelete && !row.isProtected && (
            <button
              type="button"
              onClick={() => handleDelete(row)}
              disabled={deletingUuid === row.uuid || row.userCount > 0}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
              aria-label={`Hapus ${row.name}`}
              title={
                row.userCount > 0
                  ? `Dipakai ${row.userCount} user, tidak bisa dihapus`
                  : "Hapus"
              }
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
          placeholder="Cari peran..."
        />
        {canAdd && (
          <button
            type="button"
            onClick={() => setModal({ role: null })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="size-4" />
            Peran
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        getKey={(r) => r.uuid}
        emptyText={params.q ? "Role tidak ditemukan" : "Belum ada role"}
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
        <RoleModal
          key={modal.role?.uuid ?? "new"}
          role={modal.role}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
