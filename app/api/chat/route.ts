import { z } from "zod";
import { getGemini, CHAT_MODEL } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/prompt";
import { getChatRateLimit, getClientId } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  // Stream from Gemini (gracefully degrade if key is missing)
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "not_configured",
        message:
          "operator offline. GEMINI_API_KEY is not set on the server.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  const client = getGemini();
  const encoder = new TextEncoder();

  // Gemini uses role "model" for assistant turns.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await client.models.generateContentStream({
          model: CHAT_MODEL,
          contents,
          config: {
            systemInstruction: buildSystemPrompt(),
            maxOutputTokens: 1024,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        // Log the real error server-side; send a generic message to the client
        // so we don't leak provider details (invalid key, quota, etc.).
        console.error("[chat] stream error:", err);
        controller.enqueue(encoder.encode("\n\n[error] operator unreachable"));
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
