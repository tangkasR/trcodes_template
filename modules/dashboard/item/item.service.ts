import "server-only";
import { prisma } from "@/common/lib/db";
import { recordAudit } from "@/common/lib/audit";
import { AppError, errorCode } from "@/common/utils/errors";
import type { ItemInput } from "./item.schema";

export async function createItem(input: ItemInput) {
  try {
    const row = await prisma.item.create({
      data: {
        name: input.name,
        description: input.description || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive,
      },
      select: { uuid: true, name: true },
    });

    await recordAudit({
      action: "item.create",
      targetType: "item",
      targetUuid: row.uuid,
      detail: `Menambahkan Data Item: ${row.name}`,
    });

    return row;
  } catch (e) {
    if (errorCode(e) === "P2002") {
      throw new AppError("Data dengan nama ini sudah terdaftar", "name");
    }
    throw e;
  }
}

export async function updateItem(uuid: string, input: ItemInput) {
  try {
    const row = await prisma.item.update({
      where: { uuid },
      data: {
        name: input.name,
        description: input.description || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive,
      },
      select: { uuid: true, name: true },
    });

    await recordAudit({
      action: "item.update",
      targetType: "item",
      targetUuid: row.uuid,
      detail: `Memperbarui Data Item: ${row.name}`,
    });

    return row;
  } catch (e) {
    if (errorCode(e) === "P2002") {
      throw new AppError("Data dengan nama ini sudah terdaftar", "name");
    }
    throw e;
  }
}

export async function deleteItem(uuid: string) {
  const existing = await prisma.item.findUnique({
    where: { uuid },
    select: { name: true },
  });

  await prisma.item.delete({ where: { uuid } });

  await recordAudit({
    action: "item.delete",
    targetType: "item",
    targetUuid: uuid,
    detail: `Menghapus Data Item: ${existing?.name ?? uuid}`,
  });

  return { success: true };
}
