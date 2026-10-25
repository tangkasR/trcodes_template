// src/modules/auth/auth.schema.ts
import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Email tidak valid")
  .max(191, "Email terlalu panjang");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi"),
});

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Kode verifikasi minimal 6 karakter")
    .max(40, "Kode verifikasi terlalu panjang"),
});

export type MfaCodeInput = z.infer<typeof mfaCodeSchema>;



export type LoginInput = z.infer<typeof loginSchema>;

// Sesi yang dipakai lintas halaman dashboard dan pengecekan izin
export type Session = {
  userUuid: string;
  sessionUuid: string;
  name: string;
  email: string;
  photo?: string | null;
  roleUuid: string;
  roleName: string;
  sessionVersion: number;
  mfaEnabled: boolean;
};

// State yang dikembalikan Server Action ke form (useActionState)
export type AuthFormState =
  | {
      error?: string; // error umum, ditampilkan lewat SweetAlert2
      fieldErrors?: Record<string, string>; // error per input
      values?: { name?: string; email?: string }; // agar input tidak kosong lagi (password tidak pernah dikembalikan)
      redirectTo?: string;
    }
  | undefined;

export type MfaFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
      values?: { code?: string };
      redirectTo?: string;
    }
  | undefined;
