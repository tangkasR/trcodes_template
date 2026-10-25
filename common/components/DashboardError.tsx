/* eslint-disable @next/next/no-location-assign-relative-destination */
"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  fullScreen?: boolean;
};

export default function ErrorView({ error, reset, fullScreen }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`flex items-center justify-center p-6 ${
        fullScreen ? "min-h-screen bg-slate-100" : "mt-16"
      }`}
    >
      <div
        role="alert"
        className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/60"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
          Terjadi kesalahan
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman ini gagal dimuat. Coba lagi, atau kembali ke dashboard.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
            Kode referensi: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700"
          >
            Coba lagi
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Ke dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
