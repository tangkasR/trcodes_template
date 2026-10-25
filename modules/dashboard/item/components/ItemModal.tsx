"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import Modal from "@/common/components/Modal";
import {
  checkboxCardCls,
  checkboxInputCls,
  errorCls,
  inputCls,
  labelCls,
  numberInputCls,
  textareaCls,
} from "@/common/utils/form-styles";
import { swalError, swalSuccess } from "@/common/utils/swal";
import { itemSchema, type ItemFormInput, type ItemRow } from "../item.schema";
import { useCreateItem, useUpdateItem } from "../item.hooks";

type Props = {
  item: ItemRow | null;
  onClose: () => void;
};

export default function ItemModal({ item, onClose }: Props) {
  const router = useRouter();
  const isEdit = Boolean(item);
  const [form, setForm] = useState<ItemFormInput>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    sortOrder: item?.sortOrder ?? 0,
    isActive: item?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = itemSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path) fieldErrors[String(path)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        if (item) {
          const res = await updateMutation.mutateAsync({
            id: item.uuid,
            input: parsed.data,
          });
          if (res.ok) {
            router.refresh();
            swalSuccess(res.message ?? "Data berhasil diperbarui");
            onClose();
          } else {
            swalError("Gagal memperbarui", res.message);
          }
        } else {
          const res = await createMutation.mutateAsync(parsed.data);
          if (res.ok) {
            router.refresh();
            swalSuccess(res.message ?? "Data berhasil ditambahkan");
            onClose();
          } else {
            swalError("Gagal menambahkan", res.message);
          }
        }
      } catch (err: unknown) {
        swalError("Error", err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  };

  const pending = isPending || createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Ubah Data Item" : "Tambah Data Item"}
      subtitle={
        isEdit
          ? "Perbarui informasi data yang tersimpan."
          : "Lengkapi formulir di bawah ini untuk menambahkan data baru."
      }
      icon={Package}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelCls}>
            Nama <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className={inputCls}
            placeholder="Contoh: Nama item"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={pending}
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelCls}>Deskripsi</label>
          <textarea
            className={textareaCls}
            rows={3}
            placeholder="Deskripsi singkat (opsional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={pending}
          />
          {errors.description && <p className={errorCls}>{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Urutan Tampil</label>
            <input
              type="number"
              className={numberInputCls}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
              disabled={pending}
            />
            {errors.sortOrder && <p className={errorCls}>{errors.sortOrder}</p>}
          </div>

          <div className="flex items-end">
            <label className={checkboxCardCls}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                disabled={pending}
                className={checkboxInputCls}
              />
              <div>
                <span className="block text-sm font-semibold text-slate-800">
                  Status Aktif
                </span>
                <span className="block text-xs text-slate-500">
                  Data dapat diakses dan digunakan di sistem.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : isEdit ? "Ubah" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
