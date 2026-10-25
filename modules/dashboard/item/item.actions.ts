"use server";

import { revalidatePath } from "next/cache";
import { handleAction } from "@/common/utils/handle-action";
import { requirePermission } from "@/common/lib/auth";
import { parseInput, uuidSchema } from "@/common/utils/zod";
import { itemSchema } from "./item.schema";
import {
  createItem,
  deleteItem,
  updateItem,
} from "./item.service";

function refresh() {
  revalidatePath("/dashboard/items");
}

export async function createItemAction(input: unknown) {
  return handleAction(async () => {
    await requirePermission("item", "add");
    const data = parseInput(itemSchema, input);
    const result = await createItem(data);
    refresh();
    return result;
  }, "Data Item berhasil ditambahkan");
}

export async function updateItemAction(id: string, input: unknown) {
  return handleAction(async () => {
    await requirePermission("item", "edit");
    const uuid = parseInput(uuidSchema, id);
    const data = parseInput(itemSchema, input);
    await updateItem(uuid, data);
    refresh();
  }, "Data Item berhasil diperbarui");
}

export async function deleteItemAction(id: string) {
  return handleAction(async () => {
    await requirePermission("item", "delete");
    const uuid = parseInput(uuidSchema, id);
    await deleteItem(uuid);
    refresh();
  }, "Data Item berhasil dihapus");
}
