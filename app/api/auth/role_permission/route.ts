import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PermissionFields = {
  roleId?: number;
  featureId?: number;
  isRead?: boolean;
  isAdd?: boolean;
  isEdit?: boolean;
  isDelete?: boolean;
};

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

function parsePositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function getQueryId(request: NextRequest, key = "id"): number | null {
  const raw = request.nextUrl.searchParams.get(key);

  if (!raw || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }

  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

function isPrismaError(error: unknown, code: string): boolean {
  return isObject(error) && error.code === code;
}

function validatePermissionBooleans(
  body: Record<string, unknown>
): string | null {
  for (const key of ["isRead", "isAdd", "isEdit", "isDelete"]) {
    if (body[key] !== undefined && typeof body[key] !== "boolean") {
      return `${key} must be a boolean.`;
    }
  }

  return null;
}

const permissionInclude = {
  role: {
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  },
  feature: {
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
    },
  },
};

// GET /api/auth/user_permission
// GET /api/auth/user_permission?id=1
// GET /api/auth/user_permission?roleId=1
// GET /api/auth/user_permission?featureId=1
// GET /api/auth/user_permission?roleId=1&featureId=2
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawId = params.get("id");
    const rawRoleId = params.get("roleId");
    const rawFeatureId = params.get("featureId");

    if (rawId !== null) {
      const id = getQueryId(request, "id");

      if (id === null) {
        return NextResponse.json(
          { success: false, message: "Invalid permission ID." },
          { status: 400 }
        );
      }

      const permission = await prisma.rolePermission.findUnique({
        where: { id },
        include: permissionInclude,
      });

      if (!permission) {
        return NextResponse.json(
          { success: false, message: "Role permission not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: permission,
      });
    }

    const where: {
      roleId?: number;
      featureId?: number;
    } = {};

    if (rawRoleId !== null) {
      const roleId = getQueryId(request, "roleId");

      if (roleId === null) {
        return NextResponse.json(
          { success: false, message: "Invalid roleId." },
          { status: 400 }
        );
      }

      where.roleId = roleId;
    }

    if (rawFeatureId !== null) {
      const featureId = getQueryId(request, "featureId");

      if (featureId === null) {
        return NextResponse.json(
          { success: false, message: "Invalid featureId." },
          { status: 400 }
        );
      }

      where.featureId = featureId;
    }

    const permissions = await prisma.rolePermission.findMany({
      where,
      include: permissionInclude,
      orderBy: [{ roleId: "asc" }, { featureId: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("GET role permission API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST /api/auth/user_permission
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);

    if (!isObject(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const roleId = parsePositiveInt(body.roleId);
    const featureId = parsePositiveInt(body.featureId);

    if (roleId === null || featureId === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid roleId and featureId are required.",
        },
        { status: 400 }
      );
    }

    const booleanError = validatePermissionBooleans(body);

    if (booleanError) {
      return NextResponse.json(
        { success: false, message: booleanError },
        { status: 400 }
      );
    }

    const permission = await prisma.rolePermission.create({
      data: {
        roleId,
        featureId,
        isRead: body.isRead === undefined ? false : (body.isRead as boolean),
        isAdd: body.isAdd === undefined ? false : (body.isAdd as boolean),
        isEdit: body.isEdit === undefined ? false : (body.isEdit as boolean),
        isDelete:
          body.isDelete === undefined ? false : (body.isDelete as boolean),
      },
      include: permissionInclude,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Role permission created successfully.",
        data: permission,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return NextResponse.json(
        {
          success: false,
          message: "A permission for this role and feature already exists.",
        },
        { status: 409 }
      );
    }

    if (isPrismaError(error, "P2003")) {
      return NextResponse.json(
        {
          success: false,
          message: "The specified role or feature does not exist.",
        },
        { status: 400 }
      );
    }

    console.error("POST role permission API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT /api/auth/user_permission?id=1
export async function PUT(request: NextRequest) {
  try {
    const id = getQueryId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid permission ID is required in the query.",
        },
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

    const booleanError = validatePermissionBooleans(body);

    if (booleanError) {
      return NextResponse.json(
        { success: false, message: booleanError },
        { status: 400 }
      );
    }

    const data: PermissionFields = {};

    if (body.roleId !== undefined) {
      const roleId = parsePositiveInt(body.roleId);

      if (roleId === null) {
        return NextResponse.json(
          { success: false, message: "roleId must be a positive integer." },
          { status: 400 }
        );
      }

      data.roleId = roleId;
    }

    if (body.featureId !== undefined) {
      const featureId = parsePositiveInt(body.featureId);

      if (featureId === null) {
        return NextResponse.json(
          { success: false, message: "featureId must be a positive integer." },
          { status: 400 }
        );
      }

      data.featureId = featureId;
    }

    for (const key of ["isRead", "isAdd", "isEdit", "isDelete"] as const) {
      if (body[key] !== undefined) {
        data[key] = body[key] as boolean;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide at least one field to update.",
        },
        { status: 400 }
      );
    }

    const permission = await prisma.rolePermission.update({
      where: { id },
      data,
      include: permissionInclude,
    });

    return NextResponse.json({
      success: true,
      message: "Role permission updated successfully.",
      data: permission,
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json(
        { success: false, message: "Role permission not found." },
        { status: 404 }
      );
    }

    if (isPrismaError(error, "P2002")) {
      return NextResponse.json(
        {
          success: false,
          message: "A permission for this role and feature already exists.",
        },
        { status: 409 }
      );
    }

    if (isPrismaError(error, "P2003")) {
      return NextResponse.json(
        {
          success: false,
          message: "The specified role or feature does not exist.",
        },
        { status: 400 }
      );
    }

    console.error("PUT role permission API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/user_permission?id=1
export async function DELETE(request: NextRequest) {
  try {
    const id = getQueryId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid permission ID is required in the query.",
        },
        { status: 400 }
      );
    }

    await prisma.rolePermission.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Role permission deleted successfully.",
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json(
        { success: false, message: "Role permission not found." },
        { status: 404 }
      );
    }

    console.error("DELETE role permission API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
