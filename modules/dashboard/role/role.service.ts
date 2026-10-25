// src/modules/role/role.service.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { AppError, errorCode } from "@/common/utils/errors";
import { PROTECTED_ROLE_NAMES } from "@/common/constants/rbac.constant";
import type { RoleInput } from "./role.schema";

type Db = Pick<Prisma.TransactionClient, "role">;

// Nama unik tanpa membedakan huruf besar/kecil
async function assertNameAvailable(db: Db, name: string, excludeUuidd?: string) {
  const exists = await db.role.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeUuidd ? { uuid: { not: excludeUuidd } } : {}),
    },
    select: { uuid: true },
  });
  if (exists) throw new AppError("Nama role sudah dipakai", "name");
}

export async function createRole(input: RoleInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      await assertNameAvailable(tx, input.name);

      const features = await tx.feature.findMany({ select: { uuid: true } });

      // permission otomatis untuk semua feature, default semua false
      const role = await tx.role.create({
        data: {
          name: input.name,
          desc: input.desc,
          permissions: { create: features.map((f) => ({ featureUuid: f.uuid })) },
        },
        select: { uuid: true },
      });

      return { id: role.uuid, featuresCount: features.length };
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Nama role sudah dipakai", "name");
    throw e;
  }
}

export async function updateRole(uuid: string, input: RoleInput) {
  const role = await prisma.role.findUnique({
    where: { uuid },
    select: { name: true },
  });
  if (!role) throw new AppError("Role tidak ditemukan");

  if (PROTECTED_ROLE_NAMES.includes(role.name) && input.name !== role.name) {
    throw new AppError("Nama role bawaan sistem tidak dapat diubah", "name");
  }

  await assertNameAvailable(prisma, input.name, uuid);

  try {
    await prisma.role.update({
      where: { uuid },
      data: { name: input.name, desc: input.desc },
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Nama role sudah dipakai", "name");
    throw e;
  }
}

export async function deleteRole(uuid: string) {
  const role = await prisma.role.findUnique({
    where: { uuid },
    select: { name: true, _count: { select: { users: true } } },
  });
  if (!role) throw new AppError("Role tidak ditemukan");

  if (PROTECTED_ROLE_NAMES.includes(role.name)) {
    throw new AppError(
      `Role ${role.name} adalah role bawaan sistem dan tidak boleh dihapus`
    );
  }
  if (role._count.users > 0) {
    throw new AppError(
      `Role masih dipakai oleh ${role._count.users} user. Pindahkan user ke role lain terlebih dahulu.`
    );
  }

  try {
    // role_permissions ikut terhapus oleh onDelete: Cascade
    await prisma.role.delete({ where: { uuid } });
    return { name: role.name };
  } catch (e) {
    // user baru saja dipasangkan ke role ini di antara pengecekan dan penghapusan
    if (errorCode(e) === "P2003") {
      throw new AppError(
        "Role baru saja dipakai oleh user, tidak bisa dihapus"
      );
    }
    throw e;
  }
}
