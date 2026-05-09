import { timingSafeEqual } from "node:crypto";
import { getRedis } from "@/lib/redis";
import type { ConnectLogEntry } from "@/lib/connectLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOG_KEY = "connect:log";

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function tokensMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const provided =
    req.headers.get("x-admin-token") ??
    new URL(req.url).searchParams.get("token") ??
    "";

  if (!provided || !tokensMatch(provided, expected)) {
    return unauthorized();
  }

  const redis = getRedis();
  if (!redis) {
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const raw = await redis.lrange<string>(LOG_KEY, 0, 99);
  const entries: ConnectLogEntry[] = [];
  for (const item of raw) {
    try {
      const parsed =
        typeof item === "string" ? JSON.parse(item) : (item as ConnectLogEntry);
      entries.push(parsed as ConnectLogEntry);
    } catch {
      // skip malformed
    }
  }

  return new Response(JSON.stringify({ entries }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
