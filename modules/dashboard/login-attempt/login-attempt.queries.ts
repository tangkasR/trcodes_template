// src/modules/login-attempt/login-attempt.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ListParams } from "@/common/utils/zod";
import type { LoginAttemptRow } from "./login-attempt.schema";

export async function getLoginAttempts({ page, limit, q }: ListParams) {
  const where: Prisma.LoginAttemptWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { ip: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.loginAttempt.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      select: {
        uuid: true,
        email: true,
        ip: true,
        createdAt: true,
      },
    }),
    prisma.loginAttempt.count({ where }),
  ]);

  const items: LoginAttemptRow[] = rows.map((r) => ({
    uuid: r.uuid,
    email: r.email,
    ip: r.ip,
    createdAt: r.createdAt,
  }));

  return { items, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
