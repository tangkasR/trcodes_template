// src/modules/user/user.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import { parseInput, uuidSchema } from "@/common/utils/zod";
import { requirePermission } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { AppError } from "@/common/utils/errors";

import { userCreateSchema, userUpdateSchema } from "./user.schema";
import {
  createUser,
  deleteUser,
  updateUser,
  saveAvatarFile,
  type Actor,
} from "./user.service";

// Jumlah user per role tampil di /roles, dan nama/foto user tampil di header
function refresh() {
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/profile");
  revalidatePath("/", "layout");
}

function toActor(session: { userUuid: string; roleName: string }): Actor {
  return {
    userUuid: session.userUuid,
    isSuperAdmin: session.roleName === ROLE_SUPER_ADMIN,
  };
}

export async function uploadUserAvatarAction(formData: FormData) {
  return handleAction(async () => {
    await requirePermission("user", "edit");
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new AppError("Berkas foto tidak ditemukan", "photo");
    }
    const url = await saveAvatarFile(file);
    return { url };
  }, "Foto berhasil diunggah");
}

export async function createUserAction(input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("user", "add"); // 1. izin
    const data = parseInput(userCreateSchema, input); // 2. validasi
    const result = await createUser(toActor(session), data); // 3. service
    await recordAudit({
      actor: session,
      action: "user.create",
      targetType: "user",
      targetUuid: result.uuid,
      detail: `Membuat user ${data.email} (${data.isActive ? "Aktif" : "Nonaktif"})`,
    });
    refresh(); // 4. revalidate
    return result;
  }, "Akun pengguna berhasil dibuat");
}

export async function updateUserAction(uuid: string, input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("user", "edit");
    const userUuid = parseInput(uuidSchema, uuid);
    const data = parseInput(userUpdateSchema, input);
    const changes = await updateUser(toActor(session), userUuid, data);
    await recordAudit({
      actor: session,
      action: "user.update",
      targetType: "user",
      targetUuid: userUuid,
      detail: [
        `Memperbarui user ${data.email}`,
        changes.passwordChanged ? "password diubah" : null,
        changes.roleChanged ? "role diubah" : null,
        changes.emailChanged ? "email diubah" : null,
        changes.statusChanged
          ? `status diubah ke ${data.isActive ? "Aktif" : "Nonaktif"}`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    });
    refresh();
  }, "Akun pengguna berhasil diperbarui");
}

export async function deleteUserAction(uuid: string) {
  return handleAction(async () => {
    const session = await requirePermission("user", "delete");
    const userUuid = parseInput(uuidSchema, uuid);
    const deleted = await deleteUser(toActor(session), userUuid);
    await recordAudit({
      actor: session,
      action: "user.delete",
      targetType: "user",
      targetUuid: userUuid,
      detail: `Menghapus user ${deleted.email}`,
    });
    refresh();
  }, "Akun pengguna berhasil dihapus");
}
