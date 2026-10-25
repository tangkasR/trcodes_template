// src/modules/user/components/UserModal.tsx
"use client";

import { useRef, useState } from "react";
import {
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Modal from "@/common/components/Modal";
import { ROLE_DEFAULT } from "@/common/constants/rbac.constant";
import { swalError, swalSuccess } from "@/common/utils/swal";
import {
  inputCls,
  selectCls,
  labelCls,
  errorCls,
  checkboxCardCls,
  checkboxInputCls,
} from "@/common/utils/form-styles";
import {
  createUserAction,
  updateUserAction,
  uploadUserAvatarAction,
} from "../user.actions";
import type { RoleOption, UserFormInput, UserRow } from "../user.schema";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../user.hooks";

type Props = {
  user: UserRow | null;
  roles: RoleOption[];
  isSelf: boolean;
  onClose: () => void;
};

export default function UserModal({ user, roles, isSelf, onClose }: Props) {
  const isEdit = user !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UserFormInput>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    roleUuid:
      user?.roleUuid ?? roles.find((r) => r.name === ROLE_DEFAULT)?.uuid ?? "",
    phone: user?.phone ?? "",
    gender: user?.gender ?? null,
    photo: user?.photo ?? null,
    isActive: user?.isActive ?? true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const queryClient = useQueryClient();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar bisa pilih file yang sama jika gagal
    e.target.value = "";

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadUserAvatarAction(formData);
    setUploadingAvatar(false);

    if (res.ok && res.data?.url) {
      setForm((prev) => ({ ...prev, photo: res.data.url }));
    } else {
      swalError("Gagal Mengunggah Foto", res.message ?? "Terjadi kesalahan");
    }
  }

  function handleRemoveAvatar() {
    setForm((prev) => ({ ...prev, photo: null }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || uploadingAvatar) return;

    setPending(true);
    setErrors({});

    const res = isEdit
      ? await updateUserAction(user.uuid, form)
      : await createUserAction(form);

    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan", res.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: userKeys.all });

    onClose();
    swalSuccess(res.message ?? "Berhasil disimpan");
  }

  return (
    <Modal
      title={isEdit ? "Edit User" : "Tambah User"}
      subtitle={
        isEdit
          ? "Perbarui informasi akun, data profil, dan hak akses pengguna."
          : "Daftarkan akun pengguna baru lengkap dengan data profil ke dalam sistem."
      }
      icon={UserIcon}
      maxWidth="max-w-xl"
      onClose={onClose}
      closeDisabled={pending || uploadingAvatar}
    >
      <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
        {/* Seksi Foto Profil Avatar */}
        <div>
          <label className={labelCls}>Foto Profil</label>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-xs">
              {uploadingAvatar ? (
                <Loader2 className="size-6 animate-spin text-blue-600" />
              ) : form.photo ? (
                <Image
                  src={form.photo}
                  alt="Preview Avatar"
                  width={64}
                  height={64}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
                  {form.name ? form.name.charAt(0).toUpperCase() : <Camera className="size-6 text-white/80" />}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar || pending}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || pending}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <Camera className="size-3.5 text-slate-500" />
                {form.photo ? "Ganti Foto" : "Unggah Foto"}
              </button>

              {form.photo && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || pending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-2xs transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5 text-red-500" />
                  Hapus
                </button>
              )}
              <span className="text-[11px] text-slate-400">
                JPEG, PNG, atau WebP (Maks. 2MB)
              </span>
            </div>
          </div>
          {errors.photo && <p className={errorCls}>{errors.photo}</p>}
        </div>

        {/* Baris 1: Nama Lengkap & Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelCls}>
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              value={form.name}
              autoFocus
              autoComplete="off"
              placeholder="contoh: Tangkas Risdianto"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={!!errors.name}
              className={inputCls}
            />
            {errors.name && <p className={errorCls}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>
              Alamat Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              autoComplete="off"
              placeholder="nama@email.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-invalid={!!errors.email}
              className={inputCls}
            />
            {errors.email && <p className={errorCls}>{errors.email}</p>}
          </div>
        </div>

        {/* Baris 2: Nomor Telepon & Jenis Kelamin */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelCls}>
              Nomor Telepon / WhatsApp
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone ?? ""}
              autoComplete="off"
              placeholder="contoh: 081234567890"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              aria-invalid={!!errors.phone}
              className={inputCls}
            />
            {errors.phone && <p className={errorCls}>{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="gender" className={labelCls}>
              Jenis Kelamin
            </label>
            <div className="relative">
              <select
                id="gender"
                value={form.gender ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: (e.target.value as "MALE" | "FEMALE") || null,
                  })
                }
                aria-invalid={!!errors.gender}
                className={selectCls}
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.gender && <p className={errorCls}>{errors.gender}</p>}
          </div>
        </div>

        {/* Baris 3: Password & Hak Akses Role */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelCls}>
              Password
              {isEdit && (
                <span className="font-normal text-slate-400"> (opsional)</span>
              )}
              {!isEdit && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                autoComplete="new-password"
                placeholder={
                  isEdit ? "Kosongkan jika tidak diubah" : "Minimal 12 karakter"
                }
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-invalid={!!errors.password}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className={errorCls}>{errors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                {isEdit
                  ? "Kosongkan jika tidak ingin mengubah password."
                  : "Minimal 12 karakter, mengandung huruf & angka."}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="roleUuid" className={labelCls}>
              Hak Akses Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="roleUuid"
                value={form.roleUuid}
                disabled={isSelf}
                onChange={(e) => setForm({ ...form, roleUuid: e.target.value })}
                aria-invalid={!!errors.roleUuid}
                className={selectCls}
              >
                <option value="" disabled>
                  Pilih role
                </option>
                {roles.map((r) => (
                  <option key={r.uuid} value={r.uuid}>
                    {r.name}
                  </option>
                ))}
                {user && !roles.some((r) => r.uuid === user.roleUuid) && (
                  <option value={user.roleUuid}>{user.roleName}</option>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.roleUuid ? (
              <p className={errorCls}>{errors.roleUuid}</p>
            ) : (
              isSelf && (
                <p className="mt-1 text-xs text-slate-400">
                  Kamu tidak dapat mengubah role akunmu sendiri.
                </p>
              )
            )}
          </div>
        </div>

        {/* Status Keaktifan Akun (isActive) */}
        <div>
          <label className={labelCls}>Status Akun</label>
          <label
            className={`${checkboxCardCls} ${
              isSelf ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              disabled={isSelf}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className={checkboxInputCls}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                {form.isActive ? "Akun Aktif" : "Akun Dinonaktifkan"}
              </span>
              <span className="text-xs text-slate-500">
                {form.isActive
                  ? "Pengguna dapat masuk dan menggunakan seluruh fitur sesuai hak aksesnya."
                  : "Pengguna tidak dapat masuk ke sistem. Seluruh sesi aktif akan segera diputus."}
              </span>
            </div>
          </label>
          {errors.isActive && <p className={errorCls}>{errors.isActive}</p>}
          {isSelf && (
            <p className="mt-1 text-xs text-slate-400">
              Kamu tidak dapat menonaktifkan akun yang sedang kamu gunakan.
            </p>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={pending || uploadingAvatar}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending || uploadingAvatar}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : isEdit ? "Ubah" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
