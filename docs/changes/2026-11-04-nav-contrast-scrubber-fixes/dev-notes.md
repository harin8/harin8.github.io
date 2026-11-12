# Dev notes: Nav padding, label contrast and timeline scrubber fixes

**Branch:** `claude/nav-contrast-scrubber-fixes-dzfm`  ·  **Commits:** `98d5022`, `c517150`, `bde8f54`

## Files changed
| File | Why |
|---|---|
| `app/globals.css` | Replaced the four unlayered `.safe-*` classes with `@utility` definitions, so they live in `@layer utilities` and stop silently beating padding utilities. Added functional variants `safe-{top,bottom,left,right,x}-<n>` (spacing scale) and `-[<length>]` (arbitrary), each `max(env(safe-area-inset-*), value)`. Bare `safe-top/bottom/left/right` are kept for the two TimelineScene call sites that have no padding conflict. A comment warns against mixing `safe-*` and `p*-*` on the same side. |
| `components/chrome/Nav.tsx` | Header: `safe-x-3 sm:safe-x-6 safe-top-3 sm:safe-top-4 pb-3 sm:pb-4` (was `px-3 sm:px-6 py-3 sm:py-4 safe-top safe-left safe-right`). Nav codes: `opacity-50` → `text-haze/90`. Links: added `focus-visible:ring-1 focus-visible:ring-accent/60` (Gate B decision 2). |
| `components/chrome/CommandPalette.tsx` | Overlay: `pt-[8vh] sm:pt-[12vh] … safe-top` → `safe-top-[8vh] sm:safe-top-[12vh]`. The panel now sits at its intended offset (Gate B decision 1). |
| `components/hero/BootSequence.tsx` | `p-5 sm:p-8 safe-bottom safe-left` → `pt-5 pr-5 sm:pt-8 sm:pr-8 safe-bottom-5 safe-left-5 sm:safe-bottom-8 sm:safe-left-8` (Gate B decision 1). |
| `components/timeline/TimelineScene.tsx` | HUD label copy C1 `› viewing`. Scrubber: one `aria-hidden` tick per event at `left: i/n`; year labels absolutely positioned at the same `i/n`, rendered only for the first event of a run of equal years; active year `text-accent`, others `text-haze`; `opacity-60` and `justify-between` removed. `data-testid`s added for the spec. |
| `e2e/chrome-timeline.spec.ts` | New spec covering AC-1 to AC-9 (see below). |

## Deviations from design.md
- **BootSequence classes.** The design said to keep `p-5 sm:p-8` and add `safe-bottom-*`/`safe-left-*`. That would put two utilities on the same side of one element, which is exactly the bug this change removes. I split the padding to `pt-*`/`pr-*` for the sides without an inset. The resulting spacing is what the design intended.
- **Nav height.** As the design predicted, restoring the header's top padding makes the bar about 16px taller at 1440 (≈60px → ≈76px). The timeline HUD at `top-24` (96px) still clears it. Visible in `screenshots/after-timeline-scrolled-1440.png`.

## Acceptance criteria → tests
| AC | Covered by |
|---|---|
| AC-1 | `nav padding › AC-1 desktop gutter on {/,/timeline,/chat}`: logo x ≥ 16, `/ open` right edge ≤ 1424 |
| AC-2 | `nav padding › AC-2 mobile gutter on …`: header padding ≥ 12 each side, `scrollWidth` ≤ 393, every nav item inside the viewport |
| AC-3 | `AC-3 nav padding honours the safe-area inset`: reads the `.safe-x-3` rule from the stylesheet and checks both sides are `max(env(safe-area-inset-*), …)`. Needs a real notched device to confirm visually (below). |
| AC-4 | `AC-4 labels reach 4.5:1`: computes contrast in-browser (canvas-resolved color × ancestor opacity, against `--color-bg`) for nav links, nav codes, both home hints, scrubber years, HUD label, `› timeline`. Home hints are polled until the post-boot fade-in settles. It measures against `--color-bg`, not against MatrixRain glyphs (design computed that worst case as 4.57). |
| AC-5 | `AC-5 scrubber…`: 7 ticks; labels equal unique years in order; each label's x within 1px of its first event's tick |
| AC-6 | `AC-6 HUD label…`: text `› viewing`; year is `2015` at top and `now` after scrolling to the end |
| AC-7 | `AC-7 keyboard…`: tabs through all four nav items, each is focused, links show a box-shadow ring, all inside the viewport |
| AC-8 | `reduced motion › AC-8…`: all 7 event titles visible in the fallback stack; no `› current` text anywhere |
| AC-9 | `AC-9 no console errors…` on all three pages, plus `npm run typecheck` |

Results: `npm run typecheck` clean; `npm run test:e2e` 14/14 passed.

## How to test by hand
1. `npm run dev`, open `/` at 1440: there's an even gutter left of `[HARIN@OPERATOR]` and right of `/ OPEN`.
2. Resize to 393: `[HARIN]` and `/` have about 12px gutters, and there's no sideways scroll.
3. Press `/` (or click it): the console opens below the top edge (8vh on phones, 12vh on desktop), not glued to it.
4. Reload `/`: the boot log sits about 20px (phone) or 32px (desktop) from the bottom-left corner.
5. `/timeline` at 1440: the HUD reads `› VIEWING`. Scroll and watch the fill line: the HUD year changes as the line passes each tick. "2019" appears once, the second 2019 event has a bare tick, and the active year is green.
6. Tab from the logo through the nav: each link shows a thin green ring, including the active one.
7. macOS System Settings → Accessibility → Reduce motion, reload `/timeline`: the stacked fallback, unchanged.
8. iPhone in landscape (or Safari's Responsive Design Mode with a notched device): the nav content clears the notch.

## Known limitations
- AC-3 is verified by reading the CSS. Playwright can't emulate a non-zero `env(safe-area-inset-*)`.
- Home hint contrast is close to the line (4.57) where a MatrixRain glyph passes directly behind the text. It passes, but if the rain gets brighter later, re-check it.
- Before/after screenshots show Next's dev indicator badge in the bottom-left corner. It's dev-only.

## Code review round 1 (PASS_WITH_NOTES)
- Nit 2 applied: the AC-7 test now also checks that the `/ open` button's border color changes on focus.
- Nit 3 applied: a comment in `TimelineScene` explains that duplicate-year hiding relies on `TIMELINE` being chronological.
- Nit 1 deferred: `@source not "../docs";` in `globals.css`, so example class names in change docs don't ship in the CSS. It's a build-config change outside this brief, so it goes on the follow-up list in `status.md`.
