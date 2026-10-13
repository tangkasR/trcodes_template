"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RegistrationService from "@/services/auth/RegistrationService";
import PrimaryButton from "@/components/button/PrimaryButton";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Password tidak boleh melebihi 72 byte.");
      return;
    }

    setLoading(true);

    try {
      const response = await RegistrationService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccess(response.message || "Registrasi berhasil.");

      // Beri kesempatan pengguna membaca pesan sukses.
      router.push("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat registrasi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 flex min-h-screen items-center justify-center bg-white px-4 py-12 dark:bg-black">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-white/10 dark:bg-neutral-950">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-black bg-black dark:border-white dark:bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white dark:text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Buat Akun Anda
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Buat akun baru untuk mulai menggunakan aplikasi.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-black dark:text-white"
              >
                Nama lengkap
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
                maxLength={150}
                required
                disabled={loading}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white/10 dark:disabled:bg-neutral-900/50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-black dark:text-white"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                maxLength={191}
                required
                disabled={loading}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white/10 dark:disabled:bg-neutral-900/50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-black dark:text-white"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white/10 dark:disabled:bg-neutral-900/50"
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-black dark:text-white"
              >
                Konfirmasi password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={loading}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder-neutral-400 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white dark:focus:ring-white/10 dark:disabled:bg-neutral-900/50"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-black bg-neutral-100 p-3 text-sm text-black dark:border-white dark:bg-neutral-900 dark:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-lg border border-black bg-black p-3 text-sm text-white dark:border-white dark:bg-white dark:text-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Submit */}
            <PrimaryButton
              className="w-full cursor-pointer"
              type="submit"
              loading={loading}
            >
              {loading ? "Mendaftarkan akun..." : "Daftar"}
            </PrimaryButton>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-xs uppercase tracking-wider text-neutral-400">
              atau
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline-offset-4 hover:underline dark:text-white"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
