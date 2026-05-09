# Project Instructions

Personal site (`harin.dev`) — Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, deployed on Vercel. One streaming LLM endpoint at `/api/chat` grounded in `content/bio.md`.

## Tech Stack
- Next.js 16 (App Router only) + React 19 + TypeScript 5.7 strict, ES2022
- Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config`)
- `@google/genai` (Gemini 2.5 Flash, streaming) — **not** Anthropic
- Upstash Redis + Ratelimit (rate-limit only, no DB)
- Zod for input validation
- GSAP / Lenis / Framer Motion for animation
- Turbopack dev (`next dev --turbopack`)

## Code Style
- Strict TS, no `any`. Use `unknown` + Zod narrowing at boundaries.
- Public functions get explicit param + return types; let locals infer.
- React: named `interface XxxProps`, no `React.FC`.
- Files: PascalCase components (`Terminal.tsx`), camelCase utils (`rateLimit.ts`), kebab-case dirs.
- Path alias `@/*` is the project root.
- No `console.log` in checked-in code; `console.error`/`console.warn` only for server-side error paths.

## Build & Run
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint` (Next built-in)
- Typecheck: `npm run typecheck`

Env required: `GEMINI_API_KEY`. Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate-limit silently skipped without them).

## Project Structure
- `app/` — pages (`/`, `/chat`, `/timeline`) + API route (`api/chat/route.ts`)
- `components/` — `chrome/`, `chat/`, `hero/`, `timeline/`, `fx/`
- `content/` — `bio.md` (LLM grounding, **server-only**) and `timeline.ts`
- `lib/` — `gemini.ts`, `prompt.ts`, `rateLimit.ts`, `siteUrl.ts`
- `vercel.json` — security headers (CSP, HSTS, frame-ancestors none, etc.)

## Critical Rules
- `content/bio.md` is the LLM system instruction. Never expose it to the client. Treat it as docs *for the model*, not the user.
- API key handling lives in `lib/gemini.ts` and `app/api/chat/route.ts` — keep `process.env.GEMINI_API_KEY` server-side only.
- All untrusted input through Zod before reaching providers.
- Never leak provider errors to the client — log server-side, return a generic message (see existing pattern in `app/api/chat/route.ts`).
- CSP in `vercel.json` is strict. Adding external scripts/images/fonts requires editing `connect-src`/`script-src`/`img-src` deliberately.

## Testing
**No tests, no CI in this repo yet.** Don't claim coverage in PR descriptions. If adding tests, Playwright is the intended choice (matches the TS rule pack).

## Conventions
- Branches: `claude/<short-desc>-<id>` for AI-generated work, target `main`.
- Commits: lowercase scope prefix common (`mobile: ...`, `chat: ...`). Not enforced.
- PRs reviewed and merged on GitHub; Vercel auto-deploys previews on push.

## Don't
- Don't add a database, ORM, or auth layer — Upstash is only used for IP rate-limit.
- Don't switch the LLM SDK without updating `lib/gemini.ts`, `lib/prompt.ts`, and the role-mapping in `app/api/chat/route.ts` (Gemini uses `model`, not `assistant`).
- Don't disable `reactStrictMode` or `poweredByHeader: false` in `next.config.ts`.
- Don't introduce `tailwind.config.js` — v4 is config-via-CSS.

## ECC Skill Routing

Classified via `/everything-claude-code:agent-sort`. Skills resolve through the global plugin cache; this section is the routing decision, not a copy.

**DAILY** (first-class for this repo — prefer these when relevant):
- `frontend-patterns`, `nextjs-turbopack`, `api-design`, `coding-standards`
- `seo`, `accessibility`, `security-review`, `code-review`, `browser-qa`
- `git-workflow`, `prp-commit`, `prp-pr`
- `ui-ux-pro-max:ui-ux-pro-max`, `update-config`

**Skip — wrong stack for this repo:**
- `claude-api` — repo uses `@google/genai`, not the Anthropic SDK
- Any database/ORM skill (`postgres-patterns`, `clickhouse-io`, `database-migrations`, `jpa-patterns`, `kotlin-exposed-patterns`) — no DB; Upstash is rate-limit only
- Any non-TS language skill (Python, Kotlin, Swift, Java/Spring, Flutter/Dart, Rust, Go, C++, PHP/Laravel, Perl, .NET/C#, Vue/Nuxt)
- `bun-runtime` — repo uses Node + npm
- Any Web3/crypto skill (`evm-token-decimals`, `nodejs-keccak256`, `defi-amm-security`, etc.)

**Defer until prerequisites land:**
- Testing skills (`tdd-workflow`, `e2e-testing`, `test-coverage`) — promote to DAILY when Playwright is added
- `github-ops`, `deployment-patterns` — promote when CI lands in `.github/`

Everything else stays as LIBRARY: reachable via global plugin search, not preloaded.
