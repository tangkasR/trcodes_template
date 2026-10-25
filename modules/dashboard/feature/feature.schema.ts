// src/modules/feature/feature.schema.ts
import { z } from "zod";
import { ACTIONS, type Action } from "@/common/constants/rbac.constant";

const actionsSchema = z
  .array(z.enum(ACTIONS))
  .min(1, "Pilih minimal 1 aksi")
  .transform((arr) => ACTIONS.filter((a) => arr.includes(a))); // urutan kanonis, tanpa duplikat

const base = z.object({
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
  availableActions: actionsSchema,
});

export const featureCreateSchema = base.extend({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Key minimal 2 karakter")
    .max(100, "Key maksimal 100 karakter")
    .regex(
      /^[a-z][a-z0-9-]*$/,
      "Key hanya huruf kecil, angka, dan tanda hubung, diawali huruf"
    ),
});

export const featureUpdateSchema = base;

export type FeatureCreateInput = z.output<typeof featureCreateSchema>;
export type FeatureUpdateInput = z.output<typeof featureUpdateSchema>;

// Bentuk yang dikirim ke form (sebelum transformasi)
export type FeatureFormInput = {
  key: string;
  name: string;
  desc: string;
  availableActions: Action[];
};

// Baris yang ditampilkan di tabel
export type FeatureRow = {
  uuid: string;
  key: string;
  name: string;
  desc: string | null;
  availableActions: Action[];
  updatedAt: Date;
  isSystem: boolean;
};
