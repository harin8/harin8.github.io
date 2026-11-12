# Backlog

Follow-up items found during `/ship` changes but kept out of their scope. Start one with `/ship <item>`; when it ships, delete its line here.

| # | Item | Source | Size | Notes |
|---|---|---|---|---|
| 1 | Verify notch padding on a real iPhone in landscape | [nav-contrast-scrubber-fixes](changes/2026-11-04-nav-contrast-scrubber-fixes/) AC-3 | check | Verified only by reading the CSS; Playwright can't emulate `env(safe-area-inset-*)`. Not a code change unless it fails. |
| 2 | Decide how smoke tests reach protected previews | nav-contrast-scrubber-fixes deploy | XS | That change's preview was behind Vercel Deployment Protection, so its smoke test was skipped (production smoke passed). Options: a protection-bypass token for `/deploy`, or a Vercel shareable link per preview. |
| 3 | Timeline event text sits ~2px from the left edge | same, [qa-report](changes/2026-11-04-nav-contrast-scrubber-fixes/qa-report.md) bug 1 | S | `/timeline`, pinned scene, < 768px wide with a fine pointer (e.g. a narrow desktop window). `TimelineNode` uses `px-5` inside a centered `max-w-2xl`; check what is eating the inset. Pre-existing. |
| 4 | Stop Tailwind scanning `docs/` | same, [code-review](changes/2026-11-04-nav-contrast-scrubber-fixes/code-review.md) nit 1 | XS | Class names written in change docs (e.g. `safe-x-[0.75rem]`) ship as real CSS. Add `@source not "../docs";` under `@import "tailwindcss";` in `app/globals.css`. |
| 5 | Timeline heading size | same, brief follow-ups | S | Heading wraps to 3 lines at desktop and pushes the body text down. |
| 6 | Home hero composition | same, brief follow-ups | M | Gap between the status line and the name; empty right-hand side at desktop. |
| 7 | `scroll · or · navigate` hint accuracy | same, brief + content review | XS | The home page is a single screen, so "scroll" may be wrong. Copy change, so it needs content review. |
| 8 | Timeline HUD vs `event 0N / year` redundancy | same, brief follow-ups | S | The HUD now reads `› viewing`, but the HUD year and each card's `event 0N / year` header still repeat each other. |
| 9 | Restrict green to active and interactive elements | same, brief follow-ups | S | e.g. the decorative accent rule under the timeline body. |
| 10 | Home hint contrast over MatrixRain is 4.57:1 at worst | same, design accessibility notes | watch | Passes AA. Re-check if the rain gets brighter or denser. |
| 11 | Add an ESLint flat config | CLAUDE.md | S | `npm run lint` has been broken since Next 16 removed `next lint`. |
| 12 | `/favicon.ico` returns 404 | [nav-contrast-scrubber-fixes prod-smoke](changes/2026-11-04-nav-contrast-scrubber-fixes/prod-smoke.md) | XS | Console error on `/` in production. Add `app/favicon.ico` or an `icon` file. Not caused by that change. |
