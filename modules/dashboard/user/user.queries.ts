// src/modules/user/user.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import type { ListParams } from "@/common/utils/zod";
import type { RoleOption, UserRow } from "./user.schema";

export async function getUsers({ page, limit, q }: ListParams) {
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { uuid: "desc" }], // urutan stabil
      select: {
        uuid: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        photo: true,
        isActive: true,
        roleUuid: true,
        createdAt: true,
        role: { select: { name: true } },
        // password sengaja tidak di-select: hash tidak boleh keluar dari server
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: UserRow[] = rows.map((r) => ({
    uuid: r.uuid,
    name: r.name,
    email: r.email,
    phone: r.phone,
    gender: r.gender,
    photo: r.photo,
    isActive: r.isActive,
    roleUuid: r.roleUuid,
    roleName: r.role.name,
    createdAt: r.createdAt,
    isSuperAdmin: r.role.name === ROLE_SUPER_ADMIN,
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

// Pilihan role di form. Role Super Admin hanya ditawarkan ke sesama Super Admin.
export async function getRoleOptions(
  includeSuperAdmin: boolean
): Promise<RoleOption[]> {
  return prisma.role.findMany({
    where: includeSuperAdmin ? {} : { name: { not: ROLE_SUPER_ADMIN } },
    orderBy: { name: "asc" },
    select: { uuid: true, name: true },
  });
}
