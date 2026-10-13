"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, CircleHelp, LogOut, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import LogoutService from "@/services/auth/LogoutService";
import { mainNavigation, managementNavigation } from "@/utils/sidebarMenus";

const Sidebar = () => {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    user,
    role,
  } = useApp();

  const handleNavigation = () => {
    setMobileSidebarOpen(false);
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await LogoutService.logout();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert(error instanceof Error ? error.message : "Logout gagal.");
    }
  };
  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-slate-200
          bg-white
          transition-all duration-300
          dark:border-slate-800
          dark:bg-slate-950
          w-72
          ${sidebarCollapsed ? "md:w-20" : "md:w-64"}

          
          ${mobileSidebarOpen && "w-full"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div
          className={`
            flex h-20 shrink-0 items-center
            border-b border-slate-200
            dark:border-slate-800
            ${
              sidebarCollapsed
                ? "md:justify-center md:px-3"
                : "justify-between px-4"
            }
          `}
        >
          <Link
            href="/"
            onClick={handleNavigation}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
              Logo
            </div>

            {!sidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Produk Anda
              </span>
            )}
          </Link>

          {/* Desktop Collapse */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className={`
              hidden
              h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-950
              dark:hover:bg-slate-900
              dark:hover:text-white
              md:flex
              ${sidebarCollapsed ? "md:hidden" : ""}
            `}
          >
            <ChevronLeft size={17} />
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Collapsed Toggle */}
        {sidebarCollapsed && (
          <div className="hidden justify-center border-b border-slate-200 py-3 dark:border-slate-800 md:flex">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Expand sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {/* Main */}
          <div>
            {!sidebarCollapsed && (
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Utama
              </p>
            )}

            <div className="space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavigation}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`
                      group flex items-center rounded-xl
                      text-sm font-medium
                      text-slate-600
                      transition-all
                      hover:bg-slate-100
                      hover:text-slate-950
                      dark:text-slate-400
                      dark:hover:bg-slate-900
                      dark:hover:text-white

                      ${
                        sidebarCollapsed
                          ? "md:justify-center md:px-3 md:py-3"
                          : "gap-3 px-3 py-2.5"
                      }

                      ${sidebarCollapsed ? "justify-start" : ""}
                    `}
                  >
                    <Icon size={19} strokeWidth={1.8} className="shrink-0" />

                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Management */}
          <div className="mt-8">
            {!sidebarCollapsed && (
              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Manajemen
              </p>
            )}

            <div className="space-y-1">
              {managementNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavigation}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`
                      group flex items-center rounded-xl
                      text-sm font-medium
                      text-slate-600
                      transition-all
                      hover:bg-slate-100
                      hover:text-slate-950
                      dark:text-slate-400
                      dark:hover:bg-slate-900
                      dark:hover:text-white

                      ${
                        sidebarCollapsed
                          ? "md:justify-center md:px-3 md:py-3"
                          : "gap-3 px-3 py-2.5"
                      }

                      ${sidebarCollapsed ? "justify-start" : ""}
                    `}
                  >
                    <Icon size={19} strokeWidth={1.8} className="shrink-0" />

                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Help */}
          <div className="mt-8">
            <Link
              href="/dashboard/help"
              onClick={handleNavigation}
              title={sidebarCollapsed ? "Bantuan" : undefined}
              className={`
                group flex items-center rounded-xl
                text-sm font-medium
                text-slate-600
                transition-all
                hover:bg-slate-100
                hover:text-slate-950
                dark:text-slate-400
                dark:hover:bg-slate-900
                dark:hover:text-white

                ${
                  sidebarCollapsed
                    ? "md:justify-center md:px-3 md:py-3"
                    : "gap-3 px-3 py-2.5"
                }

                ${sidebarCollapsed ? "justify-start" : ""}
              `}
            >
              <CircleHelp size={19} strokeWidth={1.8} className="shrink-0" />

              {!sidebarCollapsed && <span>Bantuan</span>}
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <div
            className={`
              flex items-center rounded-xl
              ${sidebarCollapsed ? "md:justify-center" : "gap-3 px-2 py-2"}
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              TR
            </div>

            {!sidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name ?? "Guest"}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {role?.name ?? "Guest"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Logout"
                  onClick={handleLogout}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-900"
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
