// src/modules/user/user.service.ts
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/common/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { AppError, errorCode } from "@/common/utils/errors";
import { ROLE_SUPER_ADMIN } from "@/common/constants/rbac.constant";
import type { UserCreateInput, UserUpdateInput } from "./user.schema";

const COST = 12; // samakan dengan auth.service
const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export async function saveAvatarFile(file: File): Promise<string> {
  if (file.size > MAX_AVATAR_SIZE) {
    throw new AppError("Ukuran foto maksimal 2MB", "photo");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 8) {
    throw new AppError("Format berkas foto tidak valid", "photo");
  }

  // Magic bytes verification
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    throw new AppError(
      "Format gambar harus berupa JPEG, PNG, atau WebP",
      "photo"
    );
  }

  let ext = "jpg";
  if (isPng) ext = "png";
  else if (isWebp) ext = "webp";

  const filename = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  await fs.writeFile(path.join(AVATAR_DIR, filename), Buffer.from(bytes));

  return `/uploads/avatars/${filename}`;
}

export async function deleteAvatarFile(photoPath?: string | null) {
  if (!photoPath || !photoPath.startsWith("/uploads/avatars/")) return;
  const basename = path.basename(photoPath);
  const target = path.join(AVATAR_DIR, basename);
  try {
    await fs.unlink(target);
  } catch {
    // Abaikan jika berkas sudah tidak ada
  }
}

// Siapa yang melakukan aksi (diisi oleh action dari session)
export type Actor = { userUuid: string; isSuperAdmin: boolean };

async function countSuperAdmins(tx: Prisma.TransactionClient) {
  return tx.user.count({ where: { role: { name: ROLE_SUPER_ADMIN } } });
}

export async function createUser(actor: Actor, input: UserCreateInput) {
  const role = await prisma.role.findUnique({
    where: { uuid: input.roleUuid },
    select: { name: true },
  });
  if (!role) throw new AppError("Role tidak ditemukan", "roleUuid");

  if (role.name === ROLE_SUPER_ADMIN && !actor.isSuperAdmin) {
    throw new AppError(
      "Hanya Super Admin yang dapat memberikan role Super Admin",
      "roleUuid"
    );
  }

  const exists = await prisma.user.findUnique({
    where: { email: input.email },
    select: { uuid: true },
  });
  if (exists) throw new AppError("Email sudah terdaftar", "email");

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        roleUuid: input.roleUuid,
        phone: input.phone ?? null,
        gender: input.gender ?? null,
        photo: input.photo ?? null,
        isActive: input.isActive ?? true,
        password: await bcrypt.hash(input.password, COST),
      },
      select: { uuid: true },
    });
    return { uuid: user.uuid };
  } catch (e) {
    // dua request bersamaan dengan email sama: ditolak oleh unique constraint
    if (errorCode(e) === "P2002")
      throw new AppError("Email sudah terdaftar", "email");
    throw e;
  }
}

export async function updateUser(
  actor: Actor,
  uuid: string,
  input: UserUpdateInput
) {
  // hash dihitung di luar transaksi supaya transaksi tidak menahan koneksi selama bcrypt berjalan
  const passwordHash = input.password
    ? await bcrypt.hash(input.password, COST)
    : undefined;

  try {
    return await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { uuid },
        select: {
          email: true,
          photo: true,
          isActive: true,
          roleUuid: true,
          role: { select: { name: true } },
        },
      });
      if (!target) throw new AppError("User tidak ditemukan");

      const targetIsSuperAdmin = target.role.name === ROLE_SUPER_ADMIN;
      if (targetIsSuperAdmin && !actor.isSuperAdmin) {
        throw new AppError(
          "Hanya Super Admin yang dapat mengubah akun Super Admin"
        );
      }

      // Proteksi penonaktifan akun sendiri atau Super Admin terakhir
      if (input.isActive === false && target.isActive) {
        if (uuid === actor.userUuid) {
          throw new AppError(
            "Kamu tidak dapat menonaktifkan akunmu sendiri",
            "isActive"
          );
        }
        if (targetIsSuperAdmin && (await countSuperAdmins(tx)) <= 1) {
          throw new AppError(
            "Tidak dapat menonaktifkan Super Admin terakhir",
            "isActive"
          );
        }
      }

      const newRole = await tx.role.findUnique({
        where: { uuid: input.roleUuid },
        select: { uuid: true, name: true },
      });
      if (!newRole) throw new AppError("Role tidak ditemukan", "roleUuid");

      if (newRole.uuid !== target.roleUuid) {
        if (uuid === actor.userUuid) {
          throw new AppError(
            "Kamu tidak dapat mengubah role akunmu sendiri",
            "roleUuid"
          );
        }
        if (newRole.name === ROLE_SUPER_ADMIN && !actor.isSuperAdmin) {
          throw new AppError(
            "Hanya Super Admin yang dapat memberikan role Super Admin",
            "roleUuid"
          );
        }
        // menurunkan Super Admin: pastikan masih ada Super Admin lain
        if (targetIsSuperAdmin && (await countSuperAdmins(tx)) <= 1) {
          throw new AppError(
            "Tidak dapat mengubah role Super Admin terakhir",
            "roleUuid"
          );
        }
      }

      const taken = await tx.user.findFirst({
        where: { email: input.email, uuid: { not: uuid } },
        select: { uuid: true },
      });
      if (taken) throw new AppError("Email sudah terdaftar", "email");

      // Ganti password, role, email, atau penonaktifan mencabut semua sesi user tersebut
      const statusChangedToInactive =
        input.isActive === false && target.isActive;
      const revokeSessions =
        Boolean(passwordHash) ||
        input.roleUuid !== target.roleUuid ||
        input.email !== target.email ||
        statusChangedToInactive;

      if (revokeSessions) {
        await tx.userSession.deleteMany({ where: { userUuid: uuid } });
      }

      // Hapus avatar lama dari disk jika diganti atau dihapus
      if (input.photo !== target.photo && target.photo) {
        await deleteAvatarFile(target.photo);
      }

      await tx.user.update({
        where: { uuid },
        data: {
          name: input.name,
          email: input.email,
          roleUuid: input.roleUuid,
          phone: input.phone ?? null,
          gender: input.gender ?? null,
          photo: input.photo ?? null,
          isActive: input.isActive ?? true,
          ...(revokeSessions
            ? { sessionVersion: { increment: 1 } }
            : {}),
          ...(passwordHash ? { password: passwordHash } : {}),
        },
      });

      return {
        passwordChanged: Boolean(passwordHash),
        roleChanged: input.roleUuid !== target.roleUuid,
        emailChanged: input.email !== target.email,
        statusChanged: input.isActive !== target.isActive,
      };
    });
  } catch (e) {
    if (errorCode(e) === "P2002")
      throw new AppError("Email sudah terdaftar", "email");
    throw e;
  }
}

export async function deleteUser(actor: Actor, uuid: string) {
  if (uuid === actor.userUuid) {
    throw new AppError("Kamu tidak dapat menghapus akunmu sendiri");
  }

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { uuid },
      select: {
        name: true,
        email: true,
        photo: true,
        role: { select: { name: true } },
      },
    });
    if (!target) throw new AppError("User tidak ditemukan");

    if (target.role.name === ROLE_SUPER_ADMIN) {
      if (!actor.isSuperAdmin) {
        throw new AppError(
          "Hanya Super Admin yang dapat menghapus akun Super Admin"
        );
      }
      if ((await countSuperAdmins(tx)) <= 1) {
        throw new AppError("Super Admin terakhir tidak dapat dihapus");
      }
    }

    if (target.photo) {
      await deleteAvatarFile(target.photo);
    }

    await tx.user.delete({ where: { uuid } });
    return { name: target.name, email: target.email };
  });
}
