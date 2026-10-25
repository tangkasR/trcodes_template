import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <ShieldAlert size={30} aria-hidden="true" />
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-500">
          Akses terbatas
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Akses ditolak
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi
          Super Admin jika Anda membutuhkan akses.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="size-4" />
            Kembali ke dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ExternalLink className="size-4" />
            Buka situs publik
          </Link>
        </div>
      </div>
    </div>
  );
}
