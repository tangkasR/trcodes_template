// src/modules/feature/components/FeatureModal.tsx
"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import Modal from "@/common/components/Modal";
import { swalError, swalSuccess } from "@/common/utils/swal";
import {
  inputCls,
  textareaCls,
  labelCls,
  errorCls,
  checkboxInputCls,
} from "@/common/utils/form-styles";
import {
  createFeatureAction,
  updateFeatureAction,
} from "../feature.actions";
import { ACTIONS, ACTION_LABEL, type Action } from "@/common/constants/rbac.constant";
import type { FeatureFormInput, FeatureRow } from "../feature.schema";
import { useQueryClient } from "@tanstack/react-query";
import { FeatureKeys } from "../feature.hooks";

type Props = { feature: FeatureRow | null; onClose: () => void };

export default function FeatureModal({ feature, onClose }: Props) {
  const isEdit = feature !== null;

  const [form, setForm] = useState<FeatureFormInput>({
    key: feature?.key ?? "",
    name: feature?.name ?? "",
    desc: feature?.desc ?? "",
    availableActions: feature?.availableActions ?? ["read"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  function toggleAction(action: Action) {
    const current = form.availableActions;
    const next = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setForm({ ...form, availableActions: next });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateFeatureAction(feature.uuid, form)
      : await createFeatureAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: FeatureKeys.all });

    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Ubah Fitur" : "Tambah Fitur"}
      subtitle={
        isEdit
          ? "Perbarui metadata nama, deskripsi, dan aksi yang tersedia."
          : "Daftarkan modul fitur baru ke dalam sistem perizinan RBAC."
      }
      icon={LayoutGrid}
      onClose={onClose}
      closeDisabled={pending}
    >
      <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
        <div>
          <label htmlFor="key" className={labelCls}>
            Kode Kunci (Key) <span className="text-red-500">*</span>
          </label>
          <input
            id="key"
            value={form.key}
            disabled={isEdit}
            autoFocus={!isEdit}
            placeholder="contoh: report"
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            aria-invalid={!!errors.key}
            className={inputCls}
          />
          {errors.key ? (
            <p className={errorCls}>{errors.key}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              {isEdit
                ? "Key tidak dapat diubah."
                : "Dipakai kode untuk mengecek izin. Tidak bisa diubah setelah dibuat."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className={labelCls}>
            Nama Fitur <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            value={form.name}
            autoFocus={isEdit}
            placeholder="contoh: Laporan Keuangan"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={!!errors.name}
            className={inputCls}
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="desc" className={labelCls}>
            Deskripsi Fitur
          </label>
          <textarea
            id="desc"
            rows={3}
            value={form.desc}
            placeholder="Jelaskan fungsionalitas dan kegunaan fitur ini..."
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            aria-invalid={!!errors.desc}
            className={textareaCls}
          />
          {errors.desc && <p className={errorCls}>{errors.desc}</p>}
        </div>

        <fieldset>
          <legend className={labelCls}>
            Aksi yang Tersedia <span className="text-red-500">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {ACTIONS.map((action) => (
              <label
                key={action}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 transition hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
              >
                <input
                  type="checkbox"
                  checked={form.availableActions.includes(action)}
                  onChange={() => toggleAction(action)}
                  className={checkboxInputCls}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {ACTION_LABEL[action]}
                </span>
              </label>
            ))}
          </div>
          {errors.availableActions && (
            <p className={errorCls}>{errors.availableActions}</p>
          )}
        </fieldset>

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
