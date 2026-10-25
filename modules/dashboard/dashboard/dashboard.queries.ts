import "server-only";
import { prisma } from "@/common/lib/db";

export type DashboardStats = {
  users: {
    total: number;
  };
  roles: {
    total: number;
  };
  items: {
    total: number;
    active: number;
  };
  auditLogsCount: number;
  recentAudits: Array<{
    uuid: string;
    action: string;
    actorName: string | null;
    targetType: string | null;
    detail: string | null;
    createdAt: Date;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    usersCount,
    rolesCount,
    totalItems,
    activeItems,
    auditLogsCount,
    recentAudits,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.role.count(),
    prisma.item.count(),
    prisma.item.count({ where: { isActive: true } }),
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        uuid: true,
        action: true,
        actorName: true,
        targetType: true,
        detail: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users: {
      total: usersCount,
    },
    roles: {
      total: rolesCount,
    },
    items: {
      total: totalItems,
      active: activeItems,
    },
    auditLogsCount,
    recentAudits,
  };
}
