# harin // operator console

Personal site. Cyber-noir aesthetic. Streaming chatbot grounded in a bio file.
Built with Next.js 16, React 19, Tailwind v4, GSAP, and the Anthropic SDK.

## Pages

- `/` — Home. Boot sequence → matrix rain → decryption-text name reveal.
- `/timeline` — Pinned-scroll z-axis trace through life events.
- `/chat` — Streaming terminal that talks about Harin.
- `/` (palette) — Press `/` anywhere on the site for a recon-style command palette
  with `whoami`, `skills --json`, navigation shortcuts, and inline `ask "..."`
  streaming.

## Stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + CSS variables for tokens |
| Smooth scroll | Lenis |
| Scroll choreography | GSAP + ScrollTrigger |
| Micro-interactions | Framer Motion |
| LLM | `@anthropic-ai/sdk` (streaming) |
| Rate limit | Upstash Redis + Ratelimit |
| Validation | Zod |

## Local dev

```bash
npm install
cp .env.local.example .env.local
# fill in ANTHROPIC_API_KEY and (optional) UPSTASH_* values
npm run dev
```

Visit http://localhost:3000.

The chat endpoint works without Upstash credentials in dev — rate-limiting is
silently skipped if the env vars are missing.

## Deploying to Vercel

1. Import this repo into Vercel. Framework auto-detects as Next.js.
2. Add environment variables in **Project Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY` (required)
   - `UPSTASH_REDIS_REST_URL` (recommended for production)
   - `UPSTASH_REDIS_REST_TOKEN` (recommended for production)
3. Push to the configured branch. Vercel deploys a preview; promote to production
   when ready.
4. Disable GitHub Pages in **repo Settings → Pages → Source: None** so the
   github.io URL doesn't serve a stale site.

## Editing content

- **`content/bio.md`** — the full grounding for the chatbot. The whole file is
  injected as the system prompt on every request, server-side, with prompt
  caching enabled. Commit = redeploy = updated chatbot knowledge.
- **`content/timeline.ts`** — typed array of events for `/timeline`.

The bio is **never** sent to the client; only the model receives it.

## Security notes

- API key is server-side only (`app/api/chat/route.ts`).
- Strict security headers in `vercel.json` (HSTS, X-Frame-Options, no MIME sniff,
  restrictive Permissions-Policy, Referrer-Policy).
- Request body validated with Zod before reaching the model.
- Rate-limit: 10 messages / 10 minutes per IP via Upstash.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
```

## Credits

The design language draws from utopiatokyo.com and sutera.ch (immersive
scrolling, cinematic transitions) re-cast through a cyber-noir lens.
