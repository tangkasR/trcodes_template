import "server-only";

import { prisma } from "@/common/lib/db";
import { RateLimitError } from "@/common/utils/errors";

type Bucket = { count: number; resetAt: number };

export interface IRateLimitStore {
  incrementAndCheck(key: string, limit: number, windowMs: number): Promise<void>;
  prune(): Promise<number>;
}

// In-memory fallback untuk performa atau jika query DB gagal
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function cleanupMemory(now: number) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function assertMemoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    cleanupMemory(now);
    return;
  }

  if (bucket.count >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000)
    );
    throw new RateLimitError(retryAfterSec);
  }

  bucket.count += 1;
}

export class MemoryRateLimitStore implements IRateLimitStore {
  async incrementAndCheck(key: string, limit: number, windowMs: number): Promise<void> {
    assertMemoryRateLimit(key, limit, windowMs);
  }
  async prune(): Promise<number> {
    const now = Date.now();
    let count = 0;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
        count++;
      }
    }
    return count;
  }
}

export async function assertRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Jalankan atomic upsert di database PostgreSQL
    const bucket = await prisma.$transaction(async (tx) => {
      const existing = await tx.rateLimitBucket.findUnique({
        where: { key },
      });

      if (!existing || existing.resetAt <= now) {
        return tx.rateLimitBucket.upsert({
          where: { key },
          create: { key, count: 1, resetAt },
          update: { count: 1, resetAt },
        });
      }

      if (existing.count >= limit) {
        return existing;
      }

      return tx.rateLimitBucket.update({
        where: { key },
        data: { count: { increment: 1 } },
      });
    });

    if (bucket.count > limit || (bucket.count === limit && bucket.resetAt > now)) {
      // Jika count melebihi atau sama dengan limit saat dicek
      const diffMs = bucket.resetAt.getTime() - now.getTime();
      if (diffMs > 0 && bucket.count >= limit) {
        const retryAfterSec = Math.max(1, Math.ceil(diffMs / 1000));
        throw new RateLimitError(retryAfterSec);
      }
    }

    // Pembersihan berkala (probabilistik 1 dari 50 request) agar tabel tidak membengkak
    if (Math.random() < 0.02) {
      pruneExpiredRateLimits().catch(() => {});
    }
  } catch (err) {
    if (err instanceof RateLimitError) throw err;

    // Jika terjadi kendala koneksi ke database, fallback ke in-memory limiter
    assertMemoryRateLimit(key, limit, windowMs);
  }
}

/**
 * Menghapus baris bucket rate limit yang sudah kedaluwarsa dari PostgreSQL.
 */
export async function pruneExpiredRateLimits(): Promise<number> {
  try {
    const res = await prisma.rateLimitBucket.deleteMany({
      where: { resetAt: { lt: new Date() } },
    });
    return res.count;
  } catch {
    return 0;
  }
}
