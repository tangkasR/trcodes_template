"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { createSession, requireSession } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { getClientIp } from "@/common/utils/request-ip";
import { parseInput, uuidSchema } from "@/common/utils/zod";

import {
  confirmMfaSetupSchema,
  mfaPasswordCodeSchema,
  startMfaSetupSchema,
} from "./security.schema";
import {
  beginMfaSetup,
  confirmMfaSetup,
  disableMfaAccount,
  regenerateMfaRecoveryCodes,
  revokeOtherSessions,
  revokeSession,
} from "./security.service";

export async function startMfaSetupAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const data = parseInput(startMfaSetupSchema, input);
    return beginMfaSetup(session.userUuid, data.password);
  });
}

export async function confirmMfaSetupAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const data = parseInput(confirmMfaSetupSchema, input);
    const result = await confirmMfaSetup(session.userUuid, data.code);

    // Sesi lain dicabut saat MFA diaktifkan; segarkan cookie sesi saat ini.
    await createSession(session.userUuid, result.sessionVersion);
    await recordAudit({
      actor: session,
      action: "mfa.enable",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: `MFA diaktifkan dengan ${result.recoveryCodes.length} kode pemulihan`,
    });

    return { recoveryCodes: result.recoveryCodes };
  }, "MFA berhasil diaktifkan");
}

export async function disableMfaAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const data = parseInput(mfaPasswordCodeSchema, input);
    const result = await disableMfaAccount({
      userUuid: session.userUuid,
      sessionVersion: session.sessionVersion,
      password: data.password,
      code: data.code,
      ip: await getClientIp(),
    });

    await createSession(session.userUuid, result.sessionVersion);
    await recordAudit({
      actor: session,
      action: "mfa.disable",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: "MFA dinonaktifkan",
    });

    return { enabled: false };
  }, "MFA berhasil dinonaktifkan");
}

export async function regenerateRecoveryCodesAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const data = parseInput(mfaPasswordCodeSchema, input);
    const result = await regenerateMfaRecoveryCodes({
      userUuid: session.userUuid,
      sessionVersion: session.sessionVersion,
      password: data.password,
      code: data.code,
      ip: await getClientIp(),
    });

    await recordAudit({
      actor: session,
      action: "mfa.recovery_regenerate",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: `Membuat ${result.recoveryCodes.length} kode pemulihan baru`,
    });

    return { recoveryCodes: result.recoveryCodes };
  }, "Kode pemulihan berhasil dibuat ulang");
}

export async function revokeSessionAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const sessionUuid = parseInput(uuidSchema, input);

    await revokeSession(
      session.userUuid,
      sessionUuid,
      session.sessionUuid
    );
    await recordAudit({
      actor: session,
      action: "session.revoke",
      targetType: "session",
      targetUuid: sessionUuid,
      detail: "Mencabut satu sesi perangkat",
    });
    revalidatePath("/dashboard/security");

    return { revoked: true };
  }, "Sesi berhasil dicabut");
}

export async function revokeOtherSessionsAction() {
  return handleAction(async () => {
    const session = await requireSession();
    const result = await revokeOtherSessions(
      session.userUuid,
      session.sessionUuid
    );

    await recordAudit({
      actor: session,
      action: "session.revoke_others",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: `Mencabut ${result.count} sesi perangkat lain`,
    });
    revalidatePath("/dashboard/security");

    return result;
  }, "Sesi lain berhasil dicabut");
}
