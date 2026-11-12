VERDICT: PASS_WITH_NOTES

Smoke test of production (https://harin-portfolio-tau.vercel.app), merge e9be485. Deployment Protection is off. `/`, `/timeline` and `/chat` all returned 200.

## Acceptance criteria
| AC | Result | Evidence |
|---|---|---|
| AC-1 nav padding, desktop | PASS | At 1440, header padding-left/right is 24px. The logo's left edge is at x=24 and the `/ open` button's right edge is at x=1416. Measured on `/`, `/timeline` and `/chat`. |
| AC-2 nav padding, mobile | PASS | At 393, header padding is 12px on both sides. The logo starts at 12 and the `/` button ends at 381. `scrollWidth` = `innerWidth` = 393 on all three pages, and every nav link and the button is inside the viewport. |
| AC-3 safe areas | PASS | The deployed CSS has `.safe-x-3 { padding-left: max(env(safe-area-inset-left), calc(var(--spacing) * 3)); … }`, with matching `safe-top-*`, `safe-bottom-5` and `safe-left-5` rules. I did not test a device with a non-zero inset. |
| AC-4 contrast | PASS | Computed colors at 1440 with no opacity on any ancestor:<br>- Nav codes `00`/`01`/`02`: haze at 0.9 alpha, about 5.5:1.<br>- Inactive nav links, scrubber year labels, the `› timeline` scrubber label, the HUD label and the home hints: `rgb(138,150,164)`, 6.6:1.<br>- Active year and active nav link: `rgb(0,255,156)`.<br>The design notes the hints have a 4.57:1 worst case over a MatrixRain glyph. I did not measure that. |
| AC-5 scrubber years | PASS | At 1440 there are 6 year labels (2015, 2019, 2021, 2023, 2024, now) and "2019" appears once. There are 7 ticks at x = 40, 234, 429, 623, 817, 1011, 1206. The labels sit on the tick x-positions, and the second 2019 tick has no label as designed. |
| AC-6 HUD label | PASS | `timeline-hud-label` reads `› viewing`. The active year was "2021" after scrolling. I only saw one position, so I did not step through every event to confirm the year updates. |
| AC-7 keyboard | PASS | Tab order is logo, `/home`, `/timeline`, `/chat`, `/ open`, then the chat input. All are within x=24–1416. The links show a box-shadow ring, the logo shows an auto outline, and the `/ open` button turns its border to accent when focused. |
| AC-8 reduced motion | NOT TESTED | Smoke mode, so I did not emulate it. The design says the fallback layout has no HUD or scrubber. |
| AC-9 no regressions | PARTIAL | I did not run the typecheck or the e2e suite, which is outside smoke scope. The console had no CSP errors and no errors at all at 393 on any page. At 1440 the only console error was a `/favicon.ico` 404 on `/` (see Notes). |

## Automated suite
- Not run (smoke mode).
- Specs added: none.

## Bugs
| # | Severity | Page @ width | Steps to reproduce | Expected | Actual | Evidence |
|---|---|---|---|---|---|---|
| 1 | minor | `/` @ 1440 | Load `/` and read the console. | No console errors. | `Failed to load resource: 404` for `/favicon.ico`. It is not a CSP violation and is probably not caused by this change. | Playwright console log. |

## Checks
- overflow @393: pass (`/`, `/timeline`, `/chat`)
- console/CSP: pass (no CSP errors; only the favicon 404 noted above)
- keyboard: pass
- reduced motion: not tested (smoke mode)

## Notes
- Page titles are per page: `/` is "harin // operator console", `/timeline` is "harin // timeline", and `/chat` is "harin // chat". Only `/` matches the smoke-test title string exactly. This looks intentional.
- `/timeline` at 393 with a coarse pointer uses the fallback stack, so the scrubber was only checked at 1440. I did not test the 768 width or the fine-pointer 393 case.
- Screenshots in `/Users/harin/Documents/GitHub/harin8.github.io/docs/changes/2026-11-04-nav-contrast-scrubber-fixes/screenshots/`:
  - `prod-home-393.png`, `prod-home-1440.png`
  - `prod-timeline-393.png`, `prod-timeline-scrolled-1440.png`
  - `prod-chat-393.png`, `prod-chat-1440.png`
  - `prod-open-button-focus-1440.png`
- `prod-timeline-1440.png` (unscrolled) was not captured.
- A Node probe script via Bash was denied, so I used the Playwright MCP tools instead.
