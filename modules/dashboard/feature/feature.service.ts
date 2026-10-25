// src/modules/feature/feature.service.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import { AppError } from "@/common/utils/errors";
import {
  ACTIONS,
  ROLE_SUPER_ADMIN,
  SYSTEM_FEATURE_KEYS,
  type Action,
} from "@/common/constants/rbac.constant";
import { actionsToColumns } from "@/common/utils/rbac";
import type { FeatureCreateInput, FeatureUpdateInput } from "./feature.schema";

function isUniqueViolation(e: unknown) {
  return (
    typeof e === "object" && e !== null && "code" in e && e.code === "P2002"
  );
}

export async function createFeature(input: FeatureCreateInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const roles = await tx.role.findMany({
        select: { uuid: true, name: true },
      });

      const feature = await tx.feature.create({
        data: {
          key: input.key,
          name: input.name,
          desc: input.desc,
          availableActions: input.availableActions,
        },
        select: { uuid: true, key: true },
      });

      // permission otomatis untuk semua role: default semua false,
      // kecuali Super Admin yang langsung menyala untuk semua aksi yang tersedia
      await tx.rolePermission.createMany({
        data: roles.map((role) => ({
          roleUuid: role.uuid,
          featureUuid: feature.uuid,
          ...(role.name === ROLE_SUPER_ADMIN
            ? actionsToColumns(input.availableActions, true)
            : {}),
        })),
        skipDuplicates: true,
      });

      return { id: feature.uuid, rolesAffected: roles.length };
    });
  } catch (e) {
    if (isUniqueViolation(e))
      throw new AppError("Key sudah dipakai feature lain", "key");
    throw e;
  }
}

export async function updateFeature(uuid: string, input: FeatureUpdateInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.feature.findUnique({
      where: { uuid },
      select: { availableActions: true },
    });
    if (!current) throw new AppError("Feature tidak ditemukan");

    const before = ACTIONS.filter((a) => current.availableActions.includes(a));
    const after = input.availableActions;
    const removed: Action[] = before.filter((a) => !after.includes(a));
    const added: Action[] = after.filter((a) => !before.includes(a));

    await tx.feature.update({
      where: { uuid },
      data: { name: input.name, desc: input.desc, availableActions: after },
    });

    // aksi dicabut → permission aksi itu jadi false di SEMUA role
    if (removed.length > 0) {
      await tx.rolePermission.updateMany({
        where: { featureUuid: uuid },
        data: actionsToColumns(removed, false),
      });
    }

    // aksi ditambah → hanya Super Admin yang otomatis menyala,
    // role lain harus diaktifkan admin lewat matriks permission
    if (added.length > 0) {
      await tx.rolePermission.updateMany({
        where: { featureUuid: uuid, role: { name: ROLE_SUPER_ADMIN } },
        data: actionsToColumns(added, true),
      });
    }

    return { removed, added };
  });
}

export async function deleteFeature(uuid: string) {
  const feature = await prisma.feature.findUnique({
    where: { uuid },
    select: { key: true },
  });
  if (!feature) throw new AppError("Feature tidak ditemukan");

  if (SYSTEM_FEATURE_KEYS.includes(feature.key)) {
    throw new AppError("Feature bawaan sistem tidak boleh dihapus");
  }

  // role_permissions ikut terhapus oleh onDelete: Cascade di database
  await prisma.feature.delete({ where: { uuid } });
  return { key: feature.key };
}
