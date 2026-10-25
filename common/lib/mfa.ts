import "server-only";

import { prisma } from "@/common/lib/db";
import { AppError } from "@/common/utils/errors";
import {
  decryptMfaSecret,
  encryptMfaSecret,
  hashRecoveryCode,
  matchRecoveryCode,
  verifyTotp,
} from "@/common/utils/totp";
import {
  MFA_ATTEMPT_WINDOW_MS,
  MFA_MAX_ATTEMPTS_PER_IP,
  MFA_MAX_ATTEMPTS_PER_USER,
  MFA_RETENTION_MS,
} from "@/common/constants/auth.constant";

const WINDOW_MS = MFA_ATTEMPT_WINDOW_MS;
const MAX_ATTEMPTS_PER_USER = MFA_MAX_ATTEMPTS_PER_USER;
const MAX_ATTEMPTS_PER_IP = MFA_MAX_ATTEMPTS_PER_IP;
const RETENTION_MS = MFA_RETENTION_MS;

export async function getMfaState(userUuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
    select: { mfaEnabled: true, mfaRecoveryCodes: true },
  });

  if (!user) throw new AppError("User tidak ditemukan");

  return {
    enabled: user.mfaEnabled,
    recoveryCodesRemaining: user.mfaRecoveryCodes.length,
  };
}

export async function enableMfa(
  userUuid: string,
  secret: string,
  recoveryCodes: string[]
) {
  const result = await prisma.$transaction(async (tx) => {
    // Sesi lain dicabut; sesi saat ini dibuat ulang oleh action.
    await tx.userSession.deleteMany({ where: { userUuid } });
    return tx.user.update({
      where: { uuid: userUuid },
      data: {
        mfaEnabled: true,
        mfaSecret: encryptMfaSecret(secret),
        mfaRecoveryCodes: recoveryCodes.map(hashRecoveryCode),
        sessionVersion: { increment: 1 },
      },
      select: { sessionVersion: true },
    });
  });

  return { sessionVersion: result.sessionVersion };
}

export async function disableMfa(userUuid: string) {
  const result = await prisma.$transaction(async (tx) => {
    await tx.userSession.deleteMany({ where: { userUuid } });
    return tx.user.update({
      where: { uuid: userUuid },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaRecoveryCodes: [],
        sessionVersion: { increment: 1 },
      },
      select: { sessionVersion: true },
    });
  });

  return { sessionVersion: result.sessionVersion };
}

export async function replaceRecoveryCodes(
  userUuid: string,
  recoveryCodes: string[]
) {
  await prisma.user.update({
    where: { uuid: userUuid },
    data: { mfaRecoveryCodes: recoveryCodes.map(hashRecoveryCode) },
  });
}

async function assertMfaRateLimited(userUuid: string, ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);

  const [byUser, byIp] = await Promise.all([
    prisma.mfaAttempt.count({
      where: { userUuid, createdAt: { gte: since } },
    }),
    ip === "unknown"
      ? Promise.resolve(0)
      : prisma.mfaAttempt.count({
          where: { ip, createdAt: { gte: since } },
        }),
  ]);

  if (
    byUser >= MAX_ATTEMPTS_PER_USER ||
    (ip !== "unknown" && byIp >= MAX_ATTEMPTS_PER_IP)
  ) {
    throw new AppError(
      "Terlalu banyak percobaan kode MFA. Coba lagi beberapa menit lagi."
    );
  }
}

async function recordMfaFailure(userUuid: string, ip: string) {
  await prisma.$transaction([
    prisma.mfaAttempt.create({ data: { userUuid, ip } }),
    prisma.mfaAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } },
    }),
  ]);
}

export async function verifyMfaForUser({
  userUuid,
  sessionVersion,
  code,
  ip,
}: {
  userUuid: string;
  sessionVersion: number;
  code: string;
  ip: string;
}) {
  await assertMfaRateLimited(userUuid, ip);

  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
    select: {
      uuid: true,
      name: true,
      email: true,
      sessionVersion: true,
      mfaEnabled: true,
      mfaSecret: true,
      mfaRecoveryCodes: true,
    },
  });

  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    throw new AppError("Verifikasi MFA tidak tersedia untuk akun ini");
  }

  if (user.sessionVersion !== sessionVersion) {
    throw new AppError("Sesi sudah berubah. Silakan login ulang.");
  }

  const secret = decryptMfaSecret(user.mfaSecret);
  if (verifyTotp(secret, code)) {
    await prisma.mfaAttempt.deleteMany({ where: { userUuid } });
    return {
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        sessionVersion: user.sessionVersion,
      },
      recoveryUsed: false,
    };
  }

  const matched = matchRecoveryCode(code, user.mfaRecoveryCodes);
  if (matched) {
    // Kode pemulihan hanya boleh dipakai sekali.
    await prisma.$transaction([
      prisma.user.update({
        where: { uuid: userUuid },
        data: {
          mfaRecoveryCodes: user.mfaRecoveryCodes.filter(
            (hash) => hash !== matched
          ),
        },
      }),
      prisma.mfaAttempt.deleteMany({ where: { userUuid } }),
    ]);

    return {
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        sessionVersion: user.sessionVersion,
      },
      recoveryUsed: true,
    };
  }

  await recordMfaFailure(userUuid, ip);
  throw new AppError("Kode verifikasi salah");
}
