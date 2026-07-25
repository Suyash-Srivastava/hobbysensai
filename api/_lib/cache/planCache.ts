import crypto from "node:crypto";
import type { LearningPlanRequest, LearningPlanResponse } from "../../../src/shared/hobbyPlan.schema";

interface CacheEntry {
  value: LearningPlanResponse;
  expiresAt: number;
}

const MAX_ENTRIES = 100;
// Long enough to dedupe repeated demo clicks / accidental double-submits,
// short enough that stale plans don't linger for the lifetime of the lambda.
const TTL_MS = 30 * 60 * 1000;

const store = new Map<string, CacheEntry>();

export function cacheKeyFor(request: LearningPlanRequest): string {
  const normalized = JSON.stringify({
    hobby: request.hobby.trim().toLowerCase(),
    currentLevel: request.currentLevel,
    goal: request.goal.trim().toLowerCase(),
    weeklyTimeBudgetHours: request.weeklyTimeBudgetHours,
  });
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function getCached(key: string): LearningPlanResponse | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  // Re-inserting moves this key to the end of Map's iteration order, which
  // is what makes the eviction below a real LRU rather than FIFO.
  store.delete(key);
  store.set(key, entry);
  return entry.value;
}

export function setCached(key: string, value: LearningPlanResponse): void {
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

/** Test-only escape hatch — keeps the module-level cache from leaking state across test cases. */
export function clearCacheForTests(): void {
  store.clear();
}
