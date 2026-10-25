import "server-only";

import { NextResponse } from "next/server";
import {
  AppError,
  ForbiddenError,
  RateLimitError,
  UnauthorizedError,
} from "@/common/utils/errors";

// Mengubah error menjadi respons JSON dengan status code yang benar
export function apiError(e: unknown) {
  if (e instanceof UnauthorizedError)
    return NextResponse.json({ message: e.message }, { status: 401 });
  if (e instanceof ForbiddenError)
    return NextResponse.json({ message: e.message }, { status: 403 });
  if (e instanceof RateLimitError)
    return NextResponse.json(
      { message: e.message },
      {
        status: 429,
        headers: {
          ...PRIVATE_HEADERS,
          "Retry-After": String(e.retryAfterSec),
        },
      }
    );
  if (e instanceof AppError)
    return NextResponse.json({ message: e.message }, { status: 400 });

  // Abaikan logging untuk signal internal prerendering dynamic bailouts Next.js
  if (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest: unknown }).digest === "string" &&
    (e as { digest: string }).digest.startsWith("HANGING_")
  ) {
    throw e;
  }

  console.error("[api]", e);
  return NextResponse.json(
    { message: "Terjadi kesalahan pada server" },
    { status: 500 }
  );
}

// Data per user: jangan pernah disimpan di cache bersama
export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store" };
