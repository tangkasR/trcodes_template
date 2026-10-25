"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { swalError, swalSuccess } from "@/common/utils/swal";
import {
  confirmMfaSetupAction,
  disableMfaAction,
  regenerateRecoveryCodesAction,
  startMfaSetupAction,
} from "../security.actions";

import { inputCls } from "@/common/utils/form-styles";

type SetupData = {
  secret: string;
  formattedSecret: string;
  uri: string;
};

const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500";

function fieldError(message: string | null | undefined) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

export default function SecurityPanel({
  email,
  enabled: initialEnabled,
  recoveryCodesRemaining: initialRemaining,
  isSuperAdmin = false,
}: {
  email: string;
  enabled: boolean;
  recoveryCodesRemaining: number;
  isSuperAdmin?: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetMessages() {
    setPasswordError(null);
    setCodeError(null);
  }

  async function handleStart(formData: FormData) {
    resetMessages();
    const res = await startMfaSetupAction({
      password: String(formData.get("password") ?? ""),
    });
    if (!res.ok) {
      setPasswordError(res.fieldErrors?.password ?? res.message);
      swalError("Gagal memulai aktivasi", res.message);
      return;
    }
    setSetup(res.data);
    swalSuccess("Langkah 1 selesai", "Masukkan kode dari aplikasi autentikator.");
  }

  async function handleConfirm(formData: FormData) {
    resetMessages();
    const res = await confirmMfaSetupAction({
      code: String(formData.get("code") ?? ""),
    });
    if (!res.ok) {
      setCodeError(res.fieldErrors?.code ?? res.message);
      swalError("Verifikasi gagal", res.message);
      return;
    }
    setEnabled(true);
    setSetup(null);
    setRemaining(res.data.recoveryCodes.length);
    setRecoveryCodes(res.data.recoveryCodes);
    swalSuccess("MFA aktif", "Simpan kode pemulihan di tempat yang aman.");
  }

  async function handleDisable(formData: FormData) {
    resetMessages();
    const res = await disableMfaAction({
      password: String(formData.get("password") ?? ""),
      code: String(formData.get("code") ?? ""),
    });
    if (!res.ok) {
      setPasswordError(res.fieldErrors?.password ?? null);
      setCodeError(res.fieldErrors?.code ?? res.message);
      swalError("Gagal menonaktifkan MFA", res.message);
      return;
    }
    setEnabled(false);
    setRemaining(0);
    setRecoveryCodes(null);
    swalSuccess("MFA dinonaktifkan");
  }

  async function handleRegenerate(formData: FormData) {
    resetMessages();
    const res = await regenerateRecoveryCodesAction({
      password: String(formData.get("password") ?? ""),
      code: String(formData.get("code") ?? ""),
    });
    if (!res.ok) {
      setPasswordError(res.fieldErrors?.password ?? null);
      setCodeError(res.fieldErrors?.code ?? res.message);
      swalError("Gagal membuat kode baru", res.message);
      return;
    }
    setRemaining(res.data.recoveryCodes.length);
    setRecoveryCodes(res.data.recoveryCodes);
    swalSuccess("Kode pemulihan baru dibuat");
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      swalSuccess(`${label} disalin`);
    } catch {
      swalError("Gagal menyalin", "Salin kode secara manual.");
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                enabled
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {enabled ? (
                <ShieldCheck className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Verifikasi dua langkah (TOTP)
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Setelah password benar, akun meminta kode 6 digit dari aplikasi
                autentikator seperti Google Authenticator, Authy, atau 1Password.
              </p>
              <p className="mt-1 text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              enabled
                ? "bg-emerald-50 text-emerald-700"
                : isSuperAdmin
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {enabled ? "Aktif" : isSuperAdmin ? "Wajib aktif" : "Belum aktif"}
          </span>
        </div>

        {enabled && (
          <p className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Kode pemulihan tersisa:{" "}
            <strong className="text-slate-900">{remaining}</strong>. Buat ulang
            jika jumlahnya habis.
          </p>
        )}
      </section>

      {recoveryCodes && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-emerald-900">
                Simpan kode pemulihan ini sekarang
              </h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Setiap kode hanya bisa dipakai sekali. Kode tidak akan
                ditampilkan lagi setelah halaman ditutup.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {recoveryCodes.map((code) => (
                  <code
                    key={code}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-slate-800"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyText(recoveryCodes.join("\n"), "Kode pemulihan")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  <Copy className="size-4" />
                  Salin semua
                </button>
                <button
                  type="button"
                  onClick={() => setRecoveryCodes(null)}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Saya sudah menyimpan
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {!enabled && !setup && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Aktifkan MFA
          </h2>
          {isSuperAdmin && (
            <div className="mt-2 mb-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800">
              <strong>Pemberitahuan Wajib:</strong> Role Anda adalah{" "}
              <strong>Super Admin</strong>. Anda diwajibkan mengaktifkan MFA
              untuk menjaga keamanan akun dan hak akses tertinggi aplikasi.
            </div>
          )}
          <p className="mt-1 text-sm text-slate-500">
            Masukkan password akun untuk memulai. Kamu akan diminta memindai
            atau menyalin secret ke aplikasi autentikator.
          </p>
          <form
            className="mt-4 flex max-w-md flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              startTransition(() => handleStart(formData));
            }}
          >
            <div>
              <label htmlFor="mfa-password" className={labelCls}>
                Password saat ini
              </label>
              <input
                id="mfa-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
                className={inputCls}
              />
              {fieldError(passwordError)}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Mulai aktivasi"}
            </button>
          </form>
        </section>
      )}

      {setup && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Langkah 2: verifikasi autentikator
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tambahkan secret berikut ke aplikasi autentikator, lalu masukkan
            kode 6 digit yang muncul.
          </p>

          <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Secret
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all font-mono text-sm text-slate-900">
                {setup.formattedSecret}
              </code>
              <button
                type="button"
                onClick={() => copyText(setup.secret, "Secret MFA")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Copy className="size-3.5" />
                Salin
              </button>
            </div>
            <details className="mt-3 text-xs text-slate-500">
              <summary className="cursor-pointer font-medium">
                Tampilkan URI otpauth
              </summary>
              <code className="mt-2 block break-all font-mono text-[11px]">
                {setup.uri}
              </code>
            </details>
          </div>

          <form
            className="mt-4 flex max-w-md flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              startTransition(() => handleConfirm(formData));
            }}
          >
            <div>
              <label htmlFor="mfa-setup-code" className={labelCls}>
                Kode 6 digit
              </label>
              <input
                id="mfa-setup-code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="000000"
                required
                disabled={pending}
                className={`${inputCls} font-mono tracking-[0.25em] text-center font-bold text-base`}
              />
              {fieldError(codeError)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Memverifikasi..." : "Aktifkan MFA"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setSetup(null);
                  resetMessages();
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white"
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      )}

      {enabled && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Buat ulang kode pemulihan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Kode lama akan langsung tidak berlaku. Konfirmasi dengan password
              dan kode MFA.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                startTransition(() => handleRegenerate(formData));
              }}
            >
              <div>
                <label htmlFor="regen-password" className={labelCls}>
                  Password saat ini
                </label>
                <input
                  id="regen-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={pending}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="regen-code" className={labelCls}>
                  Kode MFA / pemulihan
                </label>
                <input
                  id="regen-code"
                  name="code"
                  type="text"
                  autoComplete="one-time-code"
                  maxLength={40}
                  placeholder="Kode 6 digit atau kode pemulihan"
                  required
                  disabled={pending}
                  className={`${inputCls} font-mono`}
                />
              </div>
              {fieldError(passwordError ?? codeError)}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Memproses..." : "Buat kode baru"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-red-900">
              Nonaktifkan MFA
            </h2>
            {isSuperAdmin ? (
              <p className="mt-2 text-sm text-red-800">
                MFA wajib aktif untuk akun dengan role{" "}
                <strong>Super Admin</strong> demi keamanan seluruh sistem dan
                tidak dapat dinonaktifkan.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-red-800/80">
                  Akun akan kembali hanya dilindungi password. Konfirmasi dengan
                  password dan kode MFA.
                </p>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    startTransition(() => handleDisable(formData));
                  }}
                >
                  <div>
                    <label htmlFor="disable-password" className={labelCls}>
                      Password saat ini
                    </label>
                    <input
                      id="disable-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={pending}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="disable-code" className={labelCls}>
                      Kode MFA / pemulihan
                    </label>
                    <input
                      id="disable-code"
                      name="code"
                      type="text"
                      autoComplete="one-time-code"
                      maxLength={40}
                      placeholder="Kode 6 digit atau kode pemulihan"
                      required
                      disabled={pending}
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                  {fieldError(passwordError ?? codeError)}
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Memproses..." : "Nonaktifkan MFA"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 size-5 shrink-0 text-slate-400" />
          <p className="text-sm leading-6 text-slate-500">
            MFA melindungi akun jika password bocor. Jika kehilangan perangkat,
            gunakan salah satu kode pemulihan untuk masuk, lalu buat kode baru.
          </p>
        </div>
      </section>
    </div>
  );
}
