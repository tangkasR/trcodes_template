#!/usr/bin/env node
/**
 * trcodes Enterprise Project Initializer
 * Mengonfigurasi ulang nama proyek, database, branding, dan port
 * untuk membuat proyek baru dari starter template ini dalam 1 menit.
 *
 * Penggunaan:
 *   npm run project:init
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log(`
\x1b[36m===============================================================\x1b[0m
\x1b[1m🚀 Inisialisasi Proyek Baru dari Starter Template\x1b[0m
\x1b[36m===============================================================\x1b[0m
Silakan isi informasi proyek baru Anda (tekan Enter untuk nilai default):
`);

  const projectName =
    (await rl.question("1. Nama Paket / Slug Proyek (kebab-case) [my-app]: ")).trim() || "my-app";
  const appTitle =
    (await rl.question("2. Judul / Brand Aplikasi [Aplikasi Enterprise]: ")).trim() ||
    "Aplikasi Enterprise";
  const appDesc =
    (
      await rl.question(
        "3. Deskripsi Singkat Aplikasi [Sistem Enterprise Berbasis Next.js 16]: "
      )
    ).trim() || "Sistem Enterprise Berbasis Next.js 16";
  const dbName =
    (
      await rl.question(
        `4. Nama Database PostgreSQL [db_${projectName.replace(/[^a-z0-9]/g, "_")}]: `
      )
    ).trim() || `db_${projectName.replace(/[^a-z0-9]/g, "_")}`;
  const appPort =
    (await rl.question("5. Port Lokal / Host Aplikasi [3000]: ")).trim() || "3000";

  rl.close();

  console.log("\n\x1b[33m⏳ Menerapkan konfigurasi ke berkas proyek...\x1b[0m");

  const cwd = process.cwd();

  // 1. Update package.json
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("  ✔ package.json diperbarui");
  }

  // 2. Update common/constants/app.constant.ts
  const appConstPath = path.join(cwd, "common", "constants", "app.constant.ts");
  if (fs.existsSync(appConstPath)) {
    let content = fs.readFileSync(appConstPath, "utf8");
    content = content.replace(
      /export const APP_NAME = ".*?";/,
      `export const APP_NAME = "${appTitle}";`
    );
    content = content.replace(
      /export const DEFAULT_SITE_TITLE = ".*?";/,
      `export const DEFAULT_SITE_TITLE = "${appTitle}";`
    );
    content = content.replace(
      /export const SITE_DESCRIPTION = ".*?";/,
      `export const SITE_DESCRIPTION = "${appDesc}";`
    );
    fs.writeFileSync(appConstPath, content);
    console.log("  ✔ common/constants/app.constant.ts diperbarui");
  }

  // 3. Update docker-compose.yml
  const dockerPath = path.join(cwd, "docker-compose.yml");
  if (fs.existsSync(dockerPath)) {
    let content = fs.readFileSync(dockerPath, "utf8");
    content = content.replace(/container_name: \w+_postgres/, `container_name: ${projectName}_postgres`);
    content = content.replace(/container_name: \w+_app/, `container_name: ${projectName}_app`);
    content = content.replace(/POSTGRES_DB: \${POSTGRES_DB:-.*?}/, `POSTGRES_DB: \${POSTGRES_DB:-${dbName}}`);
    content = content.replace(/APP_PORT:-3004/, `APP_PORT:-${appPort}`);
    fs.writeFileSync(dockerPath, content);
    console.log("  ✔ docker-compose.yml diperbarui");
  }

  // 4. Update .env.example
  const envExPath = path.join(cwd, ".env.example");
  if (fs.existsSync(envExPath)) {
    let content = fs.readFileSync(envExPath, "utf8");
    content = content.replace(/POSTGRES_DB=".*?"/, `POSTGRES_DB="${dbName}"`);
    content = content.replace(/APP_PORT=\d+/, `APP_PORT=${appPort}`);
    fs.writeFileSync(envExPath, content);
    console.log("  ✔ .env.example diperbarui");
  }

  console.log(`
\x1b[32m===============================================================\x1b[0m
\x1b[32m✔ Sukses! Proyek berhasil diinisialisasi untuk:\x1b[0m \x1b[1m${appTitle}\x1b[0m
\x1b[32m===============================================================\x1b[0m
Langkah Selanjutnya:
  1. Sesuaikan berkas \x1b[36m.env\x1b[0m Anda dengan nama database: \x1b[36m${dbName}\x1b[0m
  2. Jalankan migrasi basis data: \x1b[36mnpm run db:migrate\x1b[0m
  3. Masukkan data awal: \x1b[36mnpm run db:seed\x1b[0m
  4. Jalankan aplikasi: \x1b[36mnpm run dev\x1b[0m
`);
}

main().catch((err) => {
  console.error("\x1b[31mError saat inisialisasi:\x1b[0m", err);
  process.exit(1);
});
