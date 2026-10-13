import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    // 2. Validate input
    if (
      !body ||
      typeof body !== "object" ||
      !("name" in body) ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (!name || name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must contain 1–150 characters.",
        },
        { status: 400 }
      );
    }

    if (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // bcrypt has a 72-byte password input limit
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters and no more than 72 bytes.",
        },
        { status: 400 }
      );
    }

    // 3. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered.",
        },
        { status: 409 }
      );
    }

    // 4. Get the default role from the database
    // Never accept roleId from a public registration request.
    const defaultRole = await prisma.role.findUnique({
      where: { name: "User" },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!defaultRole || !defaultRole.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Default role "User" is not available.',
        },
        { status: 500 }
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: defaultRole.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 7. Return safe user data
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle unique email constraint in case of concurrent requests
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered.",
        },
        { status: 409 }
      );
    }

    console.error("Registration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
