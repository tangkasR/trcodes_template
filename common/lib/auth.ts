import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/common/lib/db";
import {
  ACTIONS,
  ACTION_COLUMN,
  type Action,
  type FeatureKey,
  type PermissionMap,
} from "@/common/constants/rbac.constant";
import {
  MFA_CHALLENGE_COOKIE,
  MFA_CHALLENGE_MAX_AGE_SECONDS,
  MFA_SETUP_COOKIE,
  MFA_SETUP_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/common/constants/auth.constant";
import { ForbiddenError, UnauthorizedError } from "@/common/utils/errors";
import { assertRateLimit } from "@/common/lib/rate-limit";
import { getRequestMeta } from "@/common/utils/request-ip";
import type { Session } from "@/modules/public/auth/auth.schema";

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

const DURATION_SEC = SESSION_MAX_AGE_SECONDS;
const MFA_CHALLENGE_TTL_SEC = MFA_CHALLENGE_MAX_AGE_SECONDS;
const MFA_SETUP_TTL_SEC = MFA_SETUP_MAX_AGE_SECONDS;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi, minimal 32 karakter");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(
  userUuid: string,
  sessionVersion: number
) {
  const exp = Math.floor(Date.now() / 1000) + DURATION_SEC;
  const expiresAt = new Date(exp * 1000);
  const meta = await getRequestMeta();

  // Bersihkan sesi kedaluwarsa milik user ini sebelum membuat sesi baru.
  await prisma.userSession.deleteMany({
    where: { userUuid, expiresAt: { lt: new Date() } },
  });

  const session = await prisma.userSession.create({
    data: {
      userUuid,
      ip: meta.ip === "unknown" ? null : meta.ip,
      userAgent: meta.userAgent,
      expiresAt,
    },
    select: { uuid: true },
  });

  const token = await new SignJWT({
    ver: sessionVersion,
    sid: session.uuid,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userUuid)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(sessionUuid?: string) {
  if (sessionUuid) {
    await prisma.userSession.deleteMany({ where: { uuid: sessionUuid } });
  } else {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, getKey(), {
          algorithms: ["HS256"],
        });
        if (typeof payload.sid === "string") {
          await prisma.userSession.deleteMany({
            where: { uuid: payload.sid },
          });
        }
      } catch {
        // cookie rusak: cukup hapus cookienya
      }
    }
  }

  (await cookies()).delete(SESSION_COOKIE);
}

import { connection } from "next/server";

// cache(): dalam satu request, query user hanya dijalankan sekali
export const getSession = cache(async (): Promise<Session | null> => {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.sid !== "string") return null;

    const row = await prisma.userSession.findUnique({
      where: { uuid: payload.sid },
      select: {
        userUuid: true,
        expiresAt: true,
        lastSeenAt: true,
        user: {
          select: {
            uuid: true,
            name: true,
            email: true,
            roleUuid: true,
            photo: true,
            isActive: true,
            sessionVersion: true,
            mfaEnabled: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    // Sesi bisa dicabut per perangkat, kedaluwarsa, atau milik user lain.
    if (
      !row ||
      row.userUuid !== payload.sub ||
      row.expiresAt <= new Date()
    ) {
      return null;
    }

    const user = row.user;

    // Jika akun dinonaktifkan oleh administrator, sesi langsung tidak sah.
    if (!user.isActive) {
      return null;
    }

    // Token lama tanpa versi, atau versi yang sudah dicabut, dianggap tidak sah.
    if (
      typeof payload.ver !== "number" ||
      payload.ver !== user.sessionVersion
    ) {
      return null;
    }

    // Hindari write di setiap request: perbarui lastSeen maksimal 5 menit sekali.
    if (Date.now() - row.lastSeenAt.getTime() > 5 * 60 * 1000) {
      await prisma.userSession.updateMany({
        where: { uuid: payload.sid },
        data: { lastSeenAt: new Date() },
      });
    }

    return {
      userUuid: user.uuid,
      sessionUuid: payload.sid,
      name: user.name,
      email: user.email,
      photo: user.photo,
      roleUuid: user.roleUuid,
      roleName: user.role.name,
      sessionVersion: user.sessionVersion,
      mfaEnabled: user.mfaEnabled,
    };
  } catch {
    return null; // token rusak, kedaluwarsa, atau tanda tangan salah
  }
});

/* -------------------------------------------------------------------------- */
/* MFA challenge/setup cookies                                                */
/* -------------------------------------------------------------------------- */

type MfaChallenge = {
  userUuid: string;
  sessionVersion: number;
  email: string;
};

type MfaSetupTicket = {
  userUuid: string;
  encryptedSecret: string;
};

const mfaCookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  expires,
  path: "/",
});

export async function createMfaChallenge(
  userUuid: string,
  sessionVersion: number,
  email: string
) {
  const exp = Math.floor(Date.now() / 1000) + MFA_CHALLENGE_TTL_SEC;
  const token = await new SignJWT({ ver: sessionVersion, email, purpose: "mfa" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userUuid)
    .setAudience("mfa-challenge")
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getKey());

  (await cookies()).set(
    MFA_CHALLENGE_COOKIE,
    token,
    mfaCookieOptions(new Date(exp * 1000))
  );
}

export async function readMfaChallenge(): Promise<MfaChallenge | null> {
  await connection();
  const token = (await cookies()).get(MFA_CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      audience: "mfa-challenge",
    });
    if (
      !payload.sub ||
      payload.purpose !== "mfa" ||
      typeof payload.ver !== "number" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    return {
      userUuid: payload.sub,
      sessionVersion: payload.ver,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function clearMfaChallenge() {
  (await cookies()).delete(MFA_CHALLENGE_COOKIE);
}

export async function createMfaSetupTicket(
  userUuid: string,
  encryptedSecret: string
) {
  const exp = Math.floor(Date.now() / 1000) + MFA_SETUP_TTL_SEC;
  const token = await new SignJWT({
    secret: encryptedSecret,
    purpose: "mfa-setup",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userUuid)
    .setAudience("mfa-setup")
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getKey());

  (await cookies()).set(
    MFA_SETUP_COOKIE,
    token,
    mfaCookieOptions(new Date(exp * 1000))
  );
}

export async function readMfaSetupTicket(): Promise<MfaSetupTicket | null> {
  await connection();
  const token = (await cookies()).get(MFA_SETUP_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      audience: "mfa-setup",
    });
    if (
      !payload.sub ||
      payload.purpose !== "mfa-setup" ||
      typeof payload.secret !== "string"
    ) {
      return null;
    }

    return { userUuid: payload.sub, encryptedSecret: payload.secret };
  } catch {
    return null;
  }
}

export async function clearMfaSetupTicket() {
  (await cookies()).delete(MFA_SETUP_COOKIE);
}

/* -------------------------------------------------------------------------- */
/* Permission                                                                 */
/* -------------------------------------------------------------------------- */

// Satu role → satu query. cache(): dalam satu request tidak query berulang.
// Untuk Server Action tanpa feature gate (mis. pengaturan keamanan akun)
export async function requireSession() {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export const getPermissionMap = cache(
  async (roleUuid: string): Promise<PermissionMap> => {
    const rows = await prisma.rolePermission.findMany({
      where: { roleUuid },
      select: {
        isRead: true,
        isAdd: true,
        isEdit: true,
        isDelete: true,
        feature: { select: { key: true, availableActions: true } },
      },
    });

    const map: PermissionMap = {};
    for (const row of rows) {
      map[row.feature.key] = ACTIONS.filter(
        (a) => row[ACTION_COLUMN[a]] && row.feature.availableActions.includes(a)
      );
    }
    return map;
  }
);

function isSuperAdminMfaEnforced(): boolean {
  return process.env.ENFORCE_SUPER_ADMIN_MFA === "true";
}

// Untuk Server Action dan Route Handler: melempar error kalau tidak berhak
export async function requirePermission(feature: FeatureKey, action: Action) {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();

  if (
    isSuperAdminMfaEnforced() &&
    session.roleName === "Super Admin" &&
    !session.mfaEnabled
  ) {
    throw new ForbiddenError(
      "Akses dibatasi: Super Admin wajib mengaktifkan MFA terlebih dahulu di pengaturan keamanan."
    );
  }

  const map = await getPermissionMap(session.roleUuid);
  if (!map[feature]?.includes(action)) throw new ForbiddenError();

  await assertRateLimit(
    `permission:${session.userUuid}:${feature}:${action}`,
    action === "read" ? 120 : 30,
    60_000
  );

  return session;
}

// Untuk page.tsx: mengarahkan ke halaman yang sesuai kalau tidak berhak
export async function requirePageAccess(
  feature: FeatureKey,
  action: Action = "read"
) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (
    isSuperAdminMfaEnforced() &&
    session.roleName === "Super Admin" &&
    !session.mfaEnabled
  ) {
    redirect("/dashboard/security?setup_required=1");
  }

  const map = await getPermissionMap(session.roleUuid);
  if (!map[feature]?.includes(action)) redirect("/forbidden");

  return session;
}
