"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
} from "lucide-react";
import { NAV_GROUPS } from "@/common/constants/navigation.constant";
import { usePermission } from "@/common/context/PermissionContext";
import { useSidebar } from "@/common/context/SidebarContext";
import { logout } from "@/modules/public/auth/auth.actions";
import { swalConfirm } from "@/common/utils/swal";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export default function DashboardHeader() {
  const pathname = usePathname();
  const { user } = usePermission();
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();

  // Temukan item aktif dan grup aktif
  let activeGroupLabel = "";
  let activeItemLabel = "";

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
      ) {
        activeGroupLabel = group.label;
        activeItemLabel = item.label;
        break;
      }
    }
    if (activeItemLabel) break;
  }

  // Jika detail halaman khusus (misal projects/[uuid] atau roles/[uuid])
  const isProjectDetail =
    pathname.startsWith("/dashboard/projects/") &&
    pathname !== "/dashboard/projects";
  const isRoleDetail =
    pathname.startsWith("/dashboard/roles/") && pathname !== "/dashboard/roles";

  async function handleLogout() {
    const ok = await swalConfirm({
      title: "Keluar dari akun?",
      text: "Kamu perlu login lagi untuk mengakses dashboard.",
      confirmText: "Ya, keluar",
      icon: "question",
    });
    if (ok) await logout();
  }

  const iconBtn =
    "size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl md:px-6">
      {/* Kiri: Mobile trigger, toggle sidebar & Dynamic Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={openMobile}
          className={`${iconBtn} inline-flex md:hidden`}
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 md:hidden"
          aria-label="Beranda Dashboard"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 p-1 ring-1 ring-slate-800">
            <Image
              src="/imglogo.png"
              alt="trcodes logo"
              width={20}
              height={20}
              className="size-5 object-contain invert"
              priority
            />
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`${iconBtn} hidden md:inline-flex`}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>

        <span className="hidden h-4 w-px bg-slate-200 md:inline-block" />

        {/* Dynamic Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-slate-400 transition hover:text-blue-600"
            title="Beranda Dashboard"
          >
            <Home className="size-3.5" />
            <span className="hidden lg:inline">Dashboard</span>
          </Link>

          {pathname !== "/dashboard" && activeGroupLabel && (
            <>
              <ChevronRight className="size-3 shrink-0 text-slate-300" />
              <span className="hidden sm:inline text-slate-400">
                {activeGroupLabel}
              </span>
            </>
          )}

          {pathname !== "/dashboard" && activeItemLabel && (
            <>
              <ChevronRight className="size-3 shrink-0 text-slate-300" />
              <span className="truncate font-semibold text-slate-900">
                {activeItemLabel}
              </span>
            </>
          )}

          {isProjectDetail && (
            <>
              <ChevronRight className="size-3 shrink-0 text-slate-300" />
              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                Bab Proyek
              </span>
            </>
          )}

          {isRoleDetail && (
            <>
              <ChevronRight className="size-3 shrink-0 text-slate-300" />
              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                Izin Akses
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Kanan: Greeting, MFA indicator, Profile Link, & Logout */}
      <div className="flex items-center gap-3">
        {user.mfaRequired && (
          <Link
            href="/dashboard/security"
            className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 sm:inline-flex"
            title="Klik untuk mengaktifkan MFA"
          >
            <Shield className="size-3 text-amber-600" />
            <span>MFA Wajib Aktif</span>
          </Link>
        )}

        <div className="hidden text-right sm:block">
          <p className="text-xs text-slate-400">{getGreeting()},</p>
          <p className="text-sm font-semibold leading-tight text-slate-900">
            {user.name}
          </p>
        </div>

        {/* Quick Profile Link Avatar */}
        <Link
          href="/dashboard/profile"
          title={`Profil ${user.name} (${user.roleName})`}
          className="group relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-xs transition hover:scale-105 hover:shadow-blue-500/25 ring-2 ring-white"
        >
          {user.photo ? (
            <Image
              src={user.photo}
              alt={user.name}
              width={36}
              height={36}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white ${
              user.mfaRequired ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className={`${iconBtn} inline-flex hover:bg-red-50 hover:text-red-600`}
          aria-label="Keluar dari akun"
          title="Keluar"
        >
          <LogOut className="size-4.5" />
        </button>
      </div>
    </header>
  );
}
