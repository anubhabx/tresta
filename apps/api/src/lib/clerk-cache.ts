import { clerkClient } from '@clerk/express';

/**
 * In-memory TTL cache for Clerk user objects.
 *
 * Prevents redundant Clerk API calls in middleware that runs on every request.
 * Cache entries expire after 60 seconds — short enough to pick up role changes
 * promptly, long enough to avoid hammering Clerk on burst requests.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const userCache = new Map<string, CacheEntry<Awaited<ReturnType<typeof clerkClient.users.getUser>>>>();

const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Get a Clerk user by ID, with in-memory caching.
 *
 * @param userId - Clerk user ID
 * @returns Clerk User object
 */
export async function getCachedUser(userId: string) {
  const now = Date.now();

  // Check cache
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Fetch from Clerk
  const user = await clerkClient.users.getUser(userId);

  // Store in cache
  userCache.set(userId, {
    value: user,
    expiresAt: now + CACHE_TTL_MS,
  });

  // Lazily prune expired entries (limit to 100 entries max)
  if (userCache.size > 100) {
    for (const [key, entry] of userCache) {
      if (entry.expiresAt <= now) {
        userCache.delete(key);
      }
    }
  }

  return user;
}

/**
 * Invalidate the cache for a specific user (e.g., after role change).
 */
export function invalidateUserCache(userId: string) {
  userCache.delete(userId);
}
