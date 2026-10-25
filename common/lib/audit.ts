import "server-only";

import { prisma } from "@/common/lib/db";

export type AuditActor = {
  userUuid: string;
  name?: string;
  email?: string;
};

type AuditEvent = {
  actor?: AuditActor | null;
  action: string;
  targetType?: string;
  targetUuid?: string;
  detail?: string;
  ip?: string;
};

// Audit tidak boleh menggagalkan aksi bisnis yang sudah berhasil. Kalau
// penulisan log gagal, error dicatat ke server dan aksi tetap dilanjutkan.
export async function recordAudit({
  actor,
  action,
  targetType,
  targetUuid,
  detail,
  ip,
}: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUuid: actor?.userUuid ?? null,
        actorName: actor?.name?.slice(0, 100) ?? null,
        actorEmail: actor?.email?.slice(0, 191) ?? null,
        action: action.slice(0, 60),
        targetType: targetType?.slice(0, 50) ?? null,
        targetUuid: targetUuid?.slice(0, 64) ?? null,
        detail: detail?.slice(0, 1000) ?? null,
        ip: ip?.slice(0, 64) ?? null,
      },
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}
