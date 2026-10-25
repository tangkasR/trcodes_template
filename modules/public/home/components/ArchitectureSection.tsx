import { FolderTree, Shield, Palette, Database } from "lucide-react";

const pillars = [
  {
    icon: FolderTree,
    title: "Routing Layer Murni (app/)",
    tag: "Route-Only & Streaming",
    desc: "Direktori app/ dikhususkan hanya untuk layout, route page, Suspense boundary, metadata, dan loading skeletons. Query DB dan logika bisnis tidak diletakkan di layer ini.",
    bullets: [
      "Thin server wrappers di app/**/page.tsx",
      "Suspense streaming dengan DashboardPageSkeleton",
      "Pencegahan dynamic prerendering errors",
    ],
  },
  {
    icon: Database,
    title: "Audience-Based Modular Design (modules/)",
    tag: "8-File Feature Shape",
    desc: "Setiap fitur dashboard diisolasi dalam 8 file standar yang seragam: schema Zod, service Prisma, queries baca, server actions, hooks React Query, modal, tabel, dan halaman server.",
    bullets: [
      "Server-only guards pada service & queries",
      "Action gating: requirePermission & parseInput",
      "Optimistic updates & cache invalidation",
    ],
  },
  {
    icon: Palette,
    title: "Desain Sistem & Komponen Terpadu",
    tag: "UI/UX Enterprise",
    desc: "Menghilangkan inkonsistensi input dengan token terpusat di form-styles.ts, Modal enterprise dengan ambient double-border ring, dan Paginasi rows-per-page kustom.",
    bullets: [
      "form-styles.ts untuk input, select, & checkbox",
      "Modal.tsx dengan glassmorphism & ESC lock",
      "Pagination.tsx dengan dropdown limit dinamis",
    ],
  },
  {
    icon: Shield,
    title: "Keamanan Lapisan Dalam (Defense in Depth)",
    tag: "Security Hardened",
    desc: "Arsitektur keamanan komprehensif mulai dari edge proxy nonce CSP, JWT session tracking dengan versioning, TOTP MFA terenkripsi, hingga append-only audit trail.",
    bullets: [
      "Strict nonce CSP tanpa 'unsafe-inline'",
      "Distributed rate limiter tabel PostgreSQL",
      "Per-device session revocation & lockout",
    ],
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="border-b-2 border-ink px-5 py-20 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-display text-xs font-black tracking-widest text-slate-500 uppercase">
            Konsep & Filosofi
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Arsitektur Modular Berstandar Enterprise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-graphite">
            Struktur kode terorganisir rapi memisahkan peruntukan kode, memudahkan
            asisten AI maupun tim pengembang untuk memperluas sistem tanpa risiko regresi.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-slate-100 shadow-[2px_2px_0px_#1b1a17]">
                      <Icon className="size-5 text-ink" />
                    </span>
                    <h3 className="font-display text-lg font-black text-ink">
                      {item.title}
                    </h3>
                  </div>
                  <span className="rounded-md border border-ink/20 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {item.tag}
                  </span>
                </div>

                <p className="mt-4 text-sm text-graphite leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <ul className="space-y-1.5 text-xs font-medium text-slate-700">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
