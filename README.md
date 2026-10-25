# 🚀 trcodes — Enterprise Starter Boilerplate & AI-Driven Scaffolding

<p align="center">
  <strong>Starter Boilerplate & Platform Manajemen RBAC Skala Enterprise</strong><br>
  Dibangun dengan arsitektur modern Next.js 16 App Router, Prisma 7 (PostgreSQL UUIDv7), Dynamic RBAC, Multi-Factor Authentication (MFA / TOTP), Strict Nonce-based CSP, Generator Scaffolding Otomatis, dan Alur Pengembangan Berbasis AI (Specification-Driven Development).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.1-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma-7.10.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Playwright-Smoke_Tested-2EAD33?style=for-the-badge&logo=playwright" alt="Playwright" />
</p>

---

## 🌟 Ikhtisar (Overview)

**trcodes Starter Template** adalah kerangka kerja web fullstack siap produksi yang dirancang khusus untuk mempercepat pembangunan aplikasi backoffice, SaaS, dan portal enterprise. 

Template ini mengombinasikan keunggulan **Clean Modular Architecture**, performa tinggi Next.js 16 App Router dengan **100% Direct Imports** (tanpa barrel file penghambat Turbopack), sistem keamanan berlapis (Strict CSP, MFA AES-256-GCM, Rate Limiter PostgreSQL), serta **CLI Scaffolding Otomatis** yang memungkinkan pengembang maupun asisten AI membangun modul baru secara instan dan bebas kesalahan.

---

## ⚡ Fitur Unggulan (Key Features)

### 1. Arsitektur Modular Berbasis Audiens & Layer `common/`
- **Pemisahan Tegas Audiens**: Modul publik (`modules/public/`) dan modul backoffice (`modules/dashboard/`) terisolasi secara mandiri.
- **Layer `common/` Bersih**: Resource lintas modul tersentralisasi di `@/common/*` (`components`, `constants`, `context`, `hooks`, `lib`, `types`, `utils`).
- **100% Direct Imports**: Semua modul mengimpor langsung dari sumber aslinya tanpa barrel re-export (`index.ts`) untuk efisiensi maksimal compiler dan tree-shaking.

### 2. Generator Scaffolding 1-Perintah (`npm run make:feature`)
- Membuat 9 berkas terstandarisasi untuk modul baru secara instan:
  `schema` (Zod), `service` (server-only), `queries` (server-only), `actions` (Server Actions), `hooks` (React Query), `Modal`, `Table`, `Page`, dan route segment.
- **Auto-Registration**: Otomatis mendaftarkan model ke `prisma/schema.prisma`, entitas ke `rbac.constant.ts`, menu ke `navigation.constant.ts`, dan mengeksekusi `npm run db:sync`.
- **Dukungan Upload Gambar (`--with-image`)**: Men-generate modul upload gambar lokal lengkap dengan validasi magic bytes (JPEG/PNG/WebP), server action, dan komponen form preview `next/image` (`unoptimized`).

### 3. Specification-Driven AI Workflow (`PROJECT_SPEC.md`)
- Cukup isi spesifikasi proyek baru dan daftar tabel/fitur pada berkas **`PROJECT_SPEC.md`**.
- Perintahkan AI Anda: *"Tolong baca file PROJECT_SPEC.md dan eksekusi seluruh fiturnya sampai selesai!"*
- Asisten coding (Cursor, Windsurf, Copilot, Gemini, Claude) akan mengeksekusi inisialisasi, scaffolding, kustomisasi field, migrasi, dan verifikasi secara mandiri dan akurat.

### 4. Dynamic RBAC & Matriks Hak Akses
- Kontrak izin aksi granular: `read`, `add`, `edit`, `delete`.
- Matriks izin interaktif untuk mengatur wewenang peran (*roles*) per fitur sistem.
- Proteksi berlapis: routing guard di `proxy.ts`, pengecekan halaman via `requirePageAccess`, mutasi via `requirePermission`, dan UI conditional rendering via hook `usePermission`.

### 5. Keamanan Skala Enterprise (Security Hardening)
- **Strict Content Security Policy (CSP)**: Nonce dinamis dibangun per-request di `proxy.ts` (Next.js 16). Menghapus sepenuhnya `'unsafe-inline'` pada skrip dan gaya CSS di produksi.
- **Manajemen Sesi & Revokasi Perangkat**: Token JWT HS256 (12 jam) dipetakan ke tabel basis data `user_sessions`. Pengguna dapat memantau perangkat aktif dan mencabut sesi secara instan.
- **Two-Factor Authentication (MFA / TOTP)**: Secret TOTP disimpan terenkripsi menggunakan **AES-256-GCM**, dilengkapi kode pemulihan (*recovery codes*) SHA-256 sekali pakai.
- **Distributed Rate Limiting**: Engine rate limiter berbasis PostgreSQL (`rate_limit_buckets`) dengan atomic upsert dan fallback otomatis ke in-memory storage.
- **Append-only Audit Trails**: Seluruh aktivitas mutasi penting tercatat otomatis di tabel `audit_logs` dengan sanitasi informasi rahasia.

### 6. Design System Terpadu & Responsif
- **Centralized Form Styles**: Input, textarea, select, checkbox, dan error text terstandarisasi di `@/common/utils/form-styles`.
- **Enterprise Modal Dialog**: Backdrop blur glassmorphism, animasi zoom, autofocus trap, dan navigasi keyboard (`ESC`).
- **Paginasi Dinamis**: Dukungan limit per halaman fleksibel (`10`, `25`, `50`, `100`, `Semua`, dan limit kustom).

---

## 🛠️ Tech Stack

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.4.1](https://nextjs.org/) | App Router, Turbopack, Server Actions, Dynamic Nonce CSP |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type-safety end-to-end |
| **Database** | [PostgreSQL 15+](https://www.postgresql.org/) | Database relasional dengan indeks UUIDv7 |
| **ORM** | [Prisma 7.10.0](https://www.prisma.io/) | `@prisma/client`, `@prisma/adapter-pg`, konfigurasi `prisma7.config.ts` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | `@tailwindcss/turbopack`, CSS design tokens di `globals.css` |
| **Icons** | [Lucide React](https://lucide.dev/) | Icon library modern dan ringan |
| **Client State & Tables** | [TanStack React Query v5](https://tanstack.com/query/latest) | Server-state caching & revalidasi mutasi |
| **Validation** | [Zod 4](https://zod.dev/) | Validasi skema input & server contract |
| **Auth & Crypto** | Jose, Bcryptjs, Web Crypto | JWT HS256, AES-256-GCM, SHA-256 |
| **Testing** | [Playwright Core](https://playwright.dev/) | End-to-end smoke testing terotomatisasi |

---

## 📁 Struktur Direktori (Project Architecture)

```text
trcodes/
├── app/                             # Routing boundary murni (Next.js App Router)
│   ├── (public)/                    # Route grup publik (Home, Login, MFA)
│   ├── (dashboard)/                 # Route grup dashboard (Admin Backoffice)
│   ├── api/                         # Endpoint JSON read-only untuk client table
│   ├── globals.css                  # Token desain Tailwind v4 & custom variables
│   ├── layout.tsx                   # Root layout dengan CSP Nonce provider
│   └── proxy.ts                     # Next.js 16 proxy untuk Nonce CSP & Auth guard
├── common/                          # Layer utilitas & komponen bersama lintas audiens
│   ├── components/                  # Komponen UI global (Modal, Pagination, PublicShell, dll)
│   ├── constants/                   # Source of truth konstanta (RBAC, Auth, Nav, App, Pagination)
│   ├── context/                     # Context providers (PermissionContext, SidebarContext)
│   ├── hooks/                       # Custom hooks global
│   ├── lib/                         # Data layer & server services (db, auth, audit, mfa, rate-limit)
│   ├── types/                       # Tipe data global
│   └── utils/                       # Utilitas stateless (totp, rbac, site, formatting, form-styles)
├── modules/                         # Implementasi bisnis modular berorientasi audiens
│   ├── public/                      # Modul halaman publik
│   │   ├── home/                    # Halaman landing & demonstrasi fitur
│   │   └── auth/                    # Alur login & challenge MFA
│   └── dashboard/                   # Modul fitur dashboard
│       ├── dashboard/               # Beranda KPI metrik sistem
│       ├── profile/                 # Pengaturan profil akun pengguna login
│       ├── item/                    # Contoh referensi modul CRUD standar
│       ├── user/ & role/            # Manajemen pengguna & peran sistem
│       ├── feature/                 # Registri entitas fitur sistem
│       ├── role-permission/         # Matriks izin hak akses peran
│       ├── audit-log/               # Log jejak audit keamanan
│       ├── login-attempt/           # Monitoring riwayat percobaan login
│       └── security/                # Panel MFA TOTP & Revokasi Sesi Perangkat
├── prisma/                          # Skema basis data & seeders
│   ├── schema.prisma                # Definisi tabel PostgreSQL & relasi UUIDv7
│   ├── migrations/                  # Riwayat migrasi Prisma
│   └── seed.ts                      # Script seeding data dasar & akun Super Admin
├── scripts/                         # Generator CLI & tooling otomatisasi
│   ├── make-feature.mjs             # CLI scaffolding modul baru 1-perintah
│   ├── init-project.mjs             # CLI inisialisasi & rebranding proyek baru
│   ├── sync-features.ts             # Sinkronisasi hak akses RBAC ke basis data
│   └── smoke.mjs                    # Automated E2E Playwright smoke testing
├── AGENTS.md                        # Standar arsitektur & panduan AI Assistant
├── PROJECT_SPEC.md                  # Template prompt spesifikasi proyek baru
├── .cursorrules                     # Konfigurasi aturan untuk Cursor IDE
└── docker-compose.yml               # Konfigurasi container Docker PostgreSQL & Next.js
```

---

## ⚙️ Persiapan & Instalasi (Getting Started)

### Prasyarat Sistem
- **Node.js**: Versi `20.x` atau `22.x` (LTS direkomendasikan)
- **PostgreSQL**: Versi `15.x` atau lebih baru
- **Package Manager**: `npm`

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/tangkasR/trcodes.dev.git my-project
cd my-project
npm install
```
> *Catatan: Proses `postinstall` akan secara otomatis menjalankan `npx prisma generate` ke direktori `@/app/generated/prisma`.*

### 2. Inisialisasi Proyek Baru (Opsional — 1 Menit)
Jika Anda menggunakan repositori ini sebagai template untuk proyek klien atau produk baru:
```bash
npm run project:init
```
*Script interaktif ini akan menanyakan Nama Aplikasi, Deskripsi, Nama Database, dan Port Host, lalu otomatis memperbarui konfigurasi proyek.*

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan variabel di `.env` (terutama `DATABASE_URL`, `SESSION_SECRET`, dan `SEED_ADMIN_PASSWORD`).

### 4. Migrasi Basis Data & Seeder
```bash
# Buat tabel di PostgreSQL
npm run db:migrate -- --name init

# Masukkan master data awal & akun Super Admin
npm run db:seed
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Halaman Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Dashboard Admin**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🏗️ Membuat Fitur Baru (Scaffolding CLI)

Anda tidak perlu membuat 9 berkas fitur secara manual dari nol. Gunakan perintah scaffolding otomatis:

### Modul Standar
```bash
npm run make:feature product "Katalog Produk" products
```

### Modul dengan Fitur Upload Gambar
```bash
npm run make:feature product "Katalog Produk" products --with-image
```

**Yang Terjadi Otomatis:**
1. Men-generate 9 berkas modul lengkap di `modules/dashboard/product/` dan rute `app/(dashboard)/dashboard/products/page.tsx`.
2. Mendaftarkan model Prisma ke `prisma/schema.prisma`.
3. Mendaftarkan entitas ke `common/constants/rbac.constant.ts`.
4. Menambahkan menu navigasi ke `common/constants/navigation.constant.ts`.
5. Menjalankan `npm run db:sync` agar akun Super Admin langsung memiliki izin penuh.

**Langkah Terakhir Anda:**
Jalankan migrasi basis data untuk membuat tabel fisik di PostgreSQL:
```bash
npm run db:migrate -- --name add_product
```
Fitur baru Anda langsung aktif dan dapat diakses di sidebar dashboard!

---

## 🤖 Membangun Proyek dengan AI (`PROJECT_SPEC.md`)

Template ini didesain agar ramah terhadap asisten AI coding (Claude, Gemini, Cursor, Windsurf, GitHub Copilot):

1. Buka berkas **`PROJECT_SPEC.md`** di root direktori.
2. Tuliskan nama proyek dan tabel/fitur yang Anda butuhkan pada tabel spesifikasi yang sudah disediakan.
3. Berikan instruksi ini ke AI di chat:
   ```text
   Tolong baca file PROJECT_SPEC.md, lalu buatkan dan eksekusi semua fitur serta konfigurasi yang tertulis di dalamnya sampai selesai dan lulus verifikasi!
   ```
4. AI akan mengeksekusi pembuatan fitur, migrasi database, form modal, dan validasi secara mandiri sesuai standar enterprise di `AGENTS.md`.

---

## 📜 Daftar Perintah Lengkap (Available Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js dengan Turbopack |
| `npm run build` | Membuat kompilasi produksi aplikasi Next.js |
| `npm run start` | Menjalankan server aplikasi di lingkungan produksi |
| `npm run lint` | Menjalankan ESLint untuk memeriksa kualitas kode |
| `npx tsc --noEmit` | Memeriksa integritas tipe data TypeScript secara ketat |
| `npm run smoke` | Menjalankan automated E2E smoke test Playwright |
| `npm run project:init` | Menjalankan wizard CLI inisialisasi & rebranding proyek baru |
| `npm run make:feature` | Men-generate modul dashboard baru secara otomatis |
| `npm run db:migrate` | Membuat dan menerapkan migrasi skema basis data Prisma |
| `npm run db:seed` | Mengisi ulang data awal sistem dan akun Super Admin |
| `npm run db:sync` | Menyelaraskan hak akses fitur RBAC ke basis data |
| `npm run db:studio` | Membuka web GUI Prisma Studio untuk inspeksi data |
| `npm run db:reset` | Mereset basis data dan menjalankan ulang migrasi + seeder |
| `npx prisma validate` | Memvalidasi sintaks skema `prisma/schema.prisma` |

---

## 🐳 Deployment Docker & VPS CI/CD

Repository ini telah dilengkapi alur CI/CD otomatis via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):

- **Automated Quality Gate**: Memvalidasi sintaks Prisma, ESLint, dan TypeScript check pada setiap push ke branch deployment.
- **Automated Deployment**: Terhubung otomatis ke VPS via SSH, melakukan rebuild image Docker aplikasi Next.js, me-restart container, dan mengeksekusi migrasi database (`npx prisma migrate deploy`) secara aman tanpa downtime.

---

## 📄 Lisensi (License)

Proyek ini dirilis di bawah lisensi **MIT**. Bebas digunakan untuk proyek pribadi, open source, maupun kebutuhan komersial perusahaan.

<p align="center">
  Didesain dengan standar rekayasa perangkat lunak modern untuk performa, keamanan, dan kecepatan pengembangan.
</p>
