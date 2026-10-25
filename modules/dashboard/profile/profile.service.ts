// src/modules/dashboard/profile/profile.service.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import { AppError, errorCode } from "@/common/utils/errors";
import { deleteAvatarFile } from "@/modules/dashboard/user/user.service";
import type { ProfileUpdateInput } from "./profile.schema";

export async function updateProfile(
  userUuid: string,
  input: ProfileUpdateInput
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { uuid: userUuid },
        select: {
          email: true,
          photo: true,
        },
      });

      if (!current) {
        throw new AppError("User tidak ditemukan");
      }

      const taken = await tx.user.findFirst({
        where: { email: input.email, uuid: { not: userUuid } },
        select: { uuid: true },
      });
      if (taken) {
        throw new AppError("Email sudah digunakan oleh akun lain", "email");
      }

      // Hapus foto lama jika foto diganti atau dihapus
      if (input.photo !== current.photo && current.photo) {
        await deleteAvatarFile(current.photo);
      }

      const emailChanged = input.email !== current.email;

      // Jika email berubah, cabut sesi di perangkat lain demi keamanan
      if (emailChanged) {
        await tx.userSession.deleteMany({ where: { userUuid } });
      }

      await tx.user.update({
        where: { uuid: userUuid },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          gender: input.gender ?? null,
          photo: input.photo ?? null,
          ...(emailChanged ? { sessionVersion: { increment: 1 } } : {}),
        },
      });

      return {
        emailChanged,
      };
    });
  } catch (e) {
    if (errorCode(e) === "P2002") {
      throw new AppError("Email sudah digunakan oleh akun lain", "email");
    }
    throw e;
  }
}
