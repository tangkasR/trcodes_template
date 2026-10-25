import { NextResponse, type NextRequest } from "next/server";
import { apiError, PRIVATE_HEADERS } from "@/common/utils/api";
import { requirePermission } from "@/common/lib/auth";
import { listParamsSchema } from "@/common/utils/zod";
import { getLoginAttempts } from "@/modules/dashboard/login-attempt/login-attempt.queries";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("login-attempt", "read");
    const params = listParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const data = await getLoginAttempts(params);
    return NextResponse.json(
      { ...data, page: params.page, limit: params.limit },
      { headers: PRIVATE_HEADERS }
    );
  } catch (e) {
    return apiError(e);
  }
}
