# Deploy: Nav padding, label contrast and timeline scrubber fixes

- **Date:** 2026-11-12
- **PR:** https://github.com/harin8/harin8.github.io/pull/10 (squash-merged, branch deleted)
- **Merge commit:** `e9be4853debea24ed45e3d918ab5c74aa1f581e3`
- **Preview:** https://harin-portfolio-git-claude-nav-contra-6b0125-develop-and-create.vercel.app (built OK)
- **Preview smoke test:** skipped. The preview was behind Vercel Deployment Protection, and Harin chose to merge without it.
- **Production:** https://harin-portfolio-tau.vercel.app. The Vercel status on the merge commit is success.
- **Production smoke test:** PASS_WITH_NOTES ([prod-smoke.md](prod-smoke.md)). AC-1 to AC-7 pass on prod. AC-8 wasn't tested in smoke mode; the full e2e suite covered it before merge. One unrelated finding: `/favicon.ico` returns 404 (backlog #12).
- **Follow-ups:** [docs/BACKLOG.md](../../BACKLOG.md)

## Rollback
1. Vercel dashboard → Deployments → the previous production deployment → Instant Rollback.
2. `git revert e9be485` on a new branch, then run it through `/deploy`.
