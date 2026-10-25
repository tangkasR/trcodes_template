// src/modules/dashboard/profile/profile.schema.ts
import { z } from "zod";
import { genderSchema, type Gender } from "@/modules/dashboard/user/user.schema";

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

export const profileUpdateSchema = z.object({
  name,
  email,
  phone,
  gender,
  photo,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export type UserProfileData = {
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  gender: Gender | null;
  photo: string | null;
  roleName: string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
};
