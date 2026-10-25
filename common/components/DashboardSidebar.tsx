// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { NAV_GROUPS } from "@/common/constants/navigation.constant";
import { usePermission } from "@/common/context/PermissionContext";
import { useSidebar } from "@/common/context/SidebarContext";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const { can } = usePermission();
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  // tutup drawer mobile setelah pindah halaman
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      closeMobile();
    }
  }, [pathname, closeMobile]);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.feature || can(i.feature, "read")),
  })).filter((g) => g.items.length > 0);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);
  const hideOnCollapsed = collapsed ? "md:hidden" : "";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-400 transition-all duration-200 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* Brand Header */}
        <Link
          href="/dashboard"
          className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4 transition hover:bg-white/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-md shadow-white/10 ring-1 ring-white/20">
            <Image
              src="/imglogo.png"
              alt="trcodes logo"
              width={26}
              height={26}
              className="size-6 object-contain"
              priority
            />
          </span>
          <div className={`min-w-0 ${hideOnCollapsed}`}>
            <p className="truncate text-sm font-bold tracking-tight text-white">
              trcodes
            </p>
            <p className="truncate text-[11px] font-medium text-slate-500">
              Admin Workspace
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav
          className="flex-1 space-y-6 overflow-y-auto p-3"
          aria-label="Menu utama"
        >
          {groups.map((group) => (
            <div key={group.label}>
              <p
                className={`mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ${hideOnCollapsed}`}
              >
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        title={collapsed ? label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-white/10 text-white shadow-xs ring-1 ring-white/15"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {active && (
                          <span
                            className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-sm shadow-cyan-400/80"
                            aria-hidden="true"
                          />
                        )}
                        <Icon
                          className={`size-5 shrink-0 transition ${
                            active
                              ? "text-cyan-300"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        />
                        <span className={`truncate ${hideOnCollapsed}`}>
                          {label}
                        </span>
                        {active && (
                          <span
                            className={`ml-auto size-1.5 rounded-full bg-cyan-300 shadow-xs shadow-cyan-300 ${hideOnCollapsed}`}
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {groups.length === 0 && (
            <p className={`px-3 text-sm text-slate-500 ${hideOnCollapsed}`}>
              Belum ada menu yang tersedia.
            </p>
          )}
        </nav>

        {/* Footer: View Public Website */}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? "Lihat situs publik" : undefined}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="size-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
            <span className={`truncate ${hideOnCollapsed}`}>
              Lihat situs publik
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
