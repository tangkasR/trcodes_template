import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseBody(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getId(request: NextRequest): number | null {
  const rawId = request.nextUrl.searchParams.get("id");

  if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
    return null;
  }

  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

function isPrismaError(error: unknown, code: string): boolean {
  return isObject(error) && error.code === code;
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
} as const;

// GET /api/auth/user
// GET /api/auth/user?id=1
export async function GET(request: NextRequest) {
  try {
    const rawId = request.nextUrl.searchParams.get("id");

    if (rawId !== null) {
      const id = getId(request);

      if (id === null) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user,
      });
    }

    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET user API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST /api/auth/user
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);

    if (!isObject(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }

    if (body.name.trim().length > 150) {
      return NextResponse.json(
        { success: false, message: "Name must not exceed 150 characters." },
        { status: 400 }
      );
    }

    if (
      typeof body.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
      body.email.trim().length > 191
    ) {
      return NextResponse.json(
        { success: false, message: "A valid email is required." },
        { status: 400 }
      );
    }

    if (
      typeof body.password !== "string" ||
      body.password.length < 8 ||
      Buffer.byteLength(body.password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters and no more than 72 bytes.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.roleId !== "number" ||
      !Number.isSafeInteger(body.roleId) ||
      body.roleId <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "A valid roleId is required." },
        { status: 400 }
      );
    }

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean." },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: body.roleId },
      select: { id: true, isActive: true },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found." },
        { status: 404 }
      );
    }

    if (!role.isActive) {
      return NextResponse.json(
        { success: false, message: "Cannot assign an inactive role." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        password: hashedPassword,
        roleId: body.roleId,
        isActive: body.isActive ?? true,
      },
      select: userSelect,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }

    if (isPrismaError(error, "P2003")) {
      return NextResponse.json(
        { success: false, message: "The specified role does not exist." },
        { status: 400 }
      );
    }

    console.error("POST user API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT /api/auth/user?id=1
export async function PUT(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "A valid user ID is required." },
        { status: 400 }
      );
    }

    const body = await parseBody(request);

    if (!isObject(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      roleId?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 150
      ) {
        return NextResponse.json(
          { success: false, message: "Name must contain 1–150 characters." },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
        body.email.trim().length > 191
      ) {
        return NextResponse.json(
          { success: false, message: "A valid email is required." },
          { status: 400 }
        );
      }

      data.email = body.email.trim().toLowerCase();
    }

    if (body.password !== undefined) {
      if (
        typeof body.password !== "string" ||
        body.password.length < 8 ||
        Buffer.byteLength(body.password, "utf8") > 72
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be at least 8 characters and no more than 72 bytes.",
          },
          { status: 400 }
        );
      }

      data.password = await bcrypt.hash(body.password, 12);
    }

    if (body.roleId !== undefined) {
      if (
        typeof body.roleId !== "number" ||
        !Number.isSafeInteger(body.roleId) ||
        body.roleId <= 0
      ) {
        return NextResponse.json(
          { success: false, message: "roleId must be a positive integer." },
          { status: 400 }
        );
      }

      const role = await prisma.role.findUnique({
        where: { id: body.roleId },
        select: { id: true, isActive: true },
      });

      if (!role) {
        return NextResponse.json(
          { success: false, message: "Role not found." },
          { status: 404 }
        );
      }

      if (!role.isActive) {
        return NextResponse.json(
          { success: false, message: "Cannot assign an inactive role." },
          { status: 400 }
        );
      }

      data.roleId = body.roleId;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "isActive must be a boolean." },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "Provide at least one field to update." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (isPrismaError(error, "P2002")) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }

    if (isPrismaError(error, "P2003")) {
      return NextResponse.json(
        { success: false, message: "The specified role does not exist." },
        { status: 400 }
      );
    }

    console.error("PUT user API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/user?id=1
export async function DELETE(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "A valid user ID is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE user API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
