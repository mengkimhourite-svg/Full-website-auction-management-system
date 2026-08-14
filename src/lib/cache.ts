/**
 * Tiny in-process TTL cache for slow, non-real-time aggregates used by the
 * Admin Dashboard and the auctions list (stat counts, category list, monthly
 * report). The MongoDB-backed store loads full collections into memory and
 * recomputes these aggregates with O(n) scans on every request, so caching
 * them for a few seconds removes the most expensive work from each page load.
 *
 * All entries are invalidated whenever the underlying data changes via
 * `invalidateCaches()` (called from mutation endpoints), so statistics stay
 * correct — a write always busts the cache.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export type CacheKey =
  | "report"
  | "auction-status-counts"
  | "product-categories";

const store = new Map<CacheKey, CacheEntry<unknown>>();

export async function cached<T>(
  key: CacheKey,
  ttlMs: number,
  compute: () => Promise<T> | T
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key);
  if (entry && entry.expiresAt > now) {
    return entry.value as T;
  }
  const value = await compute();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Drop every cached aggregate after a write so the next read is fresh. */
export function invalidateCaches(): void {
  store.clear();
}

export function invalidateCache(...keys: CacheKey[]): void {
  for (const key of keys) {
    store.delete(key);
  }
}