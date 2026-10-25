import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function QuickStartSection() {
  return (
    <section id="quickstart" className="px-5 py-20 sm:px-6 lg:px-8 bg-paper">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-display text-xs font-black tracking-widest text-slate-500 uppercase">
            Panduan Developer & AI
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Alur Cepat Menambah Fitur Baru
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-graphite">
            Ikuti 4 langkah mudah ini saat membuat modul dashboard baru agar
            otomatis memenuhi standar arsitektur dan lulus uji kualitas.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Langkah 1 */}
          <div className="rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17]">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink bg-amber-400 font-display text-sm font-black text-ink shadow-[2px_2px_0px_#1b1a17]">
                1
              </span>
              <h3 className="font-display text-lg font-black text-ink">
                Scaffold 8 File Modul via CLI
              </h3>
            </div>
            <p className="mt-3 text-sm text-graphite">
              Jalankan CLI Scaffolding tool bawaan template untuk meng-generate 8
              file modul secara instan:
            </p>
            <div className="mt-4 rounded-xl border-2 border-ink bg-ink p-3 font-mono text-xs text-paper shadow-[2px_2px_0px_#8a8a8a]">
              <span className="text-emerald-400">$</span> npm run make:feature product &quot;Katalog Produk&quot; products
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17]">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink bg-blue-400 font-display text-sm font-black text-ink shadow-[2px_2px_0px_#1b1a17]">
                2
              </span>
              <h3 className="font-display text-lg font-black text-ink">
                Definisikan Model Prisma UUIDv7
              </h3>
            </div>
            <p className="mt-3 text-sm text-graphite">
              Tambahkan model di <code className="font-mono text-xs font-bold text-ink">prisma/schema.prisma</code> dengan primary key time-sortable:
            </p>
            <div className="mt-4 rounded-xl border-2 border-ink bg-ink p-3 font-mono text-xs text-paper shadow-[2px_2px_0px_#8a8a8a]">
              uuid String @id @default(dbgenerated(&quot;uuid(7)&quot;)) @db.Uuid
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17]">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink bg-emerald-400 font-display text-sm font-black text-ink shadow-[2px_2px_0px_#1b1a17]">
                3
              </span>
              <h3 className="font-display text-lg font-black text-ink">
                Registrasi di config.ts & Sinkronisasi DB
              </h3>
            </div>
            <p className="mt-3 text-sm text-graphite">
              Daftarkan fitur di <code className="font-mono text-xs font-bold text-ink">config.ts</code> (FEATURES & NAV_GROUPS), lalu jalankan sinkronisasi hak akses:
            </p>
            <div className="mt-4 rounded-xl border-2 border-ink bg-ink p-3 font-mono text-xs text-paper shadow-[2px_2px_0px_#8a8a8a]">
              <span className="text-emerald-400">$</span> npm run db:sync
            </div>
          </div>

          {/* Langkah 4 */}
          <div className="rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17]">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border-2 border-ink bg-purple-400 font-display text-sm font-black text-ink shadow-[2px_2px_0px_#1b1a17]">
                4
              </span>
              <h3 className="font-display text-lg font-black text-ink">
                Uji Otomatis & Quality Gates
              </h3>
            </div>
            <p className="mt-3 text-sm text-graphite">
              Pastikan seluruh pengujian Playwright E2E dan type-checking lulus 100%:
            </p>
            <div className="mt-4 rounded-xl border-2 border-ink bg-ink p-3 font-mono text-xs text-paper shadow-[2px_2px_0px_#8a8a8a]">
              <span className="text-emerald-400">$</span> npm run smoke
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 rounded-3xl border-2 border-ink bg-ink p-8 text-paper shadow-[6px_6px_0px_#8a8a8a] md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-300">
                <Sparkles className="size-3.5" />
                <span>Siap Digunakan Untuk Project Nyata</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-black text-white sm:text-3xl">
                Mulai Kustomisasi Aplikasi Sekarang
              </h3>
              <p className="mt-2 max-w-xl text-sm text-ash leading-relaxed">
                Login ke dashboard menggunakan akun Super Admin awal untuk
                mengelola user, hak akses, master data item, dan memeriksa audit log keamanan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border-2 border-white bg-white px-6 py-3 font-display text-sm font-black text-ink uppercase shadow-[4px_4px_0px_rgba(255,255,255,0.3)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]"
              >
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Masuk Dashboard</span>
                <ArrowRight className="size-4 text-ink" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
