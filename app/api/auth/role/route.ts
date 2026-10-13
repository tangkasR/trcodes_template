import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getId(request: NextRequest): number | null {
  const rawId = request.nextUrl.searchParams.get("id");

  if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
    return null;
  }

  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

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

// GET /api/auth/role
// GET /api/auth/role?id=1
export async function GET(request: NextRequest) {
  try {
    const rawId = request.nextUrl.searchParams.get("id");

    if (rawId !== null) {
      const id = getId(request);

      if (id === null) {
        return NextResponse.json(
          { success: false, message: "Invalid role ID." },
          { status: 400 }
        );
      }

      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              permissions: true,
            },
          },
          permissions: {
            include: {
              feature: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        return NextResponse.json(
          { success: false, message: "Role not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: role,
      });
    }

    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("GET role API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST /api/auth/role

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
        { success: false, message: "Role name is required." },
        { status: 400 }
      );
    }

    const name = body.name.trim();

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Role name must not exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    if (
      body.description !== undefined &&
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Description must be a string or null." },
        { status: 400 }
      );
    }

    if (typeof body.description === "string" && body.description.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must not exceed 255 characters.",
        },
        { status: 400 }
      );
    }

    if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean." },
        { status: 400 }
      );
    }

    // Create role and permissions in one transaction
    const role = await prisma.$transaction(async (tx) => {
      // 1. Create role
      const newRole = await tx.role.create({
        data: {
          name,
          description:
            typeof body.description === "string"
              ? body.description.trim() || null
              : body.description === null
              ? null
              : undefined,
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
        },
      });

      // 2. Get all features
      const features = await tx.feature.findMany({
        select: {
          id: true,
        },
      });

      // 3. Create permission for each feature, all actions default false
      if (features.length > 0) {
        await tx.rolePermission.createMany({
          data: features.map((feature) => ({
            roleId: newRole.id,
            featureId: feature.id,
            isRead: false,
            isAdd: false,
            isEdit: false,
            isDelete: false,
          })),
        });
      }

      // 4. Return role with updated counts
      return tx.role.findUniqueOrThrow({
        where: {
          id: newRole.id,
        },
        include: {
          _count: {
            select: {
              users: true,
              permissions: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Role created successfully.",
        data: role,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isObject(error) && error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Role name already exists." },
        { status: 409 }
      );
    }

    console.error("POST role API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// PUT /api/auth/role?id=1
export async function PUT(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid role ID is required in the query.",
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

    const data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Role name must not be empty." },
          { status: 400 }
        );
      }

      if (body.name.trim().length > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Role name must not exceed 100 characters.",
          },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          { success: false, message: "Description must be a string or null." },
          { status: 400 }
        );
      }

      if (
        typeof body.description === "string" &&
        body.description.length > 255
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Description must not exceed 255 characters.",
          },
          { status: 400 }
        );
      }

      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : body.description;
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
        {
          success: false,
          message: "Provide at least one field to update.",
        },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Role updated successfully.",
      data: role,
    });
  } catch (error) {
    if (isObject(error) && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Role not found." },
        { status: 404 }
      );
    }

    if (isObject(error) && error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Role name already exists." },
        { status: 409 }
      );
    }

    console.error("PUT role API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/role?id=1
export async function DELETE(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid role ID is required in the query.",
        },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role not found." },
        { status: 404 }
      );
    }

    // Prevent deletion if role is still assigned to users
    if (role._count.users > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Role ini tidak dapat dihapus karena masih digunakan oleh pengguna. Ubah role pengguna tersebut terlebih dahulu.",
          data: {
            users: role._count.users,
          },
        },
        { status: 409 }
      );
    }

    // Delete role permissions and role atomically
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      await tx.role.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Role and its permissions deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE role API error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
