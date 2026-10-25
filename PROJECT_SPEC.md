# 📋 Spesifikasi Proyek & Fitur (PROJECT_SPEC.md)

> **Panduan Penggunaan untuk Anda (Developer):**
> 1. Isi atau sesuaikan informasi di bawah ini sesuai proyek yang ingin Anda buat.
> 2. Cukup berikan instruksi berikut kepada AI Anda di chat:
>    ```text
>    "Tolong baca file PROJECT_SPEC.md, lalu eksekusi dan bangun seluruh proyek beserta fitur-fiturnya dari awal sampai selesai sesuai standar AGENTS.md!"
>    ```
> 3. AI akan otomatis membaca spesifikasi ini, menjalankan CLI scaffolding, menyesuaikan schema & field form, membuat migrasi database, menyinkronkan RBAC, dan memverifikasi seluruh quality gates.

---

## 🤖 Directives & Workflow Khusus untuk AI Assistant

Ketika pengguna meminta Anda membaca dan mengeksekusi file ini, Anda **WAJIB** mengikuti alur kerja berikut secara berurutan dan otonom:
1. **Identitas Proyek**: Baca Bagian 1. Perbarui `package.json`, `common/constants/app.constant.ts`, `docker-compose.yml`, dan `.env.example` sesuai nilai yang diminta.
2. **Scaffolding Fitur**: Untuk setiap fitur di Bagian 2, gunakan perintah CLI generator:
   ```bash
   npm run make:feature <key> "<Label>" [plural_slug] [--with-image]
   ```
   *(Gunakan `--with-image` jika fitur memerlukan foto/gambar).*
3. **Kustomisasi Field & Form**:
   - Sesuaikan field di `modules/dashboard/<key>/<key>.schema.ts` (Zod validation & TypeScript types).
   - Sesuaikan mutasi di `modules/dashboard/<key>/<key>.service.ts` dan pembacaan data di `*.queries.ts`.
   - Perbarui field input di `components/<Pascal>Modal.tsx` menggunakan token `@/common/utils/form-styles`.
   - Perbarui kolom tabel di `components/<Pascal>Table.tsx`.
   - Perbarui model dan relasi (Foreign Key) di `prisma/schema.prisma`.
4. **Migrasi Database**: Jalankan `npm run db:migrate -- --name init_<project_name>`.
5. **Sinkronisasi Hak Akses (RBAC)**: Jalankan `npm run db:sync` agar Super Admin langsung memiliki wewenang penuh pada semua modul baru.
6. **Data Awal (Seeder)**: Tambahkan sample data awal di `prisma/seed.ts` jika dicantumkan pada Bagian 3.
7. **Quality Gates**: Eksekusi `npx prisma validate && npm run lint && npx tsc --noEmit` dan pastikan **0 error & 0 warning**.
8. **Pencatatan**: Catat ringkasan pekerjaan yang berhasil diselesaikan ke `PROGRESS.md`.

---

## Bagian 1: Identitas & Konfigurasi Proyek

Isi parameter konfigurasi umum proyek Anda di bawah ini:

| Parameter | Nilai / Konfigurasi | Keterangan |
| :--- | :--- | :--- |
| **Nama Slug Paket** | `[contoh: inventory-hub]` | Huruf kecil kebab-case (untuk `package.json` dan Docker) |
| **Judul / Brand Aplikasi** | `[contoh: Inventory Hub]` | Nama brand aplikasi yang tampil di UI & title bar |
| **Deskripsi Aplikasi** | `[contoh: Sistem Manajemen Stok & Inventaris Pergudangan Modern]` | Deskripsi singkat untuk metadata SEO & landing page |
| **Nama Database PostgreSQL** | `[contoh: db_inventory]` | Nama database PostgreSQL di `.env` dan Docker |
| **Port Aplikasi (Host)** | `[contoh: 3000]` | Port lokal (misal: 3000, 3001, atau 3004) |

---

## Bagian 2: Daftar Fitur & Modul Dashboard

Tuliskan setiap fitur dashboard yang ingin dibuat di bawah ini. Anda bisa menduplikasi template fitur sesuai jumlah modul yang Anda butuhkan:

---

### Fitur 1: `[Nama Modul 1]`
- **Feature Key** (`<key>`): `[contoh: category]` *(singular, kebab-case, huruf kecil)*
- **Feature Label** (`<Label>`): `[contoh: Kategori Barang]` *(Judul bahasa Indonesia)*
- **Plural Slug** (`[plural_slug]`): `[contoh: categories]` *(URL rute di dashboard, default: key + 's')*
- **Menu Group**: `[contoh: Master Data]` *(Kelompok menu di sidebar dashboard)*
- **Icon Menu**: `[contoh: Tags]` *(Nama icon dari Lucide Icons)*
- **Upload Gambar**: `[Tidak / Ya]` *(Jika "Ya", sertakan flag --with-image)*
- **Deskripsi Fitur**: `[contoh: Mengelola klasifikasi kategori untuk inventaris barang]*`

#### Struktur Kolom / Field Data:
| Nama Field | Tipe Data | Form Input | Wajib? | Keterangan / Validasi |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Text Input | Ya | Min. 2 karakter, maksimal 100 karakter, unik |
| `description` | String | Textarea | Tidak | Deskripsi singkat kategori |
| `sortOrder` | Integer | Number Input | Ya | Default 0, urutan prioritas |
| `isActive` | Boolean | Checkbox | Ya | Status publikasi (Aktif / Nonaktif) |

---

### Fitur 2: `[Nama Modul 2]`
- **Feature Key** (`<key>`): `[contoh: product]`
- **Feature Label** (`<Label>`): `[contoh: Data Produk]`
- **Plural Slug** (`[plural_slug]`): `[contoh: products]`
- **Menu Group**: `[contoh: Master Data]`
- **Icon Menu**: `[contoh: Package]`
- **Upload Gambar**: `Ya`
- **Deskripsi Fitur**: `[contoh: Mengelola katalog produk barang, stok, harga, dan foto produk]`

#### Struktur Kolom / Field Data:
| Nama Field | Tipe Data | Form Input | Wajib? | Keterangan / Validasi |
| :--- | :--- | :--- | :--- | :--- |
| `sku` | String | Text Input | Ya | Kode SKU unik barang (misal: PRD-001) |
| `name` | String | Text Input | Ya | Nama produk barang |
| `categoryUuid` | UUID (Relation) | Select Dropdown | Ya | Relasi Many-to-One ke model `Category` |
| `price` | Float / Decimal | Number Input | Ya | Harga jual produk |
| `stock` | Integer | Number Input | Ya | Jumlah stok tersedia di gudang |
| `imageUrl` | String | Image Upload | Tidak | Unggah foto produk (Maks. 2MB) |
| `description` | String | Textarea | Tidak | Deskripsi detail barang |
| `isActive` | Boolean | Checkbox | Ya | Status aktif jual |

---

### Fitur 3: `[Nama Modul 3 (Tambahkan modul lainnya jika ada)]`
*(Salin format Fitur di atas jika ingin menambahkan modul lainnya, misalnya: Supplier, Customer, Transaksi, dll.)*

---

## Bagian 3: Data Awal / Seeder Awal (Opsional)

Tuliskan data dummy yang ingin langsung diisi ke database saat `npm run db:seed` dijalankan:

### Contoh Data untuk `Category`:
1. Nama: `Elektronik`, Deskripsi: `Perangkat komputer dan gadget`
2. Nama: `Aksesoris`, Deskripsi: `Peralatan pendukung kantor`
3. Nama: `Alat Tulis`, Deskripsi: `Perlengkapan tulis dan administrasi`

### Contoh Data untuk `Product`:
1. SKU: `ELK-001`, Nama: `Laptop ThinkPad T14`, Kategori: `Elektronik`, Harga: `15000000`, Stok: `10`
2. SKU: `AK-001`, Nama: `Mechanical Keyboard Wireless`, Kategori: `Aksesoris`, Harga: `850000`, Stok: `25`
3. SKU: `AT-001`, Nama: `Kertas HVS A4 80gr 1 Rim`, Kategori: `Alat Tulis`, Harga: `55000`, Stok: `100`

---

## Bagian 4: Catatan Khusus & Aturan Bisnis (Opsional)

Tuliskan jika ada kebutuhan khusus atau logika bisnis tertentu pada proyek Anda:
- `[contoh: Saat stok produk mencapai 0, status tampilan di tabel diberi badge peringatan "Stok Habis"]`
- `[contoh: SKU produk wajib huruf kapital otomatis saat input]`
- `[contoh: Penghapusan Kategori tidak diizinkan jika masih memiliki Produk terkait (Restrict delete)]`

---

> **Langkah Eksekusi:**
> Setelah Anda selesai mengisi berkas ini, simpan perubahannya, lalu katakan ke AI Anda:
> **"Tolong baca PROJECT_SPEC.md dan implementasikan seluruh spesifikasinya dari awal sampai tuntas!"**
