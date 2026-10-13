import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AvailableAction = "r" | "a" | "e" | "d";

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

function isPrismaError(error: unknown, code: string): boolean {
  return isObject(error) && error.code === code;
}

function validateAvailableActions(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const actions = value.split(",").map((item) => item.trim());

  const allowedActions = ["r", "a", "e", "d"];

  // Tidak boleh ada kode kosong atau kode yang tidak dikenal.
  if (actions.some((action) => !allowedActions.includes(action))) {
    return false;
  }

  // Tidak boleh ada kode aksi duplikat.
  if (new Set(actions).size !== actions.length) {
    return false;
  }

  // Urutan wajib: r, a, e, d sesuai aksi yang dipilih.
  const order: Record<AvailableAction, number> = {
    r: 1,
    a: 2,
    e: 3,
    d: 4,
  };

  for (let i = 1; i < actions.length; i++) {
    if (
      order[actions[i - 1] as AvailableAction] >=
      order[actions[i] as AvailableAction]
    ) {
      return false;
    }
  }

  return true;
}

function normalizeAvailableActions(value: string): string {
  return value
    .split(",")
    .map((action) => action.trim())
    .join(",");
}

// GET /api/auth/feature
// GET /api/auth/feature?id=1
export async function GET(request: NextRequest) {
  try {
    const rawId = request.nextUrl.searchParams.get("id");

    if (rawId !== null) {
      if (!/^[1-9]\d*$/.test(rawId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid feature ID.",
          },
          { status: 400 }
        );
      }

      const id = Number(rawId);

      if (!Number.isSafeInteger(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid feature ID.",
          },
          { status: 400 }
        );
      }

      const feature = await prisma.feature.findUnique({
        where: { id },
      });

      if (!feature) {
        return NextResponse.json(
          {
            success: false,
            message: "Feature not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: feature,
      });
    }

    const features = await prisma.feature.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: features,
    });
  } catch (error) {
    console.error("GET feature API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// POST /api/auth/feature
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);

    if (!isObject(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";

    const description =
      body.description === undefined || body.description === null
        ? null
        : typeof body.description === "string"
        ? body.description.trim() || null
        : undefined;

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required and must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    if (!code || code.length > 100 || !/^[A-Z0-9_-]+$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Code is required, must not exceed 100 characters, and may contain only A-Z, 0-9, underscores, and hyphens.",
        },
        { status: 400 }
      );
    }

    if (description === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must be a string or null.",
        },
        { status: 400 }
      );
    }

    if (!validateAvailableActions(body.availableActions)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "availableActions is required. Use r, r,a, r,a,e, or r,a,e,d.",
        },
        { status: 400 }
      );
    }

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be a boolean.",
        },
        { status: 400 }
      );
    }

    // Create feature and permissions in one transaction
    const feature = await prisma.$transaction(async (tx) => {
      // 1. Create feature
      const newFeature = await tx.feature.create({
        data: {
          name,
          code,
          description,
          availableActions: normalizeAvailableActions(
            body.availableActions as string
          ),
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
        },
      });

      // 2. Get all existing roles
      const roles = await tx.role.findMany({
        select: {
          id: true,
        },
      });

      // 3. Create default permission for every role
      if (roles.length > 0) {
        await tx.rolePermission.createMany({
          data: roles.map((role) => ({
            roleId: role.id,
            featureId: newFeature.id,
            isRead: false,
            isAdd: false,
            isEdit: false,
            isDelete: false,
          })),
        });
      }

      return newFeature;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feature created successfully.",
        data: feature,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return NextResponse.json(
        {
          success: false,
          message: "Feature code already exists.",
        },
        { status: 409 }
      );
    }

    console.error("POST feature API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/feature?id=1
export async function DELETE(request: NextRequest) {
  try {
    const rawId = request.nextUrl.searchParams.get("id");

    if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid feature ID is required.",
        },
        { status: 400 }
      );
    }

    const id = Number(rawId);

    if (!Number.isSafeInteger(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feature ID.",
        },
        { status: 400 }
      );
    }

    const feature = await prisma.feature.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!feature) {
      return NextResponse.json(
        {
          success: false,
          message: "Feature not found.",
        },
        { status: 404 }
      );
    }

    // Delete role permissions and feature atomically
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { featureId: id },
      });

      await tx.feature.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Feature and its role permissions deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE feature API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
