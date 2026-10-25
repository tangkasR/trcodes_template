import "server-only";

import { isIP } from "node:net";
import { headers } from "next/headers";

// Hanya percayai header proxy kalau deployment memang berada di belakang
// proxy yang menimpanya. Tanpa ini, x-forwarded-for bisa dipalsukan client.
const TRUST_PROXY =
  process.env.TRUST_PROXY === "true" || Boolean(process.env.VERCEL);

function clientIpFromHeaders(h: Headers): string {
  if (!TRUST_PROXY) return "unknown";

  const candidate =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "";

  if (!candidate || isIP(candidate) === 0) return "unknown";
  return candidate.slice(0, 64);
}

export type RequestMeta = {
  ip: string;
  userAgent: string | null;
};

export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();
  const userAgent = h.get("user-agent")?.trim() ?? "";

  return {
    ip: clientIpFromHeaders(h),
    userAgent: userAgent ? userAgent.slice(0, 255) : null,
  };
}

export async function getClientIp(): Promise<string> {
  return (await getRequestMeta()).ip;
}
