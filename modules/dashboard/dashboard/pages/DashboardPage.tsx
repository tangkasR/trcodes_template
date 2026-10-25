import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  KeyRound,
  Package,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { NAV_GROUPS } from "@/common/constants/navigation.constant";
import { getPermissionMap, getSession } from "@/common/lib/auth";
import { formatDateTime } from "@/common/utils/format-date-time";
import { getDashboardStats } from "../dashboard.queries";

import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");

  const [permissions, stats] = await Promise.all([
    getPermissionMap(session.roleUuid),
    getDashboardStats(),
  ]);

  const items = NAV_GROUPS.flatMap((g) => g.items).filter(
    (i) =>
      i.href !== "/dashboard" &&
      i.feature &&
      permissions[i.feature]?.includes("read")
  );

  const canAddItem = permissions["item"]?.includes("add");
  const canAddUser = permissions["user"]?.includes("add");

  return (
    <div className="space-y-8">
      {/* 1. Hero Executive Command Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-32 size-72 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-cyan-200 backdrop-blur-xs">
                <Sparkles className="size-3.5" />
                Executive Workspace
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                <ShieldCheck className="size-3.5 text-cyan-300" />
                {session.roleName}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Selamat datang kembali, {session.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Kelola master data, atur otorisasi hak akses peran, serta pantau
              stabilitas dan keamanan platform dalam satu kendali terpadu.
            </p>
          </div>

          {/* Quick Actions Hub */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canAddItem && (
              <Link
                href="/dashboard/items"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500"
              >
                <Plus className="size-4" />
                Tambah Item
              </Link>
            )}
            {canAddUser && (
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
              >
                <Users className="size-4" />
                Kelola User
              </Link>
            )}
            <Link
              href="/dashboard/security"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              <KeyRound className="size-4 text-cyan-300" />
              Keamanan
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Real KPI Metrics Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Users */}
        <Link
          href="/dashboard/users"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="size-5" />
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Aktif
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {stats.users.total}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Akun Pengguna Terdaftar
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Otorisasi berbasis Role Permission
          </p>
        </Link>

        {/* Metric 2: Roles */}
        <Link
          href="/dashboard/roles"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition">
              <ShieldCheck className="size-5" />
            </span>
            <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-indigo-600" />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {stats.roles.total}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Peran & Hak Akses
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Matrix permission granular
          </p>
        </Link>

        {/* Metric 3: Items (Master Data) */}
        <Link
          href="/dashboard/items"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition">
              <Package className="size-5" />
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {stats.items.active} Aktif
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {stats.items.total}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Master Data Item
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Entitas CRUD referensi terkelola
          </p>
        </Link>

        {/* Metric 4: Audit Logs */}
        <Link
          href="/dashboard/audit-logs"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
              <ScrollText className="size-5" />
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Tercatat
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {stats.auditLogsCount}
          </p>
          <p className="text-xs font-medium text-slate-500">
            Jejak Audit Keamanan
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Append-only security event trail
          </p>
        </Link>
      </section>

      {/* 3. Two-Column Dashboard Content Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Quick Navigation Hub (2 Kolom span) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Modul Navigasi
              </h2>
              <p className="text-xs text-slate-500">
                Fitur yang dapat Anda kelola berdasarkan hak akses {session.roleName}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {items.length} Modul Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 text-blue-600 ring-1 ring-slate-100 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
                      {label}
                    </p>
                    <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-blue-600" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    Buka dan kelola {label.toLowerCase()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Recent Activities & Security Card (1 Kolom span) */}
        <div className="space-y-6">
          {/* Recent Audit Activities Feed */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Aktivitas Terakhir
                </h3>
              </div>
              <Link
                href="/dashboard/audit-logs"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Semua Log
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {stats.recentAudits.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  Belum ada aktivitas tercatat
                </p>
              ) : (
                stats.recentAudits.map((log) => (
                  <div key={log.uuid} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        {log.actorName ?? "Sistem"}
                      </span>
                      {log.detail ? ` — ${log.detail}` : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Security Status Card */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Proteksi Akun Anda
                </p>
                <p className="text-xs text-slate-500">
                  {session.mfaEnabled
                    ? "MFA TOTP Aktif & Terlindungi"
                    : "MFA Belum Diaktifkan"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Sesi token JWT 12 jam dengan sid valid</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Rate limiting aktif & audit log tercatat</span>
              </div>
            </div>

            <Link
              href="/dashboard/security"
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white py-2 text-xs font-semibold text-blue-700 shadow-2xs transition hover:bg-blue-50"
            >
              Buka Pengaturan Keamanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
