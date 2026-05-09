import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

export { getClientId } from "./redis";

let chatLimiter: Ratelimit | null = null;
let connectLimiter: Ratelimit | null = null;

export function getChatRateLimit(): Ratelimit | null {
  if (chatLimiter) return chatLimiter;
  const redis = getRedis();
  if (!redis) return null;

  try {
    chatLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      analytics: true,
      prefix: "chat",
    });
    return chatLimiter;
  } catch (err) {
    console.warn(
      "[rateLimit] chat limiter init failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export function getConnectRateLimit(): Ratelimit | null {
  if (connectLimiter) return connectLimiter;
  const redis = getRedis();
  if (!redis) return null;

  try {
    connectLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "connect",
    });
    return connectLimiter;
  } catch (err) {
    console.warn(
      "[rateLimit] connect limiter init failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
