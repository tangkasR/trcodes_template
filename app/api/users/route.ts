// src/app/api/users/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { apiError, PRIVATE_HEADERS } from "@/common/utils/api";
import { requirePermission } from "@/common/lib/auth";
import { listParamsSchema } from "@/common/utils/zod";
import { getUsers } from "@/modules/dashboard/user/user.queries";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("user", "read");
    const params = listParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const data = await getUsers(params); // select di query sudah membuang kolom password
    return NextResponse.json(
      { ...data, page: params.page, limit: params.limit },
      { headers: PRIVATE_HEADERS }
    );
  } catch (e) {
    return apiError(e);
  }
}
