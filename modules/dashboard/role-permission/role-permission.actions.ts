// src/modules/role-permission/role-permission.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { requirePermission } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import { parseInput, uuidSchema } from "@/common/utils/zod";

import { savePermissionsSchema } from "./role-permission.schema";
import { saveRolePermissions } from "./role-permission.service";

export async function saveRolePermissionsAction(
  roleUuid: string,
  input: unknown
) {
  return handleAction(async () => {
    const session = await requirePermission("role-permission", "edit"); // 1. izin
    const uuid = parseInput(uuidSchema, roleUuid); // 2. validasi
    const data = parseInput(savePermissionsSchema, input);
    const result = await saveRolePermissions(
      {
        userUuid: session.userUuid,
        roleUuid: session.roleUuid,
        roleName: session.roleName,
        isSuperAdmin: session.roleName === ROLE_SUPER_ADMIN,
      },
      uuid,
      data.entries
    ); // 3. service

    await recordAudit({
      actor: session,
      action: "role-permission.update",
      targetType: "role",
      targetUuid: uuid,
      detail: `${result.updated} feature diperbarui untuk role ${result.roleName}`,
    });

    revalidatePath(`/dashboard/roles/${uuid}`); // 4. revalidate
    revalidatePath("/", "layout"); // sidebar user yang memakai role ini ikut diperbarui
    return result;
  }, "Hak akses berhasil disimpan");
}
