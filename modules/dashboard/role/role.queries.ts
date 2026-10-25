// src/modules/role/role.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { PROTECTED_ROLE_NAMES } from "@/common/constants/rbac.constant";
import type { ListParams } from "@/common/utils/zod";
import type { RoleRow } from "./role.schema";

export async function getRoles({ page, limit, q }: ListParams) {
  const where: Prisma.RoleWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { desc: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.role.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "asc" }, { uuid: "asc" }], // urutan stabil
      select: {
        uuid: true,
        name: true,
        desc: true,
        updatedAt: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.role.count({ where }),
  ]);

  const items: RoleRow[] = rows.map((r) => ({
    uuid: r.uuid,
    name: r.name,
    desc: r.desc,
    updatedAt: r.updatedAt,
    userCount: r._count.users,
    isProtected: PROTECTED_ROLE_NAMES.includes(r.name),
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
