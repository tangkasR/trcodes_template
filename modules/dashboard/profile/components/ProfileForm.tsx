// src/modules/dashboard/profile/components/ProfileForm.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ChevronDown,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { swalError, swalSuccess } from "@/common/utils/swal";
import { inputCls, selectCls, labelCls, errorCls } from "@/common/utils/form-styles";
import { formatDateTime } from "@/common/utils/format-date-time";
import {
  updateProfileAction,
  uploadProfileAvatarAction,
} from "../profile.actions";
import type { ProfileUpdateInput, UserProfileData } from "../profile.schema";

type Props = {
  initialData: UserProfileData;
};

export default function ProfileForm({ initialData }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileUpdateInput>({
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone,
    gender: initialData.gender,
    photo: initialData.photo,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadProfileAvatarAction(formData);
    setUploadingAvatar(false);

    if (res.ok && res.data?.url) {
      setForm((prev) => ({ ...prev, photo: res.data.url }));
      swalSuccess("Foto profil berhasil diunggah. Klik 'Simpan Perubahan' untuk menerapkan.");
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

    const res = await updateProfileAction(form);
    setPending(false);

    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      else swalError("Gagal menyimpan profil", res.message);
      return;
    }

    swalSuccess(res.message ?? "Profil berhasil diperbarui");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Kolom Kiri: Avatar & Kartu Identitas */}
      <div className="space-y-6 lg:col-span-4">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="text-center">
            {/* Foto Profil */}
            <div className="relative mx-auto mb-4 flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200/70 sm:size-32">
              {uploadingAvatar ? (
                <Loader2 className="size-8 animate-spin text-blue-600" />
              ) : form.photo ? (
                <Image
                  src={form.photo}
                  alt={form.name}
                  width={128}
                  height={128}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-extrabold text-white">
                  {form.name ? form.name.charAt(0).toUpperCase() : <User className="size-10 text-white/80" />}
                </span>
              )}
            </div>

            {/* Nama & Role */}
            <h2 className="text-lg font-bold text-slate-900">{form.name || initialData.name}</h2>
            <p className="text-xs text-slate-500">{form.email || initialData.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                <ShieldCheck className="size-3.5 text-purple-600" />
                {initialData.roleName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {initialData.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>

            {/* Kontrol Foto */}
            <div className="mt-5 flex flex-col items-center gap-2 border-t border-slate-100 pt-5">
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <Camera className="size-4 text-slate-500" />
                {form.photo ? "Ganti Foto Profil" : "Unggah Foto Profil"}
              </button>

              {form.photo && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || pending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-2xs transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="size-4 text-red-500" />
                  Hapus Foto
                </button>
              )}
              <span className="text-[11px] text-slate-400">
                Format JPEG, PNG, atau WebP (Maks. 2MB)
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Terdaftar sejak: {formatDateTime(initialData.createdAt)}
            </p>
          </div>
        </div>

        {/* Kartu Pintasan Keamanan */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/80">
              <KeyRound className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900">Keamanan Akun</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Ganti password login, aktifkan verifikasi 2 langkah (MFA/TOTP), atau cabut sesi perangkat.
              </p>
              <Link
                href="/dashboard/security"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Kelola Keamanan & Perangkat &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Form Edit Data Diri */}
      <div className="lg:col-span-8">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Data Personal</h2>
            <p className="mt-1 text-xs text-slate-500">
              Perbarui nama, alamat email, kontak, dan jenis kelamin Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="profile-name" className={labelCls}>
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  autoComplete="name"
                  placeholder="Nama Lengkap Anda"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-invalid={!!errors.name}
                  className={`${inputCls} pl-10`}
                />
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.name && <p className={errorCls}>{errors.name}</p>}
            </div>

            {/* Alamat Email */}
            <div>
              <label htmlFor="profile-email" className={labelCls}>
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  placeholder="nama@email.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!errors.email}
                  className={`${inputCls} pl-10`}
                />
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.email ? (
                <p className={errorCls}>{errors.email}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Mengubah alamat email akan mencabut sesi aktif Anda pada perangkat lain demi keamanan.
                </p>
              )}
            </div>

            {/* Nomor Telepon & Jenis Kelamin */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-phone" className={labelCls}>
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <input
                    id="profile-phone"
                    type="tel"
                    value={form.phone ?? ""}
                    autoComplete="tel"
                    placeholder="contoh: 081234567890"
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    aria-invalid={!!errors.phone}
                    className={`${inputCls} pl-10`}
                  />
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.phone && <p className={errorCls}>{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="profile-gender" className={labelCls}>
                  Jenis Kelamin
                </label>
                <div className="relative">
                  <select
                    id="profile-gender"
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

            {/* Tombol Simpan */}
            <div className="flex justify-end pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={pending || uploadingAvatar}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
