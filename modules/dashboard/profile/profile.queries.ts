// src/modules/dashboard/profile/profile.queries.ts
import "server-only";
import { prisma } from "@/common/lib/db";
import type { UserProfileData } from "./profile.schema";

export async function getProfile(userUuid: string): Promise<UserProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { uuid: userUuid },
    select: {
      uuid: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      photo: true,
      isActive: true,
      mfaEnabled: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  });

  if (!user) return null;

  return {
    uuid: user.uuid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    photo: user.photo,
    isActive: user.isActive,
    mfaEnabled: user.mfaEnabled,
    roleName: user.role.name,
    createdAt: user.createdAt,
  };
}
