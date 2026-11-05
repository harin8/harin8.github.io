---
name: brand-voice
description: Voice, positioning and content rules for Harin's portfolio site (the "operator console" site) - audience, tone per surface, lexicon, facts sources, and what is safe to publish. Apply when writing or reviewing any site copy, bio.md, or timeline entries.
user-invocable: false
---

# Portfolio voice and content rules

> Starter version, drawn from the live site copy, `lib/prompt.ts` and `content/`. Harin: edit this freely; every content review uses it.

## Who reads this site
1. **Recruiters and hiring managers for product roles** (primary). They scan in under a minute and want proof of product thinking: problems found, decisions made, outcomes measured.
2. **Engineers and security folks** who enjoy the build and the craft.
3. **Anyone chatting with the operator**, who asks loose questions and gets answers grounded in `bio.md`.

## Positioning
Security engineer and software builder moving into product. The thread through everything: systems thinking, curiosity about why things break, caring about the system around the work. Every new piece of content should strengthen that story or stay out.

## Voice by surface

| Surface | Rules | Example from the site |
|---|---|---|
| UI chrome (nav, HUD labels, buttons, palette) | lowercase, terse, terminal verbs, `›` prompt prefix, `→` for movement | `› trace the timeline →`, `› query the operator` |
| Hero and headings | short, declarative, rhythm over adjectives; uppercase only for the name | `cybersecurity engineer. software builder. learning the craft of product.` |
| Timeline entries | lowercase title, one or two sentences, a concrete fact then a reflective turn | `top-60 finalist out of ~5,000 in TCS Hackquest 3.0. ... security was just systems thinking with stakes.` |
| Errors and status | lowercase, calm, says what to do | `operator unreachable. try again.`, `rate-limited. try again shortly.` |
| `bio.md` | factual, complete sentences, normal capitalization; tone is the system prompt's job, not the bio's | `Led engineering for ... onboarding experience` |
| Chat replies (`lib/prompt.ts`) | concise, a touch dry, no emojis, no exclamation marks, under ~200 words | |

Always: no emojis, no exclamation marks, no hype words ("passionate", "ninja", "rockstar", "cutting-edge"), no sycophancy. Dry is fine; cold is not.

## Lexicon
Use: operator, console, session, trace, query, payload, handshake, signal. Use sparingly so the metaphor stays fun and never hides meaning. A visitor must understand every CTA without knowing the metaphor.

## Writing about work
- Outcome first, then how: "improved setup re-entry 3x (10% → 30%)" beats "worked on the setup flow".
- Numbers need a baseline and a timeframe.
- Name the decision Harin made or influenced, not only the task.
- Dates: `May 2024 – Present` (en dash, month name, no ordinal). Years alone in the timeline.

## Sources of truth
- Facts: `content/bio.md` (career, education, skills) and `content/timeline.ts` (life events). They must agree with each other and with any page copy.
- Anything new and factual needs Harin's confirmation before it ships.

## Safe to publish?
`bio.md` is server-only, but the operator can repeat anything in it to anyone. Treat it as public:
- No non-public employer information, internal project names, or unreleased products.
- Employer metrics only if Harin confirms they're approved for public sharing.
- Contact details: only the email and links already listed. No phone or home address.
- No credentials, tokens, or anything that looks like one.
