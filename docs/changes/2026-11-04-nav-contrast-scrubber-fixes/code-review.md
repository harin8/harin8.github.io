VERDICT: PASS_WITH_NOTES

## Validation
- typecheck: pass
- build: pass (Next 16.2.6 Turbopack, all 7 routes generated). I checked the built CSS in `.next/static/chunks/0fm0uf-bqcqfh.css`. Each safe-area utility comes out as the expected `max(env(safe-area-inset-*), …)` rule, and the `sm:` versions come after the base ones. In each `@utility`, the declaration whose value doesn't match is dropped, as it should be.
- I also ran the new spec with `npx playwright test e2e/chrome-timeline.spec.ts`: 13 of 13 passed.
- acceptance criteria covered: AC-1 ✓, AC-2 ✓, AC-3 ✓ (checked by reading the CSS, as the brief allows), AC-4 ✓, AC-5 ✓, AC-6 ✓, AC-7 ✓, AC-8 ✓, AC-9 ✓ (spec passes; nothing in this change touches the CSP or `vercel.json`)
- copy matches copy deck: yes. C1 `› viewing` at `components/timeline/TimelineScene.tsx:167`. C2 to C7 are unchanged in the code.

## Blockers
none

## Should fix
none

## Nits
- `docs/changes/2026-11-04-nav-contrast-scrubber-fixes/design.md:74`: Tailwind v4 scans files under `docs/`, so the example class `safe-x-[0.75rem]` in the design doc ends up as a real rule in the production CSS. It's only a few bytes, but any class name written in a change doc will ship. Fix: add `@source not "../docs";` under `@import "tailwindcss";` in `app/globals.css` (as a separate follow-up).
- `e2e/chrome-timeline.spec.ts:204-206`: the AC-7 test only asserts a visible focus state for links. The `/ open` button's focus style (a border colour change) is never checked, although the test's own comment mentions it. Add `expect(style.border).not.toBe(<rest border>)` for the button, or compare its computed style before and after focus.
- `components/timeline/TimelineScene.tsx:201`: only a duplicate year directly after the same year is hidden. That's fine for today's `content/timeline.ts`, but a repeated year that isn't next to its twin would show twice. A one-line comment saying the data must be in chronological order would stop someone "fixing" this later.

## Good calls
- Moving the `.safe-*` classes into `@utility` with `max(inset, gutter)` versions fixes the root cause (unlayered CSS beating Tailwind utilities) for all three affected components at once. The comment in `app/globals.css:201-206` warns against the bug coming back.
- The BootSequence deviation (`pt-*`/`pr-*` for the sides with no inset, `safe-*-N` for the others) was right. Following the design as written would have put two padding rules on the same side of one element, the same bug again. It is written up in `dev-notes.md`. Scrubber ticks and labels share the same `i/n` position as the `activeYear` calculation, so the fill line reaches a label exactly when the HUD changes, and the spec checks this to within 1px.

Relevant files:
- /Users/harin/Documents/GitHub/harin8.github.io/app/globals.css
- /Users/harin/Documents/GitHub/harin8.github.io/components/chrome/Nav.tsx
- /Users/harin/Documents/GitHub/harin8.github.io/components/chrome/CommandPalette.tsx
- /Users/harin/Documents/GitHub/harin8.github.io/components/hero/BootSequence.tsx
- /Users/harin/Documents/GitHub/harin8.github.io/components/timeline/TimelineScene.tsx
- /Users/harin/Documents/GitHub/harin8.github.io/e2e/chrome-timeline.spec.ts

Memory saved: /Users/harin/Documents/GitHub/harin8.github.io/.claude/agent-memory/code-reviewer/tailwind-v4-layering-and-scanning.md
