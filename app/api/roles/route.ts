import { NextResponse, type NextRequest } from "next/server";
import { apiError, PRIVATE_HEADERS } from "@/common/utils/api";
import { requirePermission } from "@/common/lib/auth";
import { listParamsSchema } from "@/common/utils/zod";
import { getRoles } from "@/modules/dashboard/role/role.queries";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("role", "read");
    const params = listParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const data = await getRoles(params);
    return NextResponse.json(
      { ...data, page: params.page, limit: params.limit },
      { headers: PRIVATE_HEADERS }
    );
  } catch (e) {
    return apiError(e);
  }
}
