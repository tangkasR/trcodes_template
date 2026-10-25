// src/modules/auth/auth.actions.ts
"use server";

import { redirect } from "next/navigation";
import {
  loginSchema,
  mfaCodeSchema,
  type AuthFormState,
  type MfaFormState,
} from "./auth.schema";
import { authenticate } from "./auth.service";
import {
  clearMfaChallenge,
  createMfaChallenge,
  createSession,
  deleteSession,
  getSession,
  readMfaChallenge,
} from "@/common/lib/auth";
import { verifyMfaForUser } from "@/common/lib/mfa";
import { recordAudit } from "@/common/lib/audit";
import { AppError } from "@/common/utils/errors";
import { zodFieldErrors } from "@/common/utils/zod";
import { getClientIp } from "@/common/utils/request-ip";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: str(formData.get("email")),
    password: str(formData.get("password")),
  };
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success)
    return { fieldErrors: zodFieldErrors(parsed.error), values };

  const ip = await getClientIp();
  let user: Awaited<ReturnType<typeof authenticate>>;
  try {
    user = await authenticate(parsed.data, ip);
  } catch (e) {
    if (e instanceof AppError) return { error: e.message, values };
    console.error("[login]", e);
    return { error: "Terjadi kesalahan pada server", values };
  }

  // pesan generik: jangan membocorkan email mana yang terdaftar
  if (!user) return { error: "Email atau password salah", values };

  if (user.mfaEnabled) {
    await createMfaChallenge(user.uuid, user.sessionVersion, user.email);
    return { redirectTo: "/login/mfa" };
  }

  await createSession(user.uuid, user.sessionVersion);
  await recordAudit({
    actor: { userUuid: user.uuid, name: user.name, email: user.email },
    action: "auth.login",
    targetType: "user",
    targetUuid: user.uuid,
    detail: `Login berhasil untuk ${user.email}`,
    ip,
  });
  return { redirectTo: "/dashboard" };
}

export async function verifyMfaLogin(
  _prev: MfaFormState,
  formData: FormData
): Promise<MfaFormState> {
  const challenge = await readMfaChallenge();
  if (!challenge) {
    return {
      error: "Sesi verifikasi kedaluwarsa. Silakan login ulang.",
    };
  }

  const raw = { code: str(formData.get("code")) };
  const parsed = mfaCodeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: zodFieldErrors(parsed.error),
      values: { code: raw.code },
    };
  }

  const ip = await getClientIp();
  let result: Awaited<ReturnType<typeof verifyMfaForUser>>;
  try {
    result = await verifyMfaForUser({
      userUuid: challenge.userUuid,
      sessionVersion: challenge.sessionVersion,
      code: parsed.data.code,
      ip,
    });
  } catch (e) {
    if (e instanceof AppError) {
      await recordAudit({
        actor: { userUuid: challenge.userUuid, email: challenge.email },
        action: "auth.mfa_failed",
        targetType: "user",
        targetUuid: challenge.userUuid,
        detail: e.message,
        ip,
      });
      return { error: e.message, values: { code: raw.code } };
    }

    console.error("[mfa]", e);
    return {
      error: "Terjadi kesalahan pada server",
      values: { code: raw.code },
    };
  }

  await createSession(result.user.uuid, result.user.sessionVersion);
  await clearMfaChallenge();
  await recordAudit({
    actor: {
      userUuid: result.user.uuid,
      name: result.user.name,
      email: result.user.email,
    },
    action: "auth.mfa_success",
    targetType: "user",
    targetUuid: result.user.uuid,
    detail: result.recoveryUsed
      ? `Login dengan kode pemulihan MFA untuk ${result.user.email}`
      : `Login dengan TOTP untuk ${result.user.email}`,
    ip,
  });
  return { redirectTo: "/dashboard" };
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await recordAudit({
      actor: session,
      action: "auth.logout",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: `Logout untuk ${session.email}`,
      ip: await getClientIp(),
    });
  }
  await deleteSession(session?.sessionUuid);
  redirect("/login");
}
