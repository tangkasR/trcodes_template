import { z } from "zod";

const password = z
  .string()
  .min(1, "Password wajib diisi")
  .max(200, "Password terlalu panjang");

const code = z
  .string()
  .trim()
  .min(6, "Kode verifikasi minimal 6 karakter")
  .max(40, "Kode verifikasi terlalu panjang");

export const startMfaSetupSchema = z.object({ password });

export const confirmMfaSetupSchema = z.object({ code });

export const mfaPasswordCodeSchema = z.object({ password, code });

export type StartMfaSetupInput = z.infer<typeof startMfaSetupSchema>;
export type ConfirmMfaSetupInput = z.infer<typeof confirmMfaSetupSchema>;
export type MfaPasswordCodeInput = z.infer<typeof mfaPasswordCodeSchema>;

export type ActiveSession = {
  uuid: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};
