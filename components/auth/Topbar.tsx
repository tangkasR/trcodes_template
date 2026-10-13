"use client";

import { Bell, Menu } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const Topbar = () => {
  const { setMobileSidebarOpen } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 md:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <Menu size={21} />
        </button>

        <div>
          <input
            className="w-full md:min-w-60 px-4 py-2 text-sm rounded-lg border border-slate-300"
            placeholder="Cari..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <Bell size={19} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
          TR
        </div>
      </div>
    </header>
  );
};

export default Topbar;
