import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const JWT_ISSUER = "my-template";
const JWT_AUDIENCE = "my-template-app";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari HttpOnly cookie
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    // 2. Verifikasi JWT dan ambil user ID dari sub
    let userId: number;

    try {
      const { payload } = await jwtVerify(token, getJwtSecret(), {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithms: ["HS256"],
      });

      const subject = payload.sub;

      if (
        !subject ||
        !/^[1-9]\d*$/.test(subject) ||
        !Number.isSafeInteger(Number(subject))
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid token subject.",
          },
          { status: 401 }
        );
      }

      userId = Number(subject);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    // 3. Ambil user, role, dan permissions dari database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            permissions: {
              select: {
                id: true,
                isRead: true,
                isAdd: true,
                isEdit: true,
                isDelete: true,
                feature: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    description: true,
                    availableActions: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 4. Validasi status user dan role
    if (!user || !user.isActive || !user.role.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "User or role is inactive or no longer exists.",
        },
        { status: 403 }
      );
    }

    // 5. Format permissions dan abaikan feature yang tidak aktif
    const permissions = user.role.permissions
      .filter((permission) => permission.feature.isActive)
      .map((permission) => ({
        id: permission.id,
        featureId: permission.feature.id,
        featureName: permission.feature.name,
        featureCode: permission.feature.code,
        description: permission.feature.description,
        availableActions: permission.feature.availableActions,
        isRead: permission.isRead,
        isAdd: permission.isAdd,
        isEdit: permission.isEdit,
        isDelete: permission.isDelete,
      }));

    // 6. Kirim data user yang sedang login
    return NextResponse.json(
      {
        success: true,
        message: "User data retrieved successfully.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
          },
          permissions,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Get current user API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
