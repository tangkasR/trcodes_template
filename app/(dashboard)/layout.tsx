import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getSession, getPermissionMap } from "@/common/lib/auth";
import { PermissionProvider } from "@/common/context/PermissionContext";
import { SidebarProvider } from "@/common/context/SidebarContext";
import DashboardSidebar from "@/common/components/DashboardSidebar";
import DashboardHeader from "@/common/components/DashboardHeader";
import DashboardPageSkeleton from "@/common/components/skeletons/DashboardPageSkeleton";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

// Dashboard reads live session and PostgreSQL data. Let it render per request
// on the server without blocking-prerender dynamic warnings.
export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { connection } from "next/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = await getPermissionMap(session.roleUuid);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans text-slate-900`}
    >
      <PermissionProvider
        user={{
          name: session.name,
          email: session.email,
          photo: session.photo,
          roleName: session.roleName,
          mfaRequired:
            session.roleName === "Super Admin" && !session.mfaEnabled,
        }}
        permissions={permissions}
      >
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-slate-100">
            <DashboardSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <DashboardHeader />
              <main className="relative flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_34rem)] p-4 md:p-8">
                <div className="mx-auto w-full max-w-7xl">
                  {session.roleName === "Super Admin" && !session.mfaEnabled && (
                    <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-4 shadow-sm sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <ShieldAlert className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Akun Super Admin Wajib Mengaktifkan Verifikasi Dua Langkah (MFA)
                          </p>
                          <p className="text-xs text-amber-700">
                            Untuk menjaga keamanan tertinggi sistem dan hak akses penuh, aktifkan MFA di menu Keamanan Akun.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/security"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
                      >
                        Aktifkan Sekarang &rarr;
                      </Link>
                    </div>
                  )}
                  <Suspense fallback={<DashboardPageSkeleton />}>
                    {children}
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </PermissionProvider>
    </div>
  );
}
