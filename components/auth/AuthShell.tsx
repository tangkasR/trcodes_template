"use client";

import Topbar from "@/components/auth/Topbar";
import { useApp } from "@/contexts/AppContext";
import Sidebar from "./Sidebar";

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  const { sidebarCollapsed } = useApp();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <Topbar />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AuthShell;
