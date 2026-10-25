import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  Users,
  KeyRound,
  History,
  Package,
} from "lucide-react";
import type { SystemStats } from "../home.schema";

export default function HomeHero({ stats }: { stats: SystemStats }) {
  return (
    <section className="relative overflow-hidden border-b-2 border-ink px-5 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28 lg:px-8">
      {/* Background Dot Pattern */}
      <div className="dots pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3.5 py-1 text-xs font-black tracking-wide text-ink uppercase shadow-[2px_2px_0px_#1b1a17]">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Next.js 16.4.1 • Prisma 7 • Turbopack • Production-Ready</span>
        </div>

        {/* Master Heading */}
        <h1 className="mt-8 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
          Enterprise Next.js Platform & Boilerplate Standar
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl font-serif text-lg text-graphite sm:text-xl md:text-2xl leading-relaxed">
          Fondasi sistem web modern dengan{" "}
          <strong className="font-bold text-ink underline decoration-2 underline-offset-4">
            Dynamic RBAC Permission Matrix
          </strong>
          , Enterprise TOTP MFA (AES-256-GCM), Strict Nonce CSP, PostgreSQL
          UUIDv7, dan Scaffolding CLI otomatis.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2.5 border-2 border-ink bg-ink px-6 py-3.5 font-display text-base font-black tracking-wide text-paper uppercase shadow-[4px_4px_0px_#8a8a8a] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#8a8a8a]"
          >
            <ShieldCheck className="size-5 text-emerald-400" />
            <span>Buka Dashboard</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#quickstart"
            className="inline-flex items-center gap-2 border-2 border-ink bg-white px-6 py-3.5 font-display text-base font-black tracking-wide text-ink uppercase shadow-[4px_4px_0px_#1b1a17] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#1b1a17]"
          >
            <Terminal className="size-5 text-blue-600" />
            <span>Panduan Scaffolding CLI</span>
          </a>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          <div className="rounded-2xl border-2 border-ink bg-white p-4 text-left shadow-[3px_3px_0px_#1b1a17]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Pengguna
              </span>
              <Users className="size-4 text-indigo-600" />
            </div>
            <p className="mt-2 font-display text-3xl font-black text-ink">
              {stats.totalUsers}
            </p>
            <p className="mt-1 text-xs text-slate-500">Akun terdaftar di DB</p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-white p-4 text-left shadow-[3px_3px_0px_#1b1a17]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Peran & Izin
              </span>
              <KeyRound className="size-4 text-amber-600" />
            </div>
            <p className="mt-2 font-display text-3xl font-black text-ink">
              {stats.totalRoles}
            </p>
            <p className="mt-1 text-xs text-slate-500">Matriks hak akses dinamis</p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-white p-4 text-left shadow-[3px_3px_0px_#1b1a17]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Master Data
              </span>
              <Package className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-display text-3xl font-black text-ink">
              {stats.totalItems}
            </p>
            <p className="mt-1 text-xs text-slate-500">Item referensi CRUD</p>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-white p-4 text-left shadow-[3px_3px_0px_#1b1a17]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Jejak Audit
              </span>
              <History className="size-4 text-blue-600" />
            </div>
            <p className="mt-2 font-display text-3xl font-black text-ink">
              {stats.totalAuditLogs}
            </p>
            <p className="mt-1 text-xs text-slate-500">Log keamanan tercatat</p>
          </div>
        </div>
      </div>
    </section>
  );
}
