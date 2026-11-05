---
name: deploy
description: Ship a change that passed /ship - push its branch, open a PR, smoke-test the Vercel preview, merge only after explicit approval, and verify production on harin.dev.
argument-hint: "[change id]"
disable-model-invocation: true
---

# /deploy

Deployment for harin.dev is git-driven: pushing a branch makes Vercel build a preview, and merging to `main` deploys production. This skill walks that path with checks at every step. Only Harin starts it, and it asks again before the merge.

Change: $ARGUMENTS (if empty, use the newest folder in `docs/changes/` whose `status.md` says "ready to deploy").

## 1. Preflight (stop at the first failure and explain)
- `status.md` shows phases 1–6 done or approved. If any were skipped or failed, list them and ask whether to continue anyway.
- The current branch is the change branch from `status.md`, never `main`.
- `git status --short` shows nothing unexpected. Never stage `.env*`, `.vercel/`, `node_modules/` or screenshots of private data.
- `npm run typecheck` and `npm run build` pass.

## 2. Commit and push
- Commit any remaining work, including the change folder, in the repo's style: `<scope>: <summary>` with a lowercase scope (`timeline:`, `chat:`, `content:`, `mobile:`) and `Change: docs/changes/<id>` in the body.
- `git push -u origin <branch>`.

## 3. Open the pull request
Write `docs/changes/<id>/pr-body.md`, then run `gh pr create --base main --head <branch> --title "<scope>: <summary>" --body-file docs/changes/<id>/pr-body.md`. The body has:
- Summary (from the brief) and the acceptance criteria with their QA results.
- Verdicts from content review, code review and QA, with links to the files.
- Screenshots list, and how to test by hand (from `dev-notes.md`).
- Rollback plan (below).

If `gh` is missing or not signed in, give Harin the URL `https://github.com/harin8/harin8.github.io/compare/main...<branch>?expand=1` and continue once the PR exists.

## 4. Check the Vercel preview
- Find the preview URL from the Vercel check or bot comment: `gh pr checks <number>` and `gh pr view <number> --comments`. If Vercel tools are connected, you can read the deployment and its build logs there instead.
- If the preview build failed, read the build log, fix on the branch, push, and repeat.
- Spawn the `qa-tester` agent in smoke-test mode with the preview URL and the change folder. Save its report as `docs/changes/<id>/preview-smoke.md`.
- If the preview returns 401 or a Vercel login page, Deployment Protection is on: ask Harin to open the preview himself or provide a protection-bypass token, and don't treat it as a failure.

## 5. Merge gate
Show Harin: the PR link, the preview link, the smoke verdict, and any open notes. Ask for an explicit yes to merge.
- On yes: `gh pr merge <number> --squash --delete-branch` (settings will ask him to confirm the command too). He may also merge on GitHub himself; wait for him to say it's done.
- On anything else: stop and record that in `status.md`.

## 6. Verify production
- Wait for the production deployment of the merge commit to finish (Vercel check on `main`, or the Vercel dashboard).
- Spawn `qa-tester` in smoke-test mode against `https://harin.dev`. Save as `prod-smoke.md`.
- If production is broken, tell Harin immediately and offer the rollback.

## 7. Record
Write `deploy.md` (PR, preview URL, merge commit, production check result, date) and mark the change `shipped <date>` in `status.md`. `git switch main && git pull` to leave the repo clean.

## Rollback plan (include in the PR body and offer when needed)
1. Fastest: Vercel dashboard → Deployments → the previous production deployment → **Instant Rollback**.
2. Durable: `git revert <merge commit>` on a new branch, then run it through `/deploy` (skip phases 1–6 with a recorded reason).

Never run `vercel --prod`, `vercel promote`, push to `main`, or force-push. Project settings block these.
