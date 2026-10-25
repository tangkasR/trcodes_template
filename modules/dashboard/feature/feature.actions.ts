// src/modules/feature/feature.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { requirePermission } from "@/common/lib/auth";
import { recordAudit } from "@/common/lib/audit";
import { parseInput, uuidSchema } from "@/common/utils/zod";

import { featureCreateSchema, featureUpdateSchema } from "./feature.schema";
import { createFeature, deleteFeature, updateFeature } from "./feature.service";

// Perubahan feature memengaruhi tabel DAN peta izin di layout (sidebar)
function refresh() {
  revalidatePath("/dashboard/features");
  revalidatePath("/", "layout");
}

export async function createFeatureAction(input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("feature", "add"); // 1. izin
    const data = parseInput(featureCreateSchema, input); // 2. validasi
    const result = await createFeature(data); // 3. service
    await recordAudit({
      actor: session,
      action: "feature.create",
      targetType: "feature",
      targetUuid: result.id,
      detail: `Membuat feature ${data.key} (${data.availableActions.join(", ")})`,
    });
    refresh(); // 4. revalidate
    return result;
  }, "Fitur berhasil dibuat");
}

export async function updateFeatureAction(uuid: string, input: unknown) {
  return handleAction(async () => {
    const session = await requirePermission("feature", "edit");
    const featureUuid = parseInput(uuidSchema, uuid);
    const data = parseInput(featureUpdateSchema, input);
    const result = await updateFeature(featureUuid, data);
    await recordAudit({
      actor: session,
      action: "feature.update",
      targetType: "feature",
      targetUuid: featureUuid,
      detail: [
        `Memperbarui feature ${data.name}`,
        result.added.length ? `tambah: ${result.added.join(", ")}` : null,
        result.removed.length ? `hapus: ${result.removed.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("; "),
    });
    refresh();
    return result;
  }, "Fitur berhasil diperbarui");
}

export async function deleteFeatureAction(uuid: string) {
  return handleAction(async () => {
    const session = await requirePermission("feature", "delete");
    const featureUuid = parseInput(uuidSchema, uuid);
    const deleted = await deleteFeature(featureUuid);
    await recordAudit({
      actor: session,
      action: "feature.delete",
      targetType: "feature",
      targetUuid: featureUuid,
      detail: `Menghapus feature ${deleted.key}`,
    });
    refresh();
  }, "Fitur berhasil dihapus");
}
