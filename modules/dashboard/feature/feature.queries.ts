// src/modules/feature/feature.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { ACTIONS, SYSTEM_FEATURE_KEYS, type Action } from "@/common/constants/rbac.constant";
import type { ListParams } from "@/common/utils/zod";
import type { FeatureRow } from "./feature.schema";

export async function getFeatures({ page, limit, q }: ListParams) {
  const where: Prisma.FeatureWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { key: { contains: q, mode: "insensitive" } },
          { desc: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  // dua query dalam satu round-trip
  const [rows, total] = await prisma.$transaction([
    prisma.feature.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "asc" }, { uuid: "asc" }], // urutan stabil
      select: {
        uuid: true,
        key: true,
        name: true,
        desc: true,
        availableActions: true,
        updatedAt: true,
      },
    }),
    prisma.feature.count({ where }),
  ]);

  const items: FeatureRow[] = rows.map((r) => ({
    ...r,
    availableActions: ACTIONS.filter((a) =>
      r.availableActions.includes(a)
    ) as Action[],
    isSystem: SYSTEM_FEATURE_KEYS.includes(r.key),
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
