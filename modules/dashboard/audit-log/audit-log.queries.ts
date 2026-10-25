import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ListParams } from "@/common/utils/zod";
import type { AuditLogRow } from "./audit-log.schema";

export async function getAuditLogs({ page, limit, q }: ListParams) {
  const where: Prisma.AuditLogWhereInput = q
    ? {
        OR: [
          { actorName: { contains: q, mode: "insensitive" } },
          { actorEmail: { contains: q, mode: "insensitive" } },
          { action: { contains: q, mode: "insensitive" } },
          { targetType: { contains: q, mode: "insensitive" } },
          { detail: { contains: q, mode: "insensitive" } },
          { ip: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { uuid: "desc" }],
      select: {
        uuid: true,
        actorName: true,
        actorEmail: true,
        action: true,
        targetType: true,
        targetUuid: true,
        detail: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const items: AuditLogRow[] = rows.map((r) => ({
    uuid: r.uuid,
    actorName: r.actorName,
    actorEmail: r.actorEmail,
    action: r.action,
    targetType: r.targetType,
    targetUuid: r.targetUuid,
    detail: r.detail,
    ip: r.ip,
    createdAt: r.createdAt,
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
