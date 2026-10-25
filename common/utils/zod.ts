import { z } from "zod";
import type { ZodError } from "zod";
import { ValidationError } from "@/common/utils/errors";

// Parameter URL tidak bisa dipercaya: nilai tidak valid kembali ke default
export const listParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(10000).catch(10),
  q: z.string().trim().max(100).catch(""),
});

export type ListParams = z.infer<typeof listParamsSchema>;

export type ListResponse<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export function listParamsToSearch({ page, limit, q }: ListParams) {
  const sp = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) sp.set("q", q);
  return sp.toString();
}

// Zod 4: z.uuid(). Kalau yang terpasang Zod 3, ganti jadi z.string().uuid("ID tidak valid")
export const uuidSchema = z.uuid("UUID tidak valid");

// Ubah error Zod menjadi { namaField: "pesan pertama" }
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

// Validasi input dengan Zod; kalau gagal melempar ValidationError
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown
): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ValidationError(zodFieldErrors(result.error));
  return result.data;
}
