const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { windowMs = 60000, maxRequests = 60 } = options;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function getRateLimitHeaders(
  result: ReturnType<typeof rateLimit>
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetIn / 1000)),
  };
}

const CLEANUP_INTERVAL = 300000;
let lastCleanup = Date.now();

export function cleanupStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanupStaleEntries, CLEANUP_INTERVAL);
}
