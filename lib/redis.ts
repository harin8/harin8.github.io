import { Redis } from "@upstash/redis";

let client: Redis | null = null;
let attempted = false;

/**
 * Returns a shared Upstash Redis client, or null if env vars are missing
 * or construction fails. Lets callers (rate-limiter, connect log) keep
 * working in local dev without Redis.
 */
export function getRedis(): Redis | null {
  if (client) return client;
  if (attempted) return null;
  attempted = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    client = new Redis({ url, token });
    return client;
  } catch (err) {
    console.warn(
      "[redis] Upstash misconfigured, returning null:",
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
