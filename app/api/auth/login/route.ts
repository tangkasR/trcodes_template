import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes.");
  }

  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!email || !password || password.length > 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // 2. Cari user beserta role
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    // 3. Validasi email
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // 4. Validasi password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // 5. Periksa status user dan role
    if (!user.isActive || !user.role.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account or role is inactive.",
        },
        { status: 403 }
      );
    }

    // 6. Buat JWT dengan user ID saja
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuer("my-template")
      .setAudience("my-template-app")
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_MAX_AGE}s`)
      .sign(getJwtSecret());

    // 7. Siapkan response login
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
          },
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
          },
        },
      },
      { status: 200 }
    );

    // 8. Simpan token di HttpOnly cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
