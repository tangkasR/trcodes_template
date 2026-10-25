// src/modules/role/role.schema.ts
import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  desc: z
    .string()
    .trim()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type RoleInput = z.output<typeof roleSchema>;

// Bentuk yang dikirim dari form
export type RoleFormInput = { name: string; desc: string };

// Baris yang ditampilkan di tabel
export type RoleRow = {
  uuid: string;
  name: string;
  desc: string | null;
  userCount: number;
  updatedAt: Date;
  isProtected: boolean;
};
