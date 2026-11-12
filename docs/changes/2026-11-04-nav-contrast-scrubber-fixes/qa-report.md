VERDICT: PASS_WITH_NOTES

## Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| AC-1 nav padding, desktop | PASS | Spec `AC-1 desktop gutter` passes on /, /timeline and /chat. Screenshot `timeline-qa-1440.png` shows the logo at about 24px and `/ OPEN` ending at about 1416px. |
| AC-2 nav padding, mobile | PASS | Spec `AC-2 mobile gutter` passes on all three pages. `scrollWidth <= 393` on /, /timeline and /chat. Screenshot `timeline-qa-393.png` shows every nav item visible. |
| AC-3 safe areas | PASS (CSS only) | Spec `AC-3` reads the `.safe-x-3` rule and finds `max(env(safe-area-inset-*), …)` on both sides. I could not emulate a non-zero inset, so this is not confirmed on a notched device. |
| AC-4 contrast | PASS | Spec `AC-4` passes. It measures nav links, nav codes, both home hints, scrubber years, the HUD label and `› timeline`, all at least 4.5:1 against `--color-bg`. It does not measure over MatrixRain glyphs; design.md puts that worst case at 4.57. |
| AC-5 scrubber years | PASS | Spec `AC-5` passes. Probe at 1440 found 7 ticks at x = 40, 234, 429, 623, 817, 1011, 1206. Labels were 2015, 2019, 2021, 2023, 2024 and now, each once. Each label sat at its first event's tick, and the second 2019 tick has no label. At 393 and 768 the labels don't overlap, and 393 is the narrowest case. |
| AC-6 HUD label | PASS | Spec `AC-6` passes. The HUD reads `› viewing` at 393, 768 and 1440. The year changes with scroll: 2015 at the top and 2021 at the midpoint (`timeline-scrolled-qa-393.png`). |
| AC-7 keyboard | PASS | Spec `AC-7` passes. Every nav item takes focus, shows a ring and stays inside the viewport. The `/ open` button border also changes colour on focus. I confirmed that `/` opens the palette and Esc closes it. |
| AC-8 reduced motion | PASS | Spec `AC-8` passes. With reduced motion on, /timeline had no "› current" and no "viewing" text, so it renders the fallback stack with no scrubber or HUD. There were no console errors and no overflow, and `/` still opens the palette. |
| AC-9 no regressions | PASS | `npm run test:e2e` passed 14 of 14. The console had zero errors or CSP violations on all three pages at all three widths. I did not run `npm run typecheck` myself. dev-notes.md reports it clean. |

## Automated suite
- npm run test:e2e: 14 passed, 0 failed
- specs added: none. `e2e/chrome-timeline.spec.ts` already covers AC-1 to AC-9.

## Bugs
| # | Severity | Page @ width | Steps to reproduce | Expected | Actual | Evidence |
|---|---|---|---|---|---|---|
| 1 | minor (pre-existing, not from this change) | /timeline @ 393, fine pointer | Open the pinned scene and scroll to event 04 ("new york, the master's"). | Event text has a comfortable left inset. | The event title and body start about 2px from the viewport's left edge. Phones with a coarse pointer use the fallback stack, so they are unaffected. | `timeline-scrolled-qa-393.png`. The `TimelineNode` h2 reads x=2. |

## Checks
- overflow @393: pass (also pass at 768 and 1440 on /, /timeline and /chat) · console/CSP: pass · keyboard: pass · reduced motion: pass

## Notes
- The command palette now opens 108px from the top at 1440, which matches the intended 12vh offset. The boot log inset was fixed as a side effect and looked right in the home screenshots. The screenshots show the boot log only after it has faded, so I did not measure its inset.
- The scrubber is only visible after scrolling into the pinned scene. At rest the bottom of the viewport is empty, which is existing behaviour.
- The Next dev badge sits over the "2015" label at the bottom-left on 393 in dev. It does not appear in production.
- Evidence is in `docs/changes/2026-11-04-nav-contrast-scrubber-fixes/screenshots/`: `{home,timeline,chat}-qa-{393,768,1440}.png`, `timeline-scrolled-qa-{393,768,1440}.png`, `palette-qa-1440.png` and `timeline-reduced-1440.png`.
- The throwaway probes are `qa-probe.mjs` and `qa-probe2.mjs` in the change folder.
- I stopped the dev server I started.
- I ran `git stash` once by mistake. It stashed nothing because only untracked files exist.
