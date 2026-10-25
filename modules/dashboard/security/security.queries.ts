import "server-only";

import { prisma } from "@/common/lib/db";
import { pruneExpiredRateLimits } from "@/common/lib/rate-limit";
import type { ActiveSession } from "./security.schema";

export async function getActiveSessions(
  userUuid: string,
  currentSessionUuid: string
): Promise<ActiveSession[]> {
  const now = new Date();

  // Baris sesi dan bucket rate-limit kedaluwarsa dibersihkan secara otomatis.
  await Promise.all([
    prisma.userSession.deleteMany({
      where: { userUuid, expiresAt: { lte: now } },
    }),
    pruneExpiredRateLimits(),
  ]);

  const rows = await prisma.userSession.findMany({
    where: { userUuid, expiresAt: { gt: now } },
    orderBy: { lastSeenAt: "desc" },
    take: 20,
    select: {
      uuid: true,
      ip: true,
      userAgent: true,
      createdAt: true,
      lastSeenAt: true,
      expiresAt: true,
    },
  });

  return rows.map((row) => ({
    uuid: row.uuid,
    ip: row.ip,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    current: row.uuid === currentSessionUuid,
  }));
}
