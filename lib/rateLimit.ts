import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let limiter: Ratelimit | null = null;

/**
 * Returns a configured rate-limiter, or null if Upstash env vars are missing.
 * Allowing null means the chat endpoint still works in local dev without Redis.
 */
export function getChatRateLimit(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      analytics: true,
      prefix: "chat",
    });
    return limiter;
  } catch (err) {
    console.warn(
      "[rateLimit] Upstash misconfigured, skipping rate-limit:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export function getClientId(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "anon";
}
