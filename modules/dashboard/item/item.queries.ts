import "server-only";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import type { ItemRow } from "./item.schema";

export type GetItemParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "sortOrder" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type ItemListResult = {
  data: ItemRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getItemList(
  params: GetItemParams = {}
): Promise<ItemListResult> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 10));
  const skip = (page - 1) * pageSize;
  const search = params.search?.trim();

  const where: Prisma.ItemWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy: Prisma.ItemOrderByWithRelationInput = params.sortBy
    ? { [params.sortBy]: params.sortOrder || "desc" }
    : { sortOrder: "asc" };

  const [total, data] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  return {
    data: data as ItemRow[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
