# Brief: Nav padding, label contrast and timeline scrubber fixes

**Size:** S  ·  **Change id:** 2026-11-04-nav-contrast-scrubber-fixes  ·  **Date:** 2026-11-04

## Summary
On desktop the nav bar loses its side padding: the logo touches the left edge of the window and the `/ open` button is cut off on the right. This change restores the padding, makes faint secondary labels readable, and makes the timeline scrubber and the top-left HUD read correctly.

## Why
A design critique of the preview (`harin-portfolio-41zxp5cx7-develop-and-create.vercel.app`, home and timeline at desktop width) found:
1. **The nav has no side padding on desktop.** `.safe-left` and `.safe-right` in `app/globals.css:208` are outside any CSS layer, so they override Tailwind's layered `px-3 sm:px-6` on the header in `components/chrome/Nav.tsx`. The padding becomes `env(safe-area-inset-*)`, which is 0 on desktop. The logo sits flush left and `/ open` is clipped. This is the most visible defect on every page.
2. **Secondary text is too faint.** The base `--color-haze` (#8a96a4 on #07090c) is about 6.6:1, which is fine. Opacity modifiers stacked on top of it are not: the nav codes `00`/`01`/`02` use `opacity-50` (about 2.4:1), and the scrubber year labels use `opacity-60` (about 3:1). The home hints (`press / to open console`, `scroll · or · navigate`) also look dim in the screenshot, so measure them.
3. **The timeline scrubber prints one label per event** with `justify-between`, so "2019" appears twice.
4. **The top-left HUD reads "› current / 2015"**, which looks like "the current year is 2015".

## Who it's for
- **Primary:** a recruiter or hiring manager scanning for 30 seconds. A clipped nav and a repeated year look like bugs and cost credibility on a security-and-product portfolio.
- **Secondary:** low-vision visitors and people on bright or low-quality screens who need readable labels.
- **Their job here:** move between home, timeline and chat, and know which point in the story they're looking at.

## Goals
1. The nav has visible side padding on desktop and mobile, and `/ open` is fully visible.
2. Every text label touched by this change meets WCAG AA contrast (at least 4.5:1).
3. Each year appears once on the timeline scrubber.
4. The top-left timeline HUD label clearly means "the event you're viewing", not "the current year".

## Non-goals
- No proportional (date-scaled) scrubber. Ticks stay evenly spaced, one per event.
- No redesign of the timeline heading size, hero layout or empty right-hand space (all noted in the critique; listed as follow-ups).
- No new design tokens unless the design phase finds an existing token can't reach 4.5:1.
- No changes to `content/timeline.ts`, `content/bio.md` or the chat page.
- No change to the `004%` progress readout.

## User stories
- As a recruiter on a laptop, I want the nav to sit cleanly inside the window so the site looks finished.
- As a low-vision visitor, I want the hints and labels to be readable so I can find the console and the timeline years.
- As a visitor on /timeline, I want the scrubber and HUD to tell me where I am without contradicting each other.

## Acceptance criteria
- **AC-1 (nav padding, desktop):** Given a 1440×900 viewport on any page, when the page loads, then the logo's left edge is at least 16px from the window's left edge, and the `/ open` button's right edge is at least 16px from the window's right edge and fully inside the viewport.
- **AC-2 (nav padding, mobile):** Given a 393px-wide viewport, when any page loads, then the nav content has at least 12px of side padding, there is no horizontal scroll, and every nav link and the `/` button are fully visible.
- **AC-3 (safe areas still work):** Given a device with a non-zero `env(safe-area-inset-left/right)` (for example, an iPhone in landscape), when the page loads, then the nav padding is at least the safe-area inset. Verified by reading the CSS: padding uses `max(env(...), <gutter>)` or something equivalent.
- **AC-4 (contrast):** Given `/` and `/timeline` at 1440px, when the computed color and effective opacity are measured against `--color-bg`, then these all reach at least 4.5:1: the inactive nav links, the nav codes `00`/`01`/`02`, `press / to open console`, `scroll · or · navigate`, the scrubber year labels, the `› timeline` scrubber label, and the top-left HUD label.
- **AC-5 (scrubber years):** Given `/timeline` at desktop width, when the scrubber renders, then each year in `content/timeline.ts` appears exactly once ("2019" once), the number of tick positions still equals the number of events, and the label positions line up with the event positions.
- **AC-6 (HUD label):** Given `/timeline` at desktop width, when the page loads, then the top-left HUD label shows the copy approved in the copy deck (not "current"), and the year below it still updates as the visitor scrolls through events.
- **AC-7 (keyboard):** Given keyboard-only navigation, when the visitor tabs through the nav, then every link and the `/ open` button can be reached, each has a visible focus state, and none is clipped.
- **AC-8 (reduced motion):** Given `prefers-reduced-motion: reduce`, when `/timeline` loads, then the page works as it does today (the fallback layout) with no regressions from this change, and any HUD or scrubber copy that the fallback shows uses the new text.
- **AC-9 (no regressions):** `npm run typecheck` and `npm run test:e2e` pass, and the console shows no new errors or CSP violations on `/`, `/timeline` or `/chat`.

## Affected surfaces
- Pages: `/`, `/timeline`, `/chat` (the nav appears on all three)
- Components: `components/chrome/Nav.tsx`, `components/timeline/TimelineScene.tsx`, `app/page.tsx` (bottom hints)
- Styles: `app/globals.css` (`.safe-*` utilities; possibly `.hud-label`)
- Content: none
- API / config: none (no CSP impact; no new assets)

## Risks and constraints
- **Other components use `.safe-*`.** Fixing their CSS-layer order also changes how they combine with padding everywhere else (for example, `safe-left` on the timeline HUD, `safe-top`/`safe-bottom` in other places). The design phase must list every use and check each one.
- **iOS safe areas.** The fix must not let content slide under the notch in landscape (AC-3).
- **Contrast vs. mood.** Raising the dim labels makes the console look less "faded". Keep the hierarchy by using color, size and weight rather than dropping opacity below AA.
- **Scrubber alignment.** Blanking a duplicate year label must not shift the other labels; ticks stay at one per event.

## Success signal
The next preview screenshot at desktop width shows the logo and `/ open` with even margins, the scrubber reads 2015 · 2019 · · 2021 · 2023 · 2024 · now, and an automated contrast check reports nothing below 4.5:1 on the listed labels.

## Open questions
- Exact copy for the renamed HUD label (for example, "viewing" or "event"). Decided in the design copy deck and checked in content review.
- How the duplicate year is shown: an empty tick, a dot, or a dimmed repeat. Design decides, within AC-4 and AC-5.

## Follow-ups (out of scope)
- Timeline heading size (it currently wraps to 3 lines and pushes the body text down).
- Home hero composition (the gap between the status line and the name, and the empty right-hand side).
- The "CURRENT" vs `EVENT 0N / year` redundancy beyond renaming, and whether `scroll · or · navigate` is accurate on a single-screen home page.
- Restricting green to active/interactive elements only (the decorative rule under the timeline body).
