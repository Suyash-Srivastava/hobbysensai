interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window limiter. State lives in module memory, which only persists
 * for the lifetime of a warm serverless instance — that's fine here: the
 * goal is protecting the (personal, rate-limited) Gemini API key from a
 * runaway client or scraper hitting a public demo, not perfect global
 * accounting.
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > maxRequests;
}

export function clearRateLimitForTests(): void {
  buckets.clear();
}
