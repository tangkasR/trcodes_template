import { z } from "zod";

export const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(150, "Nama maksimal 150 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable()
    .or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ItemInput = z.output<typeof itemSchema>;

export type ItemFormInput = {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type ItemRow = {
  uuid: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
