// src/modules/role-permission/role-permission.schema.ts
import { z } from "zod";
import { ACTIONS, type Action } from "@/common/constants/rbac.constant";
import { uuidSchema } from "@/common/utils/zod";

const entrySchema = z.object({
  featureUuid: uuidSchema,
  actions: z
    .array(z.enum(ACTIONS))
    .max(ACTIONS.length)
    .transform((arr) => ACTIONS.filter((a) => arr.includes(a))), // urutan kanonis, tanpa duplikat
});

export const savePermissionsSchema = z.object({
  entries: z
    .array(entrySchema)
    .min(1, "Tidak ada data untuk disimpan")
    .max(200)
    .refine(
      (list) => new Set(list.map((e) => e.featureUuid)).size === list.length,
      "Data feature duplikat"
    ),
});

export type SavePermissionsInput = z.output<typeof savePermissionsSchema>;
export type PermissionEntryInput = SavePermissionsInput["entries"][number];

// Satu baris matriks
export type MatrixFeature = {
  uuid: string;
  key: string;
  name: string;
  desc: string | null;
  availableActions: Action[]; // aksi yang boleh dicentang
  granted: Action[]; // aksi yang sedang aktif untuk role ini
};

export type PermissionMatrixData = {
  role: {
    uuid: string;
    name: string;
    desc: string | null;
    isSuperAdmin: boolean;
  };
  features: MatrixFeature[];
};
