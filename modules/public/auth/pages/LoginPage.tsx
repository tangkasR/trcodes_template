"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { login } from "../auth.actions";
import { swalError } from "@/common/utils/swal";

const inputCls =
  "w-full border-2 border-ink bg-white py-3 pl-11 pr-4 font-sans text-sm text-ink outline-none transition placeholder:text-ash focus:bg-[#fafafa] focus:ring-4 focus:ring-black/10 aria-invalid:border-red-600";

const LoginPage = () => {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.error) swalError("Login gagal", state.error);
    if (state?.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f5ef] text-ink">
      <div className="dots absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="hidden lg:block">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 font-display text-xl font-extrabold tracking-tight transition hover:opacity-85"
            >
              <span className="flex size-11 items-center justify-center border-2 border-ink bg-white p-1.5 shadow-[3px_3px_0px_#1b1a17] transition-transform group-hover:-translate-y-0.5">
                <Image
                  src="/imglogo.png"
                  alt="trcodes logo"
                  width={32}
                  height={32}
                  className="size-7.5 object-contain"
                  priority
                />
              </span>
              trcodes<span className="text-graphite">.</span>
            </Link>

            <p className="kick mt-16 text-xs uppercase tracking-[0.18em]">
              Admin workspace
            </p>
            <h1 className="mt-5 max-w-xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight">
              Kelola portofolio dengan rapi.
            </h1>
            <p className="mt-6 max-w-md font-serif text-lg leading-8 text-graphite">
              Satu tempat untuk mengatur profil, proyek, pengalaman, dan akses
              tim tanpa kehilangan kendali.
            </p>

            <div className="mt-10 grid max-w-md gap-3">
              {[
                "Konten publik langsung diperbarui",
                "Role dan permission granular",
                "Audit percobaan login transparan",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-2 border-ink bg-white px-4 py-3 shadow-[4px_4px_0_#000]"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center bg-ink font-display text-xs font-bold text-paper">
                    0{index + 1}
                  </span>
                  <span className="font-sans text-sm font-medium text-ink">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 inline-flex items-center gap-3 border border-ink/20 bg-white/70 px-4 py-3 backdrop-blur">
              <Sparkles className="size-4" />
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                Akses aman dengan sesi JWT
              </span>
            </div>
          </section>

          <section className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="box bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2 lg:hidden">
                    <span className="flex size-8 items-center justify-center border-2 border-ink bg-white p-1 shadow-[2px_2px_0px_#1b1a17]">
                      <Image
                        src="/imglogo.png"
                        alt="trcodes logo"
                        width={22}
                        height={22}
                        className="size-5 object-contain"
                        priority
                      />
                    </span>
                    <span className="font-display font-extrabold text-ink">
                      trcodes<span className="text-graphite">.</span>
                    </span>
                  </div>
                  <p className="kick text-xs uppercase tracking-[0.18em]">
                    Masuk
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight">
                    Selamat datang kembali
                  </h2>
                  <p className="mt-2 font-serif text-sm leading-6 text-graphite">
                    Masuk ke akun admin untuk melanjutkan.
                  </p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center border-2 border-ink bg-paper p-1.5 shadow-[2px_2px_0px_#1b1a17]">
                  <Image
                    src="/imglogo.png"
                    alt="trcodes logo"
                    width={28}
                    height={28}
                    className="size-7 object-contain"
                  />
                </span>
              </div>

              <form action={formAction} className="mt-7 space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-graphite" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      defaultValue={state?.values?.email}
                      aria-invalid={!!state?.fieldErrors?.email}
                      placeholder="nama@email.com"
                      className={inputCls}
                    />
                  </div>
                  {state?.fieldErrors?.email && (
                    <p className="mt-1.5 font-sans text-xs text-red-600">
                      {state.fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-graphite" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      aria-invalid={!!state?.fieldErrors?.password}
                      placeholder="Masukkan password"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-graphite transition hover:text-ink"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {state?.fieldErrors?.password && (
                    <p className="mt-1.5 font-sans text-xs text-red-600">
                      {state.fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Memproses..." : "Masuk ke dashboard"}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-2 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-serif text-xs text-graphite">
                  Butuh bantuan? Hubungi Super Admin.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-[0.12em] underline decoration-2 underline-offset-4 transition hover:text-graphite"
                >
                  <ArrowLeft className="size-3.5" />
                  Kembali ke situs
                </Link>
              </div>
            </div>

            <p className="mt-4 text-center font-serif text-xs text-graphite">
              © {new Date().getFullYear()} trcodes. Akses khusus administrator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
