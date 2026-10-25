// src/modules/dashboard/profile/profile.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { parseInput } from "@/common/utils/zod";
import { requireSession } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { AppError } from "@/common/utils/errors";
import { saveAvatarFile } from "@/modules/dashboard/user/user.service";
import { profileUpdateSchema } from "./profile.schema";
import { updateProfile } from "./profile.service";

function refresh() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
}

export async function uploadProfileAvatarAction(formData: FormData) {
  return handleAction(async () => {
    await requireSession();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new AppError("Berkas foto tidak ditemukan", "photo");
    }
    const url = await saveAvatarFile(file);
    return { url };
  }, "Foto profil berhasil diunggah");
}

export async function updateProfileAction(input: unknown) {
  return handleAction(async () => {
    const session = await requireSession();
    const data = parseInput(profileUpdateSchema, input);
    const result = await updateProfile(session.userUuid, data);

    await recordAudit({
      actor: session,
      action: "profile.update",
      targetType: "user",
      targetUuid: session.userUuid,
      detail: `Memperbarui profil akun (${data.email})`,
    });

    refresh();
    return result;
  }, "Profil berhasil diperbarui");
}
