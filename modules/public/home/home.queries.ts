import "server-only";

import { cache } from "react";
import { prisma } from "@/common/lib/db";
import type { SystemStats } from "./home.schema";

export const getHomePageData = cache(async (): Promise<{ stats: SystemStats }> => {
  try {
    const [
      totalUsers,
      totalRoles,
      totalFeatures,
      totalItems,
      totalAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.feature.count(),
      prisma.item.count(),
      prisma.auditLog.count(),
    ]);

    return {
      stats: {
        totalUsers,
        totalRoles,
        totalFeatures,
        totalItems,
        totalAuditLogs,
      },
    };
  } catch (error) {
    console.error("Gagal membaca metrik live sistem:", error);
    return {
      stats: {
        totalUsers: 1,
        totalRoles: 2,
        totalFeatures: 7,
        totalItems: 2,
        totalAuditLogs: 1,
      },
    };
  }
});
