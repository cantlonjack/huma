import { Redis } from "@upstash/redis";

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 10; // requests per window per IP

// In-memory fallback when Redis is not configured
const fallbackMap = new Map<string, { count: number; resetAt: number }>();

function getFallbackLimited(ip: string): boolean {
  const now = Date.now();
  // Purge expired entries when map grows too large (prevent memory leak)
  if (fallbackMap.size > 1000) {
    for (const [key, val] of fallbackMap) {
      if (now > val.resetAt) fallbackMap.delete(key);
    }
  }
  const entry = fallbackMap.get(ip);
  if (!entry || now > entry.resetAt) {
    fallbackMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function isRateLimited(ip: string): Promise<boolean> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    // No Redis — fall back to in-memory (better than nothing)
    return getFallbackLimited(ip);
  }

  try {
    const redis = new Redis({ url, token });
    const key = `ratelimit:${ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
      // First request in this window — set expiry
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    return current > RATE_LIMIT_MAX;
  } catch {
    // Redis error — fall back to in-memory
    return getFallbackLimited(ip);
  }
}
