---
name: product-brief
description: Turn a requested change to the portfolio site into a short product brief with goals, scope and testable acceptance criteria. Used as phase 1 of /ship; also usable alone as "/product-brief <idea>" to think a change through before building.
argument-hint: "<change idea> [change folder]"
---

# Product brief

Write the brief a good PM would want before anyone designs or codes: why this change, for whom, what "done" means. Keep it as short as the change allows.

Input: $ARGUMENTS
If no change folder is given, create `docs/changes/<YYYY-MM-DD>-<slug>/` and write `brief.md` there.

## Steps

1. **Understand the ground.** Read `CLAUDE.md`. Find the pages, components and content files the request touches (grep, don't guess). If it touches what visitors learn about Harin, skim `content/bio.md` and `content/timeline.ts`.
2. **Restate the request** in one sentence, in terms of what a visitor gets.
3. **Ask only what changes the brief.** Use AskUserQuestion for up to 4 questions, each with concrete options and a recommended one first. Typical unknowns: the goal (more recruiter clicks? clearer PM story? delight?), the audience, scope edges, and whether existing content must stay. Skip questions the code or the request already answers. If the user is not around, take the most reasonable reading and list it under open questions.
4. **Write `brief.md`** from `${CLAUDE_SKILL_DIR}/template.md`.
5. **Self-check before handing back:**
   - Every acceptance criterion is observable and testable (in a browser, or by reading one file), written as Given / When / Then.
   - UI changes include criteria for 393px width, keyboard access, and reduced motion.
   - Content changes include a criterion that facts match `bio.md` / `timeline.ts`.
   - Non-goals name the tempting extras you're deliberately not doing.
   - Risks cover the project's sharp edges when they apply: the CSP in `vercel.json`, `bio.md` being quotable by the chatbot, Gemini quota and rate limits, animation performance on phones.

Return a short summary to the caller: one-line problem, the acceptance criteria list, size (S/M/L), and open questions.
