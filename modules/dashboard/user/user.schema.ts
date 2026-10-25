// src/modules/user/user.schema.ts
import { z } from "zod";
import { uuidSchema } from "@/common/utils/zod";

export const genderSchema = z.enum(["MALE", "FEMALE"]);
export type Gender = z.infer<typeof genderSchema>;

const name = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama maksimal 100 karakter");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email tidak valid")
  .max(191, "Email terlalu panjang");

const roleUuid = z
  .string()
  .min(1, "Pilih role")
  .refine((v) => uuidSchema.safeParse(v).success, "Role tidak valid");

const phone = z
  .string()
  .trim()
  .max(30, "Nomor telepon maksimal 30 karakter")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

const gender = genderSchema.optional().nullable();

const photo = z
  .string()
  .trim()
  .max(255, "URL foto terlalu panjang")
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

const isActive = z.boolean().default(true);

export const userCreateSchema = z.object({
  name,
  email,
  roleUuid,
  phone,
  gender,
  photo,
  isActive,
  password: z
    .string()
    .min(12, "Password minimal 12 karakter")
    .max(72, "Password maksimal 72 karakter") // batas bcrypt
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

// Saat edit: kosong = password tidak diubah
export const userUpdateSchema = z.object({
  name,
  email,
  roleUuid,
  phone,
  gender,
  photo,
  isActive,
  password: z
    .string()
    .max(72, "Password maksimal 72 karakter")
    .optional()
    .refine((v) => !v || v.length >= 12, "Password minimal 12 karakter")
    .refine(
      (v) => !v || (/[A-Za-z]/.test(v) && /[0-9]/.test(v)),
      "Password harus mengandung huruf dan angka"
    )
    .transform((v) => (v ? v : undefined)),
});

export type UserCreateInput = z.output<typeof userCreateSchema>;
export type UserUpdateInput = z.output<typeof userUpdateSchema>;

// Bentuk yang dikirim dari form
export type UserFormInput = {
  name: string;
  email: string;
  password: string;
  roleUuid: string;
  phone?: string | null;
  gender?: Gender | null;
  photo?: string | null;
  isActive?: boolean;
};

// Baris yang ditampilkan di tabel (tanpa password)
export type UserRow = {
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  gender: Gender | null;
  photo: string | null;
  isActive: boolean;
  roleUuid: string;
  roleName: string;
  createdAt: Date;
  isSuperAdmin: boolean;
};

export type RoleOption = { uuid: string; name: string };
