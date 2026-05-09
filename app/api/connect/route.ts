import { z } from "zod";
import { getClientId } from "@/lib/redis";
import { getConnectRateLimit } from "@/lib/rateLimit";
import { logConnect } from "@/lib/connectLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  source: z.string().max(64).optional(),
  referrer: z.string().max(2048).optional(),
  message: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const limiter = getConnectRateLimit();
  if (limiter) {
    const id = getClientId(req.headers);
    const { success, reset, remaining } = await limiter.limit(id);
    if (!success) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message:
            "too many transmissions. take a breath, try again in a few minutes.",
          reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Remaining": String(remaining),
          },
        },
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "invalid_request", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    await logConnect(req, parsed.data);
  } catch (err) {
    console.error("[connect] log failed:", err);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 204 });
}
