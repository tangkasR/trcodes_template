// src/modules/auth/auth.service.ts
import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/common/lib/db";
import { AppError } from "@/common/utils/errors";
import {
  LOGIN_LOCKOUT_WINDOW_MS,
  LOGIN_MAX_ATTEMPTS_PER_EMAIL,
  LOGIN_MAX_ATTEMPTS_PER_IP,
  LOGIN_MAX_ATTEMPTS_UNKNOWN_IP,
  LOGIN_RETENTION_MS,
} from "@/common/constants/auth.constant";
import type { LoginInput } from "./auth.schema";

const COST = 12;

const WINDOW_MS = LOGIN_LOCKOUT_WINDOW_MS;
const MAX_FAILED_PER_PAIR = LOGIN_MAX_ATTEMPTS_PER_EMAIL;
const MAX_FAILED_PER_IP = LOGIN_MAX_ATTEMPTS_PER_IP;
const MAX_FAILED_UNKNOWN_IP = LOGIN_MAX_ATTEMPTS_UNKNOWN_IP;
const RETENTION_MS = LOGIN_RETENTION_MS;

// Hash pembanding supaya waktu respons sama baik email ada maupun tidak
let dummyHash: string | undefined;
async function getDummyHash() {
  return (dummyHash ??= await bcrypt.hash("dummy-password-untuk-timing", COST));
}

// Dicek SEBELUM bcrypt: percobaan yang diblokir tidak membebani CPU.
// Limit per email+IP, bukan per email global, supaya penyerang tidak bisa
// mengunci akun orang lain hanya dengan salah password beberapa kali.
async function assertNotRateLimited(email: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);

  if (ip === "unknown") {
    const byUnknownIp = await prisma.loginAttempt.count({
      where: { ip: "unknown", createdAt: { gte: since } },
    });
    if (byUnknownIp >= MAX_FAILED_UNKNOWN_IP) {
      throw new AppError(
        "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi."
      );
    }
    return;
  }

  const [byPair, byIp] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email, ip, createdAt: { gte: since } },
    }),
    prisma.loginAttempt.count({
      where: { ip, createdAt: { gte: since } },
    }),
  ]);

  if (byPair >= MAX_FAILED_PER_PAIR || byIp >= MAX_FAILED_PER_IP) {
    throw new AppError(
      "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi."
    );
  }
}

async function recordFailedLogin(email: string, ip: string) {
  await prisma.loginAttempt.create({ data: { email, ip } });
  // bersihkan data lama supaya tabel tidak membengkak
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
  });
}

// Mengembalikan data user kalau kredensial benar, null kalau salah
// Melempar AppError kalau kena pembatasan
export async function authenticate(
  { email, password }: LoginInput,
  ip: string
): Promise<{
  uuid: string;
  name: string;
  email: string;
  photo?: string | null;
  sessionVersion: number;
  mfaEnabled: boolean;
} | null> {
  await assertNotRateLimited(email, ip);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      uuid: true,
      name: true,
      email: true,
      password: true,
      photo: true,
      isActive: true,
      sessionVersion: true,
      mfaEnabled: true,
    },
  });

  const ok = await bcrypt.compare(
    password,
    user?.password ?? (await getDummyHash())
  );

  if (!user || !ok) {
    // dicatat juga untuk email yang tidak terdaftar: perilakunya sama, tidak membocorkan email valid
    await recordFailedLogin(email, ip);
    return null;
  }

  if (!user.isActive) {
    throw new AppError(
      "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
    );
  }

  await prisma.loginAttempt.deleteMany({ where: { email, ip } });
  return {
    uuid: user.uuid,
    name: user.name,
    email: user.email,
    photo: user.photo,
    sessionVersion: user.sessionVersion,
    mfaEnabled: user.mfaEnabled,
  };
}
