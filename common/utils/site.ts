/**
 * Site-wide configuration and URL helper for SEO, Canonical URLs, and OpenGraph.
 */

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, "");
  }
  return "https://trcodes.dev";
}

export {
  SITE_NAME,
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_DESCRIPTION,
  SEO_KEYWORDS,
} from "@/common/constants/app.constant";
