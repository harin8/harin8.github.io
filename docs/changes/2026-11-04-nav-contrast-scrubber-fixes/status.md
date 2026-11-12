# Nav padding, label contrast and timeline scrubber fixes

- **id:** 2026-11-04-nav-contrast-scrubber-fixes
- **request:** "fix nav padding, low-contrast labels and timeline scrubber."
- **branch:** claude/nav-contrast-scrubber-fixes-dzfm
- **started:** 2026-11-04
- **current:** gate C, ready to deploy

| # | Phase | State | Artifact | Notes |
|---|---|---|---|---|
| 1 | Product brief | done | brief.md | Q&A: unique years, even spacing; rename HUD label |
| A | Gate: brief approved | approved 2026-11-12 | | |
| 2 | Design | done | design.md | 1 new string (C1); 2 open questions for Gate B |
| 3 | Content review | done (PASS_WITH_NOTES, round 1) | content-review.md | should-fix #2 and nits applied; #1 is a QA check |
| B | Gate: design + copy approved | approved 2026-11-12 | | accepted side-effect fixes + nav focus ring |
| 4 | Development | done | dev-notes.md | typecheck clean, e2e 14/14 |
| 5 | Code review | done (PASS_WITH_NOTES, round 1) | code-review.md | nits 2-3 applied, nit 1 deferred |
| 6 | Testing | done (PASS_WITH_NOTES, round 1) | qa-report.md | 1 pre-existing minor bug, logged as follow-up |
| C | Ready to deploy | ready 2026-11-12 | | |
| 7 | Deploy | pending | deploy.md | |

States: `pending` · `in progress` · `done (<verdict>, round N)` · `approved <date>` · `skipped (<reason>)` · `shipped <date>`

## Log
- 2026-11-04: created. Request follows a /design:design-critique of the home and timeline screenshots from preview `harin-portfolio-41zxp5cx7-develop-and-create.vercel.app`.
- 2026-11-04: brief.md written (size S, 9 ACs); awaiting Gate A
- 2026-11-12: Gate A approved by Harin; starting design
- 2026-11-12: design.md written; before screenshots in screenshots/. Found same .safe-* override in CommandPalette and BootSequence (side-effect fix, Gate B question)
- 2026-11-12: content review PASS_WITH_NOTES. Fixed haze ratio in brief (6.4 -> 6.6), color spelling, added QA note on the unlabeled 2019 tick. Follow-up kept from brief: `scroll · or · navigate` accuracy.
- 2026-11-12: Gate B approved by Harin, both open questions accepted as recommended
- 2026-11-12: development done on claude/nav-contrast-scrubber-fixes-dzfm (3 commits). One deviation: BootSequence padding split by side (see dev-notes)
- 2026-11-12: code review PASS_WITH_NOTES. Follow-up: add `@source not "../docs";` to globals.css so doc examples don't ship as CSS
- 2026-11-12: QA PASS_WITH_NOTES, AC-1..AC-9 all pass. Probe scripts moved out of the change folder.
- 2026-11-12: ready to deploy. Run `/deploy 2026-11-04-nav-contrast-scrubber-fixes`.

## Follow-ups (not in this change)
- Pre-existing: on /timeline at <768px with a fine pointer, TimelineNode text sits ~2px from the left edge (qa-report bug 1).
- Add `@source not "../docs";` to globals.css so class names in change docs don't ship as CSS (code-review nit 1).
- Verify AC-3 on a real notched device in landscape after the preview deploys.
- From the brief: timeline heading size, home hero composition, `scroll · or · navigate` accuracy, green restricted to active elements.
