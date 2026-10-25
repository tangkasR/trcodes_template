// src/modules/role/role.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { requirePermission } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { parseInput, uuidSchema } from "@/common/utils/zod";

import { roleSchema } from "./role.schema";
import { createRole, deleteRole, updateRole } from "./role.service";

// Nama role tampil di header dan relasi di halaman user, jadi layout ikut direvalidasi
function refresh() {
  revalidatePath("/dashboard/roles");
  revalidatePath("/", "layout");
}

export async function createRoleAction(input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("role", "add");
    const data = parseInput(roleSchema, input);
    const result = await createRole(data);
    await recordAudit({
      actor: session,
      action: "role.create",
      targetType: "role",
      targetUuid: result.id,
      detail: `Membuat role ${data.name}`,
    });
    refresh();
    return result;
  }, "Peran berhasil dibuat");
}

export async function updateRoleAction(id: string, input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("role", "edit");
    const roleUuid = parseInput(uuidSchema, id);
    const data = parseInput(roleSchema, input);
    await updateRole(roleUuid, data);
    await recordAudit({
      actor: session,
      action: "role.update",
      targetType: "role",
      targetUuid: roleUuid,
      detail: `Memperbarui role ${data.name}`,
    });
    refresh();
  }, "Peran berhasil diperbarui");
}

export async function deleteRoleAction(id: string) {
  return handleAction(async () => {
    const session = await requirePermission("role", "delete");
    const roleUuid = parseInput(uuidSchema, id);
    const deleted = await deleteRole(roleUuid);
    await recordAudit({
      actor: session,
      action: "role.delete",
      targetType: "role",
      targetUuid: roleUuid,
      detail: `Menghapus role ${deleted.name}`,
    });
    refresh();
  }, "Peran berhasil dihapus");
}
