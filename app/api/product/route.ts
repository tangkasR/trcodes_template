import { NextRequest, NextResponse } from "next/server";
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

function isPrismaError(error: unknown, code: string): boolean {
  return isObject(error) && error.code === code;
}

function getId(request: NextRequest): number | null {
  const rawId = request.nextUrl.searchParams.get("id");

  if (!rawId || !/^[1-9]\d*$/.test(rawId)) {
    return null;
  }

  const id = Number(rawId);

  return Number.isSafeInteger(id) ? id : null;
}

const productSelect = {
  id: true,
  name: true,
  price: true,
  stock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// GET /api/product
// GET /api/product?id=1
export async function GET(request: NextRequest) {
  try {
    const rawId = request.nextUrl.searchParams.get("id");

    if (rawId !== null) {
      const id = getId(request);

      if (id === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product ID.",
          },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect,
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: product,
      });
    }

    const products = await prisma.product.findMany({
      select: productSelect,
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET product API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// POST /api/product
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

    if (!name || name.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required and must not exceed 150 characters.",
        },
        { status: 400 }
      );
    }

    const price =
      typeof body.price === "number"
        ? body.price
        : typeof body.price === "string" && body.price.trim() !== ""
        ? Number(body.price)
        : NaN;

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    // DECIMAL(12,2): maksimal 10 digit sebelum desimal dan 2 digit setelahnya.
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(String(body.price).trim())) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Price must have at most 10 integer digits and 2 decimal places.",
        },
        { status: 400 }
      );
    }

    const stock = body.stock === undefined ? 0 : body.stock;

    if (
      typeof stock !== "number" ||
      !Number.isSafeInteger(stock) ||
      stock < 0 ||
      stock > 2147483647
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock must be a non-negative integer.",
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

    const product = await prisma.product.create({
      data: {
        name,
        price: price.toFixed(2),
        stock,
        isActive: body.isActive ?? true,
      },
      select: productSelect,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST product API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// PUT /api/product?id=1
export async function PUT(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product ID is required.",
        },
        { status: 400 }
      );
    }

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

    const data: {
      name?: string;
      price?: string;
      stock?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 150
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Name must be a non-empty string of at most 150 characters.",
          },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.price !== undefined) {
      const rawPrice =
        typeof body.price === "string" || typeof body.price === "number"
          ? String(body.price).trim()
          : "";

      if (!/^\d{1,10}(\.\d{1,2})?$/.test(rawPrice)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Price must be non-negative with at most 10 integer digits and 2 decimal places.",
          },
          { status: 400 }
        );
      }

      const price = Number(rawPrice);

      if (!Number.isFinite(price)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid price.",
          },
          { status: 400 }
        );
      }

      data.price = price.toFixed(2);
    }

    if (body.stock !== undefined) {
      if (
        typeof body.stock !== "number" ||
        !Number.isSafeInteger(body.stock) ||
        body.stock < 0 ||
        body.stock > 2147483647
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock must be a non-negative integer.",
          },
          { status: 400 }
        );
      }

      data.stock = body.stock;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "isActive must be a boolean.",
          },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No fields provided to update.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    console.error("PUT product API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/product?id=1
export async function DELETE(request: NextRequest) {
  try {
    const id = getId(request);

    if (id === null) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product ID is required.",
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    console.error("DELETE product API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}
