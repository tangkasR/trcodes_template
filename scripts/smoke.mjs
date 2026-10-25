import "dotenv/config";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createDecipheriv, createHash, createHmac } from "node:crypto";
import { chromium } from "playwright-core";
import pg from "pg";
const { Pool } = pg;

const root = process.cwd();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const shouldStartServer = !process.env.SMOKE_BASE_URL;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server tidak siap setelah ${timeoutMs}ms: ${url}`);
}

function startServer() {
  const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "start"], {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function stopServer(child) {
  if (!child) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

async function checkPublicRoutes() {
  const routes = [
    "/",
    "/login",
  ];

  for (const route of routes) {
    const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    assert(res.status === 200, `GET ${route} menghasilkan ${res.status}`);
    console.log(`ok  GET ${route} -> ${res.status}`);
  }
}

async function checkGuards() {
  const dashboard = await fetch(`${baseUrl}/dashboard`, { redirect: "manual" });
  assert(
    dashboard.status === 307 || dashboard.status === 302,
    `GET /dashboard seharusnya redirect, dapat ${dashboard.status}`
  );
  console.log(`ok  GET /dashboard -> ${dashboard.status} redirect`);

  const register = await fetch(`${baseUrl}/register`, { redirect: "manual" });
  assert(
    register.status === 307 && register.headers.get("location")?.includes("/login"),
    `GET /register seharusnya redirect ke /login, dapat ${register.status}`
  );
  console.log("ok  GET /register -> redirect /login");

  const api = await fetch(`${baseUrl}/api/users`, { redirect: "manual" });
  assert(api.status === 401, `GET /api/users tanpa sesi menghasilkan ${api.status}`);
  console.log("ok  GET /api/users tanpa sesi -> 401");
}

function base32Decode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const output = Buffer.alloc(Math.floor((clean.length * 5) / 8));
  let index = 0;

  for (const char of clean) {
    const digit = alphabet.indexOf(char);
    if (digit === -1) continue;
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return output.subarray(0, index);
}

function hotp(secret, counter) {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000;

  return binary.toString().padStart(6, "0");
}

function decryptMfaSecret(value) {
  const material = process.env.MFA_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  const key = createHash("sha256").update(`trcodes-mfa-v1:${material}`).digest();
  const [, iv, tag, ciphertext] = value.split(".");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function getTotpCodeForUser(email) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    "SELECT mfa_secret FROM users WHERE email = $1",
    [email]
  );
  await pool.end();
  const secret = rows[0]?.mfa_secret;
  if (!secret) return null;
  const raw = decryptMfaSecret(secret);
  return hotp(raw, Math.floor(Date.now() / 1000 / 30));
}

async function login(page, email, password) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /Masuk/i }).click();

  await page.waitForURL(
    (url) => url.pathname.startsWith("/dashboard") || url.pathname === "/login/mfa",
    { timeout: 20_000 }
  );

  if (page.url().includes("/login/mfa")) {
    const code = await getTotpCodeForUser(email);
    assert(code, "Gagal mendapatkan kode TOTP untuk user dengan MFA aktif");
    await page.fill("#code", code);
    await Promise.all([
      page.waitForURL("**/dashboard**", { timeout: 20_000 }),
      page.getByRole("button", { name: "Verifikasi" }).click(),
    ]);
    console.log("ok  login dashboard (dengan verifikasi TOTP MFA)");
    return;
  }

  console.log("ok  login dashboard");
}

async function checkDashboardReads(page) {
  for (const route of [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/users",
    "/dashboard/items",
    "/dashboard/security",
    "/dashboard/audit-logs",
    "/forbidden",
  ]) {
    const res = await page.goto(`${baseUrl}${route}`, {
      waitUntil: "domcontentloaded",
    });
    assert(res?.status() === 200, `GET ${route} dengan sesi menghasilkan ${res?.status()}`);
    console.log(`ok  GET ${route} dengan sesi -> 200`);
  }

  const apiUsers = await page.request.get(`${baseUrl}/api/users`);
  assert(apiUsers.status() === 200, `GET /api/users dengan sesi menghasilkan ${apiUsers.status()}`);
  console.log("ok  GET /api/users dengan sesi -> 200");

  const apiItems = await page.request.get(`${baseUrl}/api/items`);
  assert(apiItems.status() === 200, `GET /api/items dengan sesi menghasilkan ${apiItems.status()}`);
  console.log("ok  GET /api/items dengan sesi -> 200");

  const audit = await page.request.get(`${baseUrl}/api/audit-logs?limit=10`);
  assert(
    audit.status() === 200,
    `GET /api/audit-logs dengan sesi menghasilkan ${audit.status()}`
  );
  const auditBody = await audit.json();
  assert(
    Array.isArray(auditBody.items) &&
      auditBody.items.some(
        (item) => item.action === "auth.login" || item.action === "auth.mfa_success"
      ),
    "Login tidak tercatat di audit log"
  );
  console.log("ok  GET /api/audit-logs dengan sesi -> 200 dan login tercatat");

  await page.goto(`${baseUrl}/dashboard/security`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByText("Sesi & perangkat").waitFor({ timeout: 10_000 });
  await page.getByText("Sesi ini").waitFor({ timeout: 10_000 });
  const badge = page.locator("text=/Aktif|Wajib aktif/");
  await badge.first().waitFor({ timeout: 10_000 });
  console.log("ok  daftar sesi & badge status MFA tampil di /dashboard/security");
}

async function verifyCrudMutation(page) {
  await page.goto(`${baseUrl}/dashboard/items`, {
    waitUntil: "networkidle",
  });

  const itemName = `Smoke Item ${Date.now()}`;

  // 1. Tambah data item
  await page.getByRole("button", { name: "Tambah Data Item" }).click();
  await page.getByPlaceholder("Contoh: Nama item").fill(itemName);
  await page.getByPlaceholder("Deskripsi singkat (opsional)").fill("Smoke test automated CRUD description");
  await page.getByRole("button", { name: "Simpan" }).click();

  await page.getByText("Data Item berhasil ditambahkan").waitFor({ timeout: 15_000 });
  console.log("ok  tambah item baru dari modal dashboard");

  // Tunggu modal selesai dan reload untuk verifikasi data persist di database
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(itemName).waitFor({ timeout: 10_000 });
  console.log("ok  item baru tampil di tabel");

  // 2. Hapus data item yang baru dibuat (auto rollback)
  const itemRow = page.locator("tr", { hasText: itemName });
  await itemRow.getByTitle("Hapus").click();
  await page.getByRole("button", { name: "Ya, Hapus" }).click();

  await page.getByText("Data Item berhasil dihapus").waitFor({ timeout: 15_000 });
  console.log("ok  item berhasil dihapus (cleanup rollback)");
}

async function main() {
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    throw new Error("SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diisi di .env");
  }

  const executablePath = chromeCandidates.find((path) => existsSync(path));
  if (!executablePath) {
    throw new Error("Chrome/Edge tidak ditemukan. Set CHROME_PATH.");
  }

  let server;
  let browser;

  try {
    if (shouldStartServer) {
      server = startServer();
    }
    await waitForServer(`${baseUrl}/login`);

    await checkPublicRoutes();
    await checkGuards();

    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    await login(
      page,
      process.env.SEED_ADMIN_EMAIL,
      process.env.SEED_ADMIN_PASSWORD
    );
    await checkDashboardReads(page);
    await verifyCrudMutation(page);

    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Keluar" }).click();
    await page.getByRole("button", { name: "Ya, keluar" }).click();
    await page.waitForURL("**/login**", { timeout: 20_000 });
    console.log("ok  logout dashboard");

    console.log("\nSmoke test selesai: semua pemeriksaan lulus.");
  } finally {
    if (browser) await browser.close();
    if (server) stopServer(server);
  }
}

main().catch((error) => {
  console.error(`\nSmoke test gagal: ${error.message}`);
  process.exitCode = 1;
});
