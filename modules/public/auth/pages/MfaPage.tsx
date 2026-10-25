"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect } from "react";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { verifyMfaLogin } from "../auth.actions";
import { swalError } from "@/common/utils/swal";

const inputCls =
  "w-full border-2 border-ink bg-white py-3 pl-11 pr-4 font-sans text-sm tracking-[0.2em] text-ink outline-none transition placeholder:tracking-normal placeholder:text-ash focus:bg-[#fafafa] focus:ring-4 focus:ring-black/10 aria-invalid:border-red-600";

export default function MfaPage({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    verifyMfaLogin,
    undefined
  );

  useEffect(() => {
    if (state?.error) swalError("Verifikasi gagal", state.error);
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
              Verifikasi dua langkah
            </p>
            <h1 className="mt-5 max-w-xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight">
              Satu kode lagi untuk masuk.
            </h1>
            <p className="mt-6 max-w-md font-serif text-lg leading-8 text-graphite">
              Password sudah benar. Masukkan kode dari aplikasi autentikator
              untuk melindungi akun dari akses yang tidak sah.
            </p>
          </section>

          <section className="w-full max-w-md justify-self-center lg:justify-self-end">
            <div className="box bg-white p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
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
                    MFA
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight">
                    Verifikasi kode
                  </h2>
                  <p className="mt-2 truncate font-serif text-sm leading-6 text-graphite">
                    {email}
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
                    htmlFor="code"
                    className="mb-1.5 block font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-ink"
                  >
                    Kode autentikator / pemulihan
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-graphite" />
                    <input
                      id="code"
                      name="code"
                      type="text"
                      inputMode="text"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={40}
                      defaultValue={state?.values?.code}
                      aria-invalid={!!state?.fieldErrors?.code}
                      placeholder="123456"
                      className={inputCls}
                    />
                  </div>
                  {state?.fieldErrors?.code && (
                    <p className="mt-1.5 font-sans text-xs text-red-600">
                      {state.fieldErrors.code}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Memverifikasi..." : "Verifikasi dan masuk"}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-2 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-serif text-xs text-graphite">
                  Kehilangan akses autentikator? Gunakan kode pemulihan.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-sans text-xs font-bold uppercase tracking-[0.12em] underline decoration-2 underline-offset-4 transition hover:text-graphite"
                >
                  <ArrowLeft className="size-3.5" />
                  Login ulang
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
