// src/modules/role-permission/role-permission.service.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import { AppError } from "@/common/utils/errors";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import { actionsToFlags } from "@/common/utils/rbac";
import { getPermissionMap } from "@/common/lib/auth";
import type { PermissionEntryInput } from "./role-permission.schema";

export type PermissionActor = {
  userUuid: string;
  roleUuid: string;
  roleName: string;
  isSuperAdmin: boolean;
};

export async function saveRolePermissions(
  actor: PermissionActor,
  roleUuid: string,
  entries: PermissionEntryInput[]
) {
  // Non-Super Admin tidak boleh memberi aksi yang dia sendiri tidak punya.
  // Ini mencegah eskalasi lewat role lain yang nanti dipasang ke akun baru.
  const actorPermissions = actor.isSuperAdmin
    ? null
    : await getPermissionMap(actor.roleUuid);

  return prisma.$transaction(async (tx) => {
    const role = await tx.role.findUnique({
      where: { uuid: roleUuid },
      select: { uuid: true, name: true },
    });
    if (!role) throw new AppError("Role tidak ditemukan");

    if (role.name === ROLE_SUPER_ADMIN && !actor.isSuperAdmin) {
      throw new AppError(
        "Hanya Super Admin yang dapat mengubah hak akses role Super Admin"
      );
    }
    if (role.uuid === actor.roleUuid && !actor.isSuperAdmin) {
      throw new AppError(
        "Kamu tidak dapat mengubah hak akses role yang sedang kamu pakai"
      );
    }

    const features = await tx.feature.findMany({
      select: {
        uuid: true,
        key: true,
        name: true,
        availableActions: true,
      },
    });
    const featureByUuid = new Map(features.map((f) => [f.uuid, f]));

    // validasi di server: aksi harus ada di availableActions feature
    for (const entry of entries) {
      const feature = featureByUuid.get(entry.featureUuid);
      if (!feature) {
        throw new AppError(
          "Ada feature yang sudah tidak ada. Muat ulang halaman lalu coba lagi."
        );
      }

      const invalid = entry.actions.filter(
        (a) => !feature.availableActions.includes(a)
      );
      if (invalid.length > 0) {
        throw new AppError(
          `Aksi ${invalid.join(", ")} tidak tersedia pada feature "${
            feature.name
          }". Muat ulang halaman lalu coba lagi.`
        );
      }

      if (actorPermissions) {
        const allowed = actorPermissions[feature.key] ?? [];
        const notAllowed = entry.actions.filter((a) => !allowed.includes(a));
        if (notAllowed.length > 0) {
          throw new AppError(
            `Kamu tidak dapat memberikan aksi ${notAllowed.join(", ")} pada "${
              feature.name
            }" karena kamu sendiri tidak memilikinya.`
          );
        }
      }
    }

    // lengkapi baris yang kurang (default semua false), tanpa menimpa yang sudah ada
    await tx.rolePermission.createMany({
      data: features.map((f) => ({ roleUuid, featureUuid: f.uuid })),
      skipDuplicates: true,
    });

    for (const entry of entries) {
      await tx.rolePermission.update({
        where: {
          roleUuid_featureUuid: { roleUuid, featureUuid: entry.featureUuid },
        },
        data: actionsToFlags(entry.actions),
      });
    }

    return { updated: entries.length, roleName: role.name };
  });
}
