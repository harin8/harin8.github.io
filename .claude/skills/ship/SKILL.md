---
name: ship
description: Run a change to harin.dev through the full pipeline (brief, design, content review, development, code review, testing) up to the deploy gate. Use "/ship <change>" to start, "/ship continue" to resume, "/ship status" to list changes.
argument-hint: "<what you want to change> | continue [id] | status"
disable-model-invocation: true
---

# /ship: the change pipeline

You are the orchestrator. You run the phases in order, keep the change folder up to date, and stop at the gates. The user is Harin; the site is described in `CLAUDE.md`.

Request: $ARGUMENTS

## Route the request

- `status`: list folders in `docs/changes/`, read each `status.md`, and print a one-line table (id, current phase, state). Stop.
- `continue` or `continue <id>`: open that change (or the newest one not marked `shipped`), read `status.md` and every artifact in the folder, then resume at the first phase that is not done. Stop at the next gate as usual.
- Anything else is a new change: start at phase 0.

## The phases

| # | Phase | Who runs it | Writes | Ends with |
|---|---|---|---|---|
| 0 | Set up | you | `status.md` | - |
| 1 | Product brief | `product-brief` skill, inline | `brief.md` | **Gate A: user approves the brief** |
| 2 | Design | `design-phase` skill, inline | `design.md` | - |
| 3 | Content review | `content-editor` agent | `content-review.md` | **Gate B: user approves design + copy** |
| 4 | Development | you, on the change branch | code, `dev-notes.md` | - |
| 5 | Code review | `code-reviewer` agent | `code-review.md` | - |
| 6 | Testing | `qa-tester` agent | `qa-report.md`, specs | **Gate C: hand off to `/deploy`** |

Every change goes through every phase. Small changes get small phases: a typo fix has a five-line brief and a design section that says "no visual change", but it still gets reviewed and tested.

### 0. Set up
1. Make a short kebab-case slug from the request and a change id `YYYY-MM-DD-<slug>` (today's date).
2. Create `docs/changes/<id>/` and copy `${CLAUDE_SKILL_DIR}/templates/status.md` into it as `status.md`, filling in the id, title, request text and date.
3. Pick the branch name `claude/<slug>-<4 random lowercase letters or digits>` and record it. Do not create it yet.

### 1. Product brief
Invoke the `product-brief` skill with the request and the change folder path. When `brief.md` exists, show the user its summary, the acceptance criteria and the size estimate, and ask for approval.
**Gate A.** Do not start design until the user approves. Apply requested edits to `brief.md` and ask again. Record the approval in `status.md`.

### 2. Design
Invoke the `design-phase` skill with the change folder path. It writes `design.md`, including the copy deck.

### 3. Content review
Spawn the `content-editor` agent with: the change folder path, and "review the copy deck in design.md plus any content/ changes listed in brief.md". Wait for its report before you continue, then save it verbatim as `content-review.md`.
- `CHANGES_REQUIRED`: fix the copy deck in `design.md`, then run the agent again. After 3 rounds with blockers left, stop and ask the user.
- Questions under "Needs Harin's confirmation" go to the user at Gate B.

**Gate B.** Show the user the design direction, the copy deck, the content review verdict and any confirmation questions. Do not write code until the user approves. Record the approval in `status.md`.

### 4. Development
1. `git switch -c <branch>` from an up-to-date `main` (`git fetch origin` first; if the working tree is dirty, stop and ask).
2. Implement exactly what `brief.md` and `design.md` describe, following `CLAUDE.md`. Use the copy deck text word for word.
3. Add or extend a Playwright spec in `e2e/` for each acceptance criterion that a browser can check.
4. Run `npm run typecheck` and `npm run test:e2e` until both pass.
5. Write `dev-notes.md`: files changed and why, anything that deviates from the design and why, how to test by hand, known limitations.
Commit locally with the repo's style (`<scope>: <summary>`, lowercase scope) whenever a coherent step is done. Do not push.

### 5. Code review
Spawn the `code-reviewer` agent with the change folder path and branch name. Wait for its report, then save it verbatim as `code-review.md`.
- Fix every blocker and should-fix (or write in `dev-notes.md` why you didn't), then run the agent again.
- After 3 rounds with blockers left, stop and ask the user.

### 6. Testing
Spawn the `qa-tester` agent with the change folder path. Wait for its report, then save it verbatim as `qa-report.md`.
- On `CHANGES_REQUIRED`: fix the bugs, run `npm run typecheck` and `npm run test:e2e` yourself, then go back to phase 5 for a quick re-review of the fix before testing again.
- After 3 rounds with failures left, stop and ask the user.

**Gate C.** Update `status.md` to "ready to deploy". Tell the user, in a few lines: what changed, the three verdicts, any open notes, and that `/deploy <id>` will push the branch, open a PR, check the Vercel preview, and ask before merging.

## Rules for the whole pipeline

- `status.md` is the source of truth. Update it at the end of every phase, so `/ship continue` works in a new session.
- Never push, open a PR, or merge from this skill. That is `/deploy`, and only the user starts it.
- Agents review independently: give them the folder path and what to look at, not your opinion of the work.
- Save agent reports exactly as returned. Your own commentary goes in `status.md` notes, not inside the report.
- If the user asks to skip a phase, record the skip and the reason in `status.md` and continue. `/deploy` will show skipped phases before merging.
- Between phases, report to the user in one line (phase done, verdict, what's next). Save detail for the gates.
