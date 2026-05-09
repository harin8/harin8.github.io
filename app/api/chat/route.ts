import { z } from "zod";
import { getAnthropic, CHAT_MODEL } from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/prompt";
import { getChatRateLimit, getClientId } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(req: Request) {
  // Rate-limit (best-effort; skipped in dev without Upstash creds)
  const limiter = getChatRateLimit();
  if (limiter) {
    const id = getClientId(req.headers);
    const { success, reset, remaining } = await limiter.limit(id);
    if (!success) {
      return new Response(
        JSON.stringify({
          error: "rate_limited",
          message: "too many messages. take a breath, try again in a few minutes.",
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

  // Validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "invalid_json" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "invalid_request", issues: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const { messages } = parsed.data;

  // Stream from Claude (gracefully degrade if key is missing)
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "not_configured",
        message:
          "operator offline. ANTHROPIC_API_KEY is not set on the server.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  const client = getAnthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: CHAT_MODEL,
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: buildSystemPrompt(),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "operator unreachable";
        controller.enqueue(encoder.encode(`\n\n[error] ${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
