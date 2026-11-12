# Design: Nav padding, label contrast and timeline scrubber fixes

**Change id:** 2026-11-04-nav-contrast-scrubber-fixes  ·  **Brief:** brief.md  ·  **Direction:** "Same console, honest instruments"

## Direction
This change keeps the look and fixes the instruments. The console stays as it is, and the parts that misreport stop doing so: the nav sits inside the frame, dim labels become readable, the scrubber shows each year once at the point where that event starts, and the HUD names what it is showing. The brief is size S, so there is one direction and no new visual language.

## Baseline (measured 2026-11-12, local dev server)
Screenshots: `screenshots/before-{home,timeline}-{393,1440}.png`.

| Width | Header padding-left / right | Logo left edge | `/` button right edge |
|---|---|---|---|
| 393 | 0px / 0px | 0 | 393 (flush with viewport) |
| 1440 | 0px / 0px | 0 | 1440 (flush with viewport) |

The bug hits mobile too, not only desktop. On a phone in portrait, `env(safe-area-inset-left/right)` is 0, so the unlayered `.safe-left`/`.safe-right` wipe out `px-3`.

### Root cause and blast radius
`.safe-top/-bottom/-left/-right` in `app/globals.css` are plain CSS outside any `@layer`. Unlayered CSS beats Tailwind's `@layer utilities`, so wherever a `.safe-*` class shares an element with a padding utility on the same side, the utility is discarded. Every use of the classes:

| File | Classes on the element | Today | Affected? |
|---|---|---|---|
| `components/chrome/Nav.tsx:16` | `px-3 sm:px-6 py-3 sm:py-4 safe-top safe-left safe-right` | left, right **and top** padding are 0 | **yes**: the brief's bug, plus the header's top padding |
| `components/chrome/CommandPalette.tsx:280` | `pt-[8vh] sm:pt-[12vh] … safe-top` | `pt` is 0, so the palette sits at the top of the screen | **yes**: same bug, not in the brief |
| `components/hero/BootSequence.tsx:54` | `p-5 sm:p-8 safe-bottom safe-left` | bottom and left padding are 0, so the boot log touches the corner | **yes**: same bug, not in the brief |
| `components/timeline/TimelineScene.tsx:166` | `left-6 sm:left-10 … safe-left` | positioned with `left-*`, so there is no padding to conflict with | no |
| `components/timeline/TimelineScene.tsx:176` | `bottom-10 … safe-bottom` | no padding to conflict with | no |

A fix to the utilities fixes all three affected sites. Each one gets back the spacing its author wrote. Leaving two of them broken in the same file would be odd, so they're in scope as a side effect (see Open questions).

## Layout
| Width | Layout |
|---|---|
| 393 (phone) | Nav: 12px side gutter (`3`), or the safe-area inset if larger. The logo reads `[harin]` and the links stay as they are now. The `/` button's right edge is ≥ 12px from the viewport edge, with no horizontal scroll. Timeline: phones with coarse pointers use the fallback stack (no HUD, no scrubber), so only the nav changes there. |
| 768 (tablet) | Nav: 24px gutter (`sm:6`). Timeline: pinned scene with the scrubber at full width minus the `left-10/right-10` insets. 7 tick slots of about 98px each, so the labels fit easily. |
| 1440 (desktop) | Nav: 24px gutter. The logo's left edge is at 24px and the `/ open` button's right edge at 1416px. The header's top/bottom padding also comes back (`sm:py-4`), so the bar is about 8px taller than in the broken baseline. That's the height it was designed at. Timeline: the HUD label is at the same position with new copy, and the scrubber is restructured (below). |

### Scrubber (pinned timeline only)
```
› timeline                                                    004%
|━━━━━━━━|────────|────────|────────|────────|────────|──────────
2015     2019              2021     2023     2024     now
```
- **Positioning:** each event `i` of `n` gets a tick and a label anchored at `left: i/n × 100%`. That is the scroll progress where `activeYear` switches to that event (see `Math.floor(progress * count)` in `TimelineScene`). The fill line crosses a label at the moment the HUD changes to it, which is how AC-5's "label positions line up with event positions" is met. `justify-between` is removed.
- **Labels are left-aligned at their tick** (no centering), so the first label doesn't hang off the left edge. The last label ("now") starts at 6/7 ≈ 86% and fits inside the bar.
- **Ticks:** a 1px × 5px mark rising from the track at each `i/n`, `bg-haze/50`. There is one tick per event (7 ticks, AC-5). The tick at 0 coincides with the track start. The ticks are decorative and `aria-hidden`.
- **Duplicate years:** when an event has the same `year` as the previous one, its tick stays and its label is omitted (renders empty). So "2019" shows once at the first 2019 event, and the second 2019 event has a bare tick. No dot and no dimmed repeat: the tick already says "an event happens here".
- **QA note:** the second 2019 tick having no label is intended, not a bug. The HUD reads `viewing 2019` on both 2019 events and `viewing now` on the last.
- **Active year:** the label whose year equals `activeYear` is `text-accent`, and the others are `text-haze`. For the second 2019 event, the existing "2019" label stays accent, which is correct because the HUD also says 2019.
- **Narrow desktop windows** (fine pointer, ≤ 767px, so not the fallback): at 393px wide each slot is about 49px. "2015" in VT323 14px is about 30px, so the labels still fit and don't overlap. QA should confirm at 393 with a fine pointer.

## Components
| Component | Status | Path | Notes |
|---|---|---|---|
| Safe-area utilities | change | `app/globals.css` | Replace the four unlayered classes with Tailwind v4 `@utility` definitions (see Implementation notes). |
| `Nav` | change | `components/chrome/Nav.tsx` | Swap padding classes to the new safe utilities. Nav codes change from `opacity-50` to `text-haze/90`. |
| `CommandPalette` | change (side effect) | `components/chrome/CommandPalette.tsx` | `pt-[8vh] sm:pt-[12vh] safe-top` becomes `safe-top-[8vh] sm:safe-top-[12vh]`. No other change. |
| `BootSequence` | change (side effect) | `components/hero/BootSequence.tsx` | `p-5 sm:p-8 safe-bottom safe-left` becomes `p-5 sm:p-8` plus `safe-bottom-5 sm:safe-bottom-8 safe-left-5 sm:safe-left-8`. No other change. |
| `TimelineScene` | change | `components/timeline/TimelineScene.tsx` | HUD label copy (C1). Scrubber restructured as above, with `opacity-60` removed. |
| `app/page.tsx` bottom hints | no change | `app/page.tsx` | Measured as passing (see Accessibility). Listed so QA measures them. |
| `TimelineNode` | no change | | |

### Implementation notes (safe-area utilities)
Use Tailwind v4 functional utilities so they live in `@layer utilities` and take the gutter as a value:

```css
@utility safe-top-*    { padding-top:    max(env(safe-area-inset-top),    --value(--spacing-*, [length])); }
/* …same for bottom, left, right… */
@utility safe-x-*      { padding-left:  max(env(safe-area-inset-left),  --value(--spacing-*, [length]));
                         padding-right: max(env(safe-area-inset-right), --value(--spacing-*, [length])); }
@utility safe-top      { padding-top:    env(safe-area-inset-top); }
/* …bare safe-bottom/left/right kept for the TimelineScene call sites… */
```
- If `--value(--spacing-*)` doesn't resolve a bare integer in the installed Tailwind version, use `--value(integer)` with `calc(var(--spacing) * <n>)`, or fall back to arbitrary values (`safe-x-[0.75rem]`). The required behaviour is `padding = max(inset, gutter)` (AC-3). The exact syntax is the developer's call; record it in `dev-notes.md`.
- Never put a `.safe-*` class and a `p*-*` utility for the same side on one element. That's the bug class. Add a one-line comment above the utilities in `globals.css` saying so.
- Nav header: `safe-x-3 sm:safe-x-6 safe-top-3 sm:safe-top-4 pb-3 sm:pb-4` (replaces `px-3 sm:px-6 py-3 sm:py-4 safe-top safe-left safe-right`).

## Tokens
- Colors: `--color-haze` for labels, codes, ticks and inactive years. `--color-accent` for the active year and the HUD year value. No raw hex.
- Type: unchanged. `.hud-label` (VT323 14px) for the HUD label, scrubber labels and hints. `font-mono` in the nav.
- New tokens: **none**. Every label reaches AA with existing tokens and opacity modifiers at or above `/90`.

## States
| Element | Default | Hover | Focus-visible | Loading / empty / error |
|---|---|---|---|---|
| Nav link (inactive) | label `text-haze`, code `text-haze/90` | label `text-ink` (unchanged) | `text-accent`, no outline (unchanged) | - |
| Nav link (active) | label `text-accent` + 1px underline, code `text-haze/90` | unchanged | unchanged | - |
| `/ open` button | unchanged | unchanged | unchanged | - |
| Scrubber year label | `text-haze` | not interactive | not focusable | duplicate year renders no label (tick only) |
| Scrubber year label (active) | `text-accent` | - | - | - |
| Scrubber tick | `bg-haze/50`, decorative | - | - | - |
| HUD label | `text-haze`, copy C1 | - | - | - |

Focus states aren't redesigned here, but AC-7 needs focus to be *visible and not clipped*. With the gutter back, the `/ open` button's border is no longer cut off at the viewport edge. The nav links' focus-visible is a color change only (`text-accent`). On an inactive link that is haze to accent, a clear change. On the **active** link it's accent to accent, so focus on the current page's link is not visible today. See Open questions. The active link already has a permanent underline, so an underline on focus wouldn't show either. I recommend a ring instead: `focus-visible:ring-1 focus-visible:ring-accent/60` on all nav links. It's cheap and in scope for AC-7.

## Motion
- The scrubber fill keeps its existing `transition-[width]`. The active year's label color switch is instant, which suits a console readout.
- Ticks and labels don't animate.
- Reduced motion: the timeline uses the fallback stack, which renders no HUD and no scrubber. That's unchanged (AC-8). The nav and palette changes are static.
- Touch devices: no change. Phones under 768px already use the fallback.

## Accessibility
Contrast against `--color-bg` `#07090c`, computed with the WCAG formula:

| Element | Before | After |
|---|---|---|
| Nav code `00/01/02` | haze @ 50% = **2.43** ✗ | `text-haze/90` = **5.53** ✓ |
| Nav label, inactive | haze = 6.63 ✓ | unchanged |
| Nav label, active | accent = 14.98 ✓ | unchanged |
| Scrubber year labels | haze @ 60% = **3.03** ✗ | `text-haze` = **6.63** ✓; active `text-accent` = 14.98 ✓ |
| `› timeline` scrubber label | haze = 6.63 ✓ | unchanged |
| HUD label (C1) | haze = 6.63 ✓ | unchanged color, new copy |
| `press / to open console`, `scroll · or · navigate` | haze = 6.63 ✓ | unchanged. Worst case over a MatrixRain glyph (accent at about 17.5% effective opacity behind the text) is **4.57** ✓, a thin margin. They look dim because VT323 at 14px is a thin face, not because of color. Not changed here: a size bump would move the hero composition, which the brief lists as a follow-up. |

The nav sits on a 70% `bg` blend over page content. On `/` the MatrixRain behind it can lift the local background slightly. `/90` (5.53) leaves headroom that `/80` (4.57) wouldn't, which is why `/90` was chosen over `/80`.

- Headings / landmarks: unchanged. `header` > `nav`, one `h1` per page.
- Keyboard: tab order unchanged (logo, /home, /timeline, /chat, `/ open`). The scrubber isn't focusable and doesn't need to be.
- Aria: scrubber ticks are `aria-hidden`. Year labels stay as text. Omitted duplicate labels render no text node, so screen readers don't hear "2019" twice. No aria-live on the HUD year (it would announce on every scroll step).

## Copy deck
| ID | Where | Text (verbatim) | Max chars | Notes |
|---|---|---|---|---|
| C1 | `/timeline` top-left HUD label, above the active year (pinned view only) | `› viewing` | 12 | **Replaces** `› current`. "viewing 2019" names the event on screen. "event" was rejected because each node already says `event 0N / year`, so it would repeat. "now" was rejected because the last event's year is literally `now`. Rendered uppercase by `.hud-label`. |
| C2 | `/timeline` scrubber labels | Values of `TIMELINE[i].year` from `content/timeline.ts`, shown once per run of equal years: `2015`, `2019`, `2021`, `2023`, `2024`, `now` | 4 | Content unchanged; rendering rule changes. |
| C3 | `/timeline` scrubber heading | `› timeline` | - | Unchanged. Listed for review completeness. |
| C4 | Nav codes | `00`, `01`, `02` | 2 | Unchanged text; color changes. |
| C5 | Nav links | `/home`, `/timeline`, `/chat` | - | Unchanged. |
| C6 | Nav palette button | visible `/` + `open` (≥ 640px); aria-label `Open command palette` | - | Unchanged. |
| C7 | Home bottom hints | `press / to open console` (≥ 640px), `› open console` (< 640px), `scroll · or · navigate` | - | Unchanged. The brief lists "scroll · or · navigate" accuracy as a follow-up. |

The only new user-facing string is **C1**.

## Assets and CSP
None. No new images, fonts, scripts or network calls, and no `vercel.json` change.

## Open questions
1. **Side-effect fixes to `CommandPalette` and `BootSequence`.** These have the same `.safe-*` bug, and the utility change fixes them whether we want it or not, unless their classes are rewritten to keep today's zero padding. Recommendation: accept it. The palette moves down to its intended 8vh/12vh offset and the boot log gets its intended 20/32px inset. The brief's risk section already asks for every use to be checked. **Needs Harin's OK at Gate B.**
2. **Focus visibility on the active nav link** (AC-7). Recommendation: add `focus-visible:ring-1 focus-visible:ring-accent/60` to all nav links (a ring, because the active link already has an underline). Without it, focusing the current page's link shows no change.
3. HUD copy C1 (`› viewing`) goes to content review.
