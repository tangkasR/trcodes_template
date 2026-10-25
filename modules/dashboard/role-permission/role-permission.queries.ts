// src/modules/role-permission/role-permission.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import { ACTIONS, ACTION_COLUMN, ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import type { PermissionMatrixData } from "./role-permission.schema";

export async function getRolePermissionMatrix(
  roleUuid: string
): Promise<PermissionMatrixData | null> {
  const role = await prisma.role.findUnique({
    where: { uuid: roleUuid },
    select: { uuid: true, name: true, desc: true },
  });
  if (!role) return null;

  const [features, permissions] = await Promise.all([
    prisma.feature.findMany({
      orderBy: [{ createdAt: "asc" }, { uuid: "asc" }],
      select: {
        uuid: true,
        key: true,
        name: true,
        desc: true,
        availableActions: true,
      },
    }),
    prisma.rolePermission.findMany({
      where: { roleUuid },
      select: {
        featureUuid: true,
        isRead: true,
        isAdd: true,
        isEdit: true,
        isDelete: true,
      },
    }),
  ]);

  const byFeature = new Map(permissions.map((p) => [p.featureUuid, p]));

  return {
    role: { ...role, isSuperAdmin: role.name === ROLE_SUPER_ADMIN },
    features: features.map((f) => {
      const availableActions = ACTIONS.filter((a) =>
        f.availableActions.includes(a)
      );
      const row = byFeature.get(f.uuid); // undefined = baris belum ada → dianggap semua false

      return {
        uuid: f.uuid,
        key: f.key,
        name: f.name,
        desc: f.desc,
        availableActions,
        // hanya aksi yang tersedia yang dihitung aktif (sama dengan aturan di requirePermission)
        granted: availableActions.filter(
          (a) => row?.[ACTION_COLUMN[a]] === true
        ),
      };
    }),
  };
}
