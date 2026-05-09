import { createHash } from "node:crypto";
import { getClientId, getRedis } from "./redis";

export type ConnectLogEntry = {
  ts: number;
  ipHash: string;
  ua: string | null;
  source: string | null;
  referrer: string | null;
  message: string | null;
};

const LOG_KEY = "connect:log";
const MAX_ENTRIES = 500;

let saltWarned = false;

function ipHashFor(ip: string): string {
  const salt = process.env.CONNECT_LOG_SALT;
  if (!salt && !saltWarned) {
    console.warn(
      "[connect] CONNECT_LOG_SALT is unset; using a default salt. Set one in production.",
    );
    saltWarned = true;
  }
  return createHash("sha256")
    .update((salt ?? "harin-default-salt") + "|" + ip)
    .digest("hex")
    .slice(0, 16);
}

export async function logConnect(
  req: Request,
  payload: { source?: string; referrer?: string; message?: string },
): Promise<void> {
  const entry: ConnectLogEntry = {
    ts: Date.now(),
    ipHash: ipHashFor(getClientId(req.headers)),
    ua: req.headers.get("user-agent"),
    source: payload.source ?? null,
    referrer: payload.referrer ?? null,
    message: payload.message ?? null,
  };

  const redis = getRedis();
  if (!redis) {
    console.info("[connect] redis disabled, skipping log:", entry);
    return;
  }

  try {
    await redis.lpush(LOG_KEY, JSON.stringify(entry));
    await redis.ltrim(LOG_KEY, 0, MAX_ENTRIES - 1);
  } catch (err) {
    console.warn(
      "[connect] failed to write log:",
      err instanceof Error ? err.message : err,
    );
  }
}
