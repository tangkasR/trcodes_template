import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "@/common/lib/db";
import { AppError } from "@/common/utils/errors";
import { assertRateLimit } from "@/common/lib/rate-limit";
import {
  clearMfaSetupTicket,
  createMfaSetupTicket,
  readMfaSetupTicket,
} from "@/common/lib/auth";
import {
  disableMfa,
  enableMfa,
  getMfaState,
  replaceRecoveryCodes,
  verifyMfaForUser,
} from "@/common/lib/mfa";
import {
  decryptMfaSecret,
  encryptMfaSecret,
  formatTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  totpUri,
  verifyTotp,
} from "@/common/utils/totp";

async function verifyPassword(userUuid: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
    select: { password: true, mfaEnabled: true },
  });
  if (!user) throw new AppError("User tidak ditemukan");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("Password salah", "password");

  return user;
}

export async function beginMfaSetup(userUuid: string, password: string) {
  await assertRateLimit(`mfa-setup:${userUuid}`, 10, 15 * 60 * 1000);

  const user = await verifyPassword(userUuid, password);
  if (user.mfaEnabled) throw new AppError("MFA sudah aktif untuk akun ini");

  const account = await prisma.user.findUnique({
    where: { uuid: userUuid },
    select: { email: true },
  });
  if (!account) throw new AppError("User tidak ditemukan");

  const secret = generateTotpSecret();
  await createMfaSetupTicket(userUuid, encryptMfaSecret(secret));

  return {
    secret,
    formattedSecret: formatTotpSecret(secret),
    uri: totpUri(account.email, secret),
  };
}

export async function confirmMfaSetup(userUuid: string, code: string) {
  await assertRateLimit(`mfa-setup-confirm:${userUuid}`, 10, 15 * 60 * 1000);

  const ticket = await readMfaSetupTicket();
  if (!ticket || ticket.userUuid !== userUuid) {
    throw new AppError(
      "Sesi pengaturan MFA kedaluwarsa. Mulai ulang proses aktivasi."
    );
  }

  const state = await getMfaState(userUuid);
  if (state.enabled) throw new AppError("MFA sudah aktif untuk akun ini");

  const secret = decryptMfaSecret(ticket.encryptedSecret);
  if (!verifyTotp(secret, code)) {
    throw new AppError("Kode autentikator salah. Periksa jam perangkatmu.");
  }

  const recoveryCodes = generateRecoveryCodes();
  const result = await enableMfa(userUuid, secret, recoveryCodes);
  await clearMfaSetupTicket();

  return { recoveryCodes, sessionVersion: result.sessionVersion };
}

async function verifySensitiveChange({
  userUuid,
  sessionVersion,
  password,
  code,
  ip,
}: {
  userUuid: string;
  sessionVersion: number;
  password: string;
  code: string;
  ip: string;
}) {
  await assertRateLimit(`mfa-security:${userUuid}`, 10, 15 * 60 * 1000);

  const user = await verifyPassword(userUuid, password);
  if (!user.mfaEnabled) throw new AppError("MFA belum aktif untuk akun ini");

  return verifyMfaForUser({ userUuid, sessionVersion, code, ip });
}

export async function disableMfaAccount(options: {
  userUuid: string;
  sessionVersion: number;
  password: string;
  code: string;
  ip: string;
}) {
  const userRole = await prisma.user.findUnique({
    where: { uuid: options.userUuid },
    select: { role: { select: { name: true } } },
  });
  if (userRole?.role.name === "Super Admin") {
    throw new AppError(
      "MFA wajib aktif untuk akun Super Admin dan tidak dapat dinonaktifkan"
    );
  }

  await verifySensitiveChange(options);
  const result = await disableMfa(options.userUuid);
  return { sessionVersion: result.sessionVersion };
}

export async function regenerateMfaRecoveryCodes(options: {
  userUuid: string;
  sessionVersion: number;
  password: string;
  code: string;
  ip: string;
}) {
  await verifySensitiveChange(options);

  const recoveryCodes = generateRecoveryCodes();
  await replaceRecoveryCodes(options.userUuid, recoveryCodes);
  return { recoveryCodes };
}

export async function revokeSession(
  userUuid: string,
  sessionUuid: string,
  currentSessionUuid: string
) {
  if (sessionUuid === currentSessionUuid) {
    throw new AppError(
      "Sesi saat ini tidak dapat dicabut dari daftar. Gunakan tombol keluar."
    );
  }

  const result = await prisma.userSession.deleteMany({
    where: { uuid: sessionUuid, userUuid },
  });
  if (result.count === 0) {
    throw new AppError("Sesi tidak ditemukan atau sudah tidak aktif");
  }
}

export async function revokeOtherSessions(
  userUuid: string,
  currentSessionUuid: string
) {
  const result = await prisma.userSession.deleteMany({
    where: { userUuid, uuid: { not: currentSessionUuid } },
  });

  return { count: result.count };
}
