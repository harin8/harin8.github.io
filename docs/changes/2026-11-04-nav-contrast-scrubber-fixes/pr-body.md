## Summary
On every page the nav had no side or top padding: the logo was flush with the left edge and `/ open` was clipped on the right. The cause was the unlayered `.safe-*` classes in `app/globals.css`, which beat Tailwind's padding utilities. The same bug also put the command palette at the very top of the screen and pushed the boot log into the corner.

This PR:
- turns the safe-area classes into Tailwind `@utility` definitions, with `safe-{side}-<n>` = `max(env(safe-area-inset-*), gutter)`, and uses them in `Nav`, `CommandPalette` and `BootSequence`
- raises faint labels to WCAG AA: nav codes from 2.4:1 to 5.5:1, scrubber years from 3.0:1 to 6.6:1
- adds a focus ring to nav links, which was invisible on the active link
- rebuilds the timeline scrubber with one tick per event at the scroll point where it becomes active, each year labelled once, and the active year in accent
- renames the timeline HUD label from `› current` to `› viewing`

Change folder: `docs/changes/2026-11-04-nav-contrast-scrubber-fixes/`

## Acceptance criteria
| AC | What | QA |
|---|---|---|
| AC-1 | Desktop: logo and `/ open` ≥ 16px from the edges on /, /timeline, /chat | PASS |
| AC-2 | 393px: ≥ 12px side padding, no horizontal scroll, all nav items visible | PASS |
| AC-3 | Padding ≥ safe-area inset (`max(env(...), gutter)`) | PASS (verified from the CSS; check on a notched device) |
| AC-4 | Listed labels ≥ 4.5:1 on / and /timeline | PASS |
| AC-5 | Each year once on the scrubber, one tick per event, labels aligned | PASS |
| AC-6 | HUD reads `› viewing`, year follows scroll | PASS |
| AC-7 | Keyboard reaches every nav item with a visible, unclipped focus | PASS |
| AC-8 | Reduced-motion fallback unchanged | PASS |
| AC-9 | Typecheck and e2e pass, no console or CSP errors | PASS (e2e 14/14) |

## Reviews
- Content review: **PASS_WITH_NOTES** ([content-review.md](docs/changes/2026-11-04-nav-contrast-scrubber-fixes/content-review.md))
- Code review: **PASS_WITH_NOTES** ([code-review.md](docs/changes/2026-11-04-nav-contrast-scrubber-fixes/code-review.md))
- QA: **PASS_WITH_NOTES** ([qa-report.md](docs/changes/2026-11-04-nav-contrast-scrubber-fixes/qa-report.md))

The only bug found was pre-existing and is logged as a follow-up in `status.md`.

## Screenshots
In `docs/changes/2026-11-04-nav-contrast-scrubber-fixes/screenshots/`:
- before: `before-{home,timeline}-{393,1440}.png`
- after: `after-home-{393,1440}.png`, `after-timeline-{393,1440}.png`, `after-timeline-scrolled-{393,1440}.png`
- QA: `{home,timeline,chat}-qa-{393,768,1440}.png`, `timeline-scrolled-qa-*.png`, `palette-qa-1440.png`, `timeline-reduced-1440.png`

## How to test by hand
1. `/` at 1440: there's an even gutter left of `[HARIN@OPERATOR]` and right of `/ OPEN`.
2. Resize to 393: about 12px gutters, and no sideways scroll.
3. Press `/`: the console opens below the top edge, not glued to it.
4. `/timeline`: the HUD reads `› VIEWING`. Scroll and the year changes as the fill line passes each tick. "2019" appears once and the active year is green.
5. Tab through the nav: every link shows a thin green ring, including the active one.
6. Turn on reduced motion and open `/timeline`: the stacked fallback is unchanged.
7. An iPhone in landscape: the nav clears the notch.

## Rollback plan
1. Fastest: Vercel dashboard → Deployments → the previous production deployment → **Instant Rollback**.
2. Durable: `git revert <merge commit>` on a new branch, then run it through `/deploy`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
