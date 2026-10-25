// src/modules/role/components/RoleModal.tsx
"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import Modal from "@/common/components/Modal";
import { swalError, swalSuccess } from "@/common/utils/swal";
import { inputCls, textareaCls, labelCls, errorCls } from "@/common/utils/form-styles";
import { createRoleAction, updateRoleAction } from "../role.actions";
import type { RoleFormInput, RoleRow } from "../role.schema";
import { useQueryClient } from "@tanstack/react-query";
import { roleKeys } from "../role.hooks";

type Props = { role: RoleRow | null; onClose: () => void };

export default function RoleModal({ role, onClose }: Props) {
  const isEdit = role !== null;

  const [form, setForm] = useState<RoleFormInput>({
    name: role?.name ?? "",
    desc: role?.desc ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateRoleAction(role.uuid, form)
      : await createRoleAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: roleKeys.all });

    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Ubah Peran" : "Tambah Peran"}
      subtitle={
        isEdit
          ? "Perbarui informasi nama dan deskripsi peran."
          : "Buat peran pengguna baru untuk mengatur hak akses aplikasi."
      }
      icon={Shield}
      onClose={onClose}
      closeDisabled={pending}
    >
      <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
        <div>
          <label htmlFor="name" className={labelCls}>
            Nama Peran <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            value={form.name}
            autoFocus
            disabled={role?.isProtected}
            placeholder="contoh: Editor Konten"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            className={inputCls}
          />
          {errors.name ? (
            <p className={errorCls}>{errors.name}</p>
          ) : (
            role?.isProtected && (
              <p className="mt-1 text-xs text-slate-400">
                Nama peran bawaan sistem tidak dapat diubah.
              </p>
            )
          )}
        </div>

        <div>
          <label htmlFor="desc" className={labelCls}>
            Deskripsi Peran
          </label>
          <textarea
            id="desc"
            rows={3}
            value={form.desc}
            placeholder="Jelaskan ruang lingkup tanggung jawab peran ini..."
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            aria-invalid={!!errors.desc}
            className={textareaCls}
          />
          {errors.desc && <p className={errorCls}>{errors.desc}</p>}
        </div>

        {!isEdit && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-700">
            Peran baru belum memiliki izin apa pun. Atur izinnya lewat tombol
            &quot;Atur izin&quot; setelah peran dibuat.
          </div>
        )}

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
