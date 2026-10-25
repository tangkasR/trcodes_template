import { NextResponse, type NextRequest } from "next/server";
import { apiError, PRIVATE_HEADERS } from "@/common/utils/api";
import { requirePermission } from "@/common/lib/auth";
import { listParamsSchema } from "@/common/utils/zod";
import { getItemList } from "@/modules/dashboard/item/item.queries";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("item", "read");
    const params = listParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const result = await getItemList({
      page: params.page,
      pageSize: params.limit,
      search: params.q,
    });

    return NextResponse.json(
      {
        items: result.data,
        total: result.total,
        page: result.page,
        limit: result.pageSize,
        totalPages: result.totalPages,
      },
      { headers: PRIVATE_HEADERS }
    );
  } catch (e) {
    return apiError(e);
  }
}
