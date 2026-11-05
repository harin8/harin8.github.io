# Claude log: 10 seed entries

Draft for testing the riskiest assumption: **do paraphrased entries still feel real and personal?** Fill in 10 entries, then read them as a recruiter would. If they're interesting, run `/ship` with them as seed content. If they read as bland, the idea needs rethinking before anything gets built.

> This file is a working draft. Don't commit raw prompts, exports or anything you haven't paraphrased.

## Fields

| Field | Rule | Why it exists |
|---|---|---|
| `source` | `code` (Claude Code) or `chat` (claude.ai) | Tells you where it came from; usually decides `kind` |
| `kind` | `building` or `curious` | The two signals: what you're working on vs. what you're exploring |
| `topic` | one of: `security`, `product`, `frontend`, `ai`, `learning` | Builds the topic map. Keep the list short; add one only if 2+ entries need it |
| `month` | `2026-10` style | Feeds the "recent" feed. Month only, never the exact day |
| `question` | ≤ 120 chars, lowercase, **a paraphrase, never your actual words** | The headline a recruiter scans |
| `why` | one sentence: what prompted it | Turns a question into context |
| `decision` | one sentence: what *you* concluded, kept, or rejected | The judgment signal. Separates "uses AI" from "thinks with AI" |
| `ask` *(optional)* | a question a visitor could send to `/chat` | Drives the "Ask my AI about this" button |

Voice follows `brand-voice`: lowercase, terse, no hype words, no emojis, a concrete fact then a short reflection.

## Safety check: run on every entry

- [ ] No employer, client, or colleague names, internal project names, or unreleased products
- [ ] No personal life details you wouldn't put in `bio.md` (health, money, family, job search specifics)
- [ ] No code, logs, file paths, URLs, keys, or anything copied verbatim
- [ ] Would I be fine with a future manager reading this line aloud in an interview? 

If any box fails, generalize it ("a fintech client" → drop it entirely) or cut the entry.

## Examples

These two are built from what's already visible in this repo. **The `why` and `decision` lines are placeholders written to show the shape. Replace them with what actually happened.**

```yaml
- source: code
  kind: building
  topic: ai
  month: 2026-10
  question: how to stream an llm reply to the browser without exposing the api key or the system prompt
  why: building the /chat page on this site, where the model answers as me from a private bio.
  decision: kept the key and the bio server-side only, and returned a generic error so provider failures never reach the visitor.
  ask: how does the chat on this site keep its instructions private?

- source: code
  kind: building
  topic: security
  month: 2026-10
  question: the lightest way to rate-limit a public ai endpoint without adding a database
  why: an open chat endpoint is an open bill. I wanted a guardrail before sharing the link.
  decision: ip-based limits on a hosted redis, skipped entirely when unconfigured. a database would have been more system than the problem needed.
  ask: how is the chat endpoint protected from abuse?
```

An example of a **curious** entry (shape only, invent nothing, write your own):

```yaml
- source: chat
  kind: curious
  topic: product
  month: 2026-10
  question: <something you explored with no deliverable attached>
  why: <what sparked it>
  decision: <what you now believe, or the question it left you with>
```

## Your 10

Aim for roughly 5 `building` + 5 `curious`, and at least 3 different topics. A lopsided map is fine if it's honest, but then it's the story the section tells.

```yaml
- source:
  kind:
  topic:
  month:
  question:
  why:
  decision:
  ask:

# copy the block 9 more times
```

## After filling it in: the gut check

1. Read only the 10 `question` lines. Do they sound like one curious person, or like a search history?
2. Read the `decision` lines. Do at least half show a choice you made, not just a fact you learned?
3. Would a hiring manager learn something about you that `/timeline` doesn't already say?

Three yeses: ship it. Two or fewer: the paraphrase is too thin. Try keeping more of the specific situation (still without names) before giving up on the idea.

## Note for the build

The "Ask my AI about this" button only works if `/chat` knows about these entries. `/chat` is grounded in `content/bio.md` today, so the entries (or a summary) would need to go into the model's context too. Flag this in the `/ship` brief.
