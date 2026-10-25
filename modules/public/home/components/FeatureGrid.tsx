import {
  ShieldAlert,
  Key,
  TerminalSquare,
  LockKeyhole,
  Boxes,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Key,
    badge: "Otorisasi Berlapis",
    title: "Dynamic RBAC & Matrix Permissions",
    description:
      "Tata kelola hak akses berbasis fitur dengan izin modular (read, add, edit, delete). Dilengkapi skrip auto-sync untuk sinkronisasi otomatis fitur baru ke Super Admin.",
    highlights: [
      "Izin per modul fitur granular",
      "Pencegahan privilege escalation",
      "Auto-sync via npm run db:sync",
    ],
  },
  {
    icon: LockKeyhole,
    badge: "Keamanan Enterprise",
    title: "Enterprise MFA / TOTP & Multi-Device",
    description:
      "Dukungan Two-Factor Authentication berstandar AES-256-GCM, kode pemulihan sekali pakai ter-hash SHA-256, dan pelacakan sesi per perangkat dengan instant revocation.",
    highlights: [
      "Enkripsi AES-256-GCM pada secret",
      "Pencabutan sesi instan per device",
      "Proteksi Super Admin MFA blocking",
    ],
  },
  {
    icon: TerminalSquare,
    badge: "Produktivitas Developer",
    title: "Automated CLI Scaffolding Tool",
    description:
      "Percepat pembuatan fitur baru untuk developer dan asisten AI. Men-generate 8 file standar modul dashboard enterprise secara instan hanya dalam satu perintah.",
    highlights: [
      "npm run make:feature <key> <Label>",
      "8 file standar auto-generated",
      "Terkoneksi langsung ke Zod & Prisma",
    ],
  },
  {
    icon: ShieldAlert,
    badge: "Anti-XSS & Injeksi",
    title: "Strict Nonce-Based CSP & Rate Limiting",
    description:
      "Content Security Policy yang ketat dengan per-request cryptographic nonce untuk script-src dan style-src, didukung distributed rate limiting berbasis atomic PostgreSQL upsert.",
    highlights: [
      "Zero 'unsafe-inline' di produksi",
      "Next.js 16 edge proxy middleware",
      "PostgreSQL rate limit auto-pruning",
    ],
  },
  {
    icon: Boxes,
    badge: "Contoh Hidup",
    title: "Clean Reference CRUD (Item)",
    description:
      "Modul referensi master data yang siap diadaptasi untuk entitas bisnis apapun, lengkap dengan UUIDv7, Zod input validation, React Query hooks, dan Pagination dinamis.",
    highlights: [
      "Model UUIDv7 sortable B-tree index",
      "Komponen Modal & Form Styles terpadu",
      "Paginasi rows-per-page kustom",
    ],
  },
  {
    icon: CheckCircle2,
    badge: "Quality Gate",
    title: "Zero-Warning & Automated Smoke Test",
    description:
      "Pipeline pengujian menyeluruh dengan Playwright E2E smoke test yang memvalidasi otentikasi, routing, dan siklus CRUD secara otomatis sebelum deployment.",
    highlights: [
      "100% lolos npx tsc --noEmit",
      "0 ESLint warning & error",
      "E2E Playwright test via npm run smoke",
    ],
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="border-b-2 border-ink px-5 py-20 sm:px-6 lg:px-8 bg-paper">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-display text-xs font-black tracking-widest text-slate-500 uppercase">
            Standar Industri
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Pilar Arsitektur & Fitur Inti
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-graphite">
            Dirancang khusus untuk membangun aplikasi skala enterprise tanpa
            harus mengulang konfigurasi keamanan, otorisasi, dan arsitektur dari nol.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group flex flex-col justify-between rounded-2xl border-2 border-ink bg-white p-6 shadow-[4px_4px_0px_#1b1a17] transition hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1b1a17]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl border-2 border-ink bg-slate-50 shadow-[2px_2px_0px_#1b1a17]">
                      <Icon className="size-5.5 text-ink" />
                    </span>
                    <span className="rounded-full border border-ink/20 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-extrabold text-ink">
                    {feat.title}
                  </h3>

                  <p className="mt-3 text-sm text-graphite leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {feat.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>{h}</span>
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
