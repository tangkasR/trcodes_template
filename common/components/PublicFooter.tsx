import Link from "next/link";
import Image from "next/image";
import { Terminal, Shield, Lock, Layers } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t-2 border-ink bg-ink px-5 py-14 text-paper sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl border-2 border-white/20 bg-paper p-1.5 shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
                <Image
                  src="/imglogo.png"
                  alt="trcodes logo"
                  width={28}
                  height={28}
                  className="size-6 object-contain"
                />
              </span>
              <p className="font-display text-xl font-extrabold tracking-tight">
                trcodes Enterprise Starter
              </p>
            </div>
            <p className="mt-4 max-w-md text-sm text-ash leading-relaxed">
              Master boilerplate & standar arsitektur enterprise Next.js 16 App
              Router, Prisma 7, PostgreSQL, dynamic RBAC permission matrix,
              AES-256-GCM TOTP MFA, dan automated CLI scaffolding.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono text-ash">
              <span className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-1">
                <Shield className="size-3 text-emerald-400" /> RBAC Matrix
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-1">
                <Lock className="size-3 text-amber-400" /> TOTP MFA
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-1">
                <Terminal className="size-3 text-cyan-400" /> CLI Scaffolding
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-1">
                <Layers className="size-3 text-purple-400" /> UUIDv7
              </span>
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
              Navigasi Halaman
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ash">
              <li>
                <Link href="/#features" className="hover:text-white hover:underline">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link
                  href="/#architecture"
                  className="hover:text-white hover:underline"
                >
                  Arsitektur Sistem
                </Link>
              </li>
              <li>
                <Link
                  href="/#quickstart"
                  className="hover:text-white hover:underline"
                >
                  Panduan Mulai Cepat
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white hover:underline">
                  Halaman Masuk (Login)
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white hover:underline"
                >
                  Dashboard Administrator
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
              Verifikasi & Kualitas Sistem
            </h2>
            <p className="mt-4 text-xs text-ash leading-relaxed">
              Seluruh kode telah diverifikasi dengan standar industri:
            </p>
            <ul className="mt-3 space-y-1.5 font-mono text-xs text-ash">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 0 ESLint warning & error
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> 0 TypeScript error (tsc --noEmit)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Automated Playwright Smoke Test
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Strict Nonce-based CSP
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-ash sm:flex-row">
          <p>© 2026 trcodes Enterprise Boilerplate. Siap untuk produksi.</p>
          <p className="font-mono text-ash/80">Next.js 16.4.1 • React 19 • Prisma 7</p>
        </div>
      </div>
    </footer>
  );
}
