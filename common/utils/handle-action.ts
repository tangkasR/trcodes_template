import "server-only";

import { unstable_rethrow } from "next/navigation";
import { AppError, ValidationError } from "@/common/utils/errors";

export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function handleAction<T>(
  fn: () => Promise<T>,
  successMessage?: string
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: successMessage };
  } catch (e) {
    unstable_rethrow(e); // biarkan redirect()/notFound() lewat

    if (e instanceof ValidationError) {
      return { ok: false, message: e.message, fieldErrors: e.fieldErrors };
    }
    if (e instanceof AppError) {
      return {
        ok: false,
        message: e.message,
        fieldErrors: e.field ? { [e.field]: e.message } : undefined,
      };
    }
    console.error("[action]", e);
    return { ok: false, message: "Terjadi kesalahan pada server" };
  }
}
