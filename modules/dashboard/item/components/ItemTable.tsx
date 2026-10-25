"use client";

import { useState } from "react";
import { Edit2, Plus, Search, Trash2, Package } from "lucide-react";
import Pagination from "@/common/components/Pagination";
import { usePermission } from "@/common/context/PermissionContext";
import { swalConfirm, swalError, swalSuccess } from "@/common/utils/swal";
import type { ItemRow } from "../item.schema";
import { useDeleteItem } from "../item.hooks";
import ItemModal from "./ItemModal";

type Props = {
  initialData: ItemRow[];
  total: number;
  initialPage: number;
  initialPageSize: number;
};

export default function ItemTable({
  initialData,
  total,
  initialPage,
  initialPageSize,
}: Props) {
  const { can } = usePermission();
  const [data, setData] = useState<ItemRow[]>(initialData);
  const [prevInitial, setPrevInitial] = useState(initialData);
  if (initialData !== prevInitial) {
    setPrevInitial(initialData);
    setData(initialData);
  }
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialPageSize);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemRow | null>(null);

  const totalPages = Math.ceil(total / (limit || 10)) || 1;
  const deleteMutation = useDeleteItem();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ItemRow) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item: ItemRow) => {
    const ok = await swalConfirm({
      title: "Hapus Data Item?",
      text: `Apakah Anda yakin ingin menghapus "${item.name}"?`,
      confirmText: "Ya, Hapus",
    });

    if (ok) {
      try {
        const res = await deleteMutation.mutateAsync(item.uuid);
        if (res.ok) {
          swalSuccess(res.message ?? "Data berhasil dihapus");
          setData((prev) => prev.filter((d) => d.uuid !== item.uuid));
        } else {
          swalError("Gagal menghapus", res.message);
        }
      } catch (err: unknown) {
        swalError("Error", err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    }
  };

  const filtered = data.filter((d) =>
    search ? d.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari data item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {can("item", "add") && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="size-4" />
            <span>Tambah Data Item</span>
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Nama</th>
                <th className="px-5 py-3.5">Deskripsi</th>
                <th className="px-5 py-3.5 text-center">Urutan</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Package className="mx-auto mb-2 size-8 text-slate-300" />
                    Belum ada data data item.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.uuid} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.name}
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                      {item.description || "-"}
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-slate-500">
                      {item.sortOrder}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can("item", "edit") && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                            title="Ubah"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                        )}
                        {can("item", "delete") && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                            title="Hapus"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {modalOpen && (
        <ItemModal
          key={editingItem?.uuid ?? "new"}
          onClose={() => setModalOpen(false)}
          item={editingItem}
        />
      )}
    </div>
  );
}
