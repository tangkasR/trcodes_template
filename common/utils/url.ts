const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function protocolOf(value: string): string | null {
  try {
    return new URL(value).protocol;
  } catch {
    return null;
  }
}

export function isHttpUrl(value: string): boolean {
  const protocol = protocolOf(value);
  return protocol !== null && HTTP_PROTOCOLS.has(protocol);
}

export function isSafeLinkUrl(value: string): boolean {
  const protocol = protocolOf(value);
  return protocol !== null && LINK_PROTOCOLS.has(protocol);
}

// Dipakai saat render sebagai lapisan kedua kalau data lama belum tervalidasi.
export function safeHref(value: string): string {
  return isSafeLinkUrl(value) ? value : "#";
}

export function isMediaUrl(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith("/uploads/") && !trimmed.includes("..")) {
    return /^\/uploads\/[a-zA-Z0-9_\-\./]+$/.test(trimmed);
  }
  return isHttpUrl(trimmed);
}

export function safeHttpUrl(value: string | null | undefined): string {
  return value && isHttpUrl(value) ? value : "";
}
