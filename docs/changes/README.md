# Changes

One folder per change to the site, created by `/ship`. Each phase leaves a file, so anyone (or any later Claude session) can see why a change exists, what was approved, and how it was checked.

```
docs/changes/2026-11-05-projects-section/
├── status.md          phase tracker and gate approvals (source of truth)
├── brief.md           phase 1: problem, audience, acceptance criteria
├── design.md          phase 2: layout, states, motion, a11y, copy deck
├── content-review.md  phase 3: content-editor agent report
├── dev-notes.md       phase 4: what was built and how to test it
├── code-review.md     phase 5: code-reviewer agent report
├── qa-report.md       phase 6: qa-tester agent report
├── pr-body.md         phase 7: pull request description
├── preview-smoke.md   phase 7: smoke test of the Vercel preview
├── prod-smoke.md      phase 7: smoke test of production after merge
├── deploy.md          phase 7: PR, URLs, merge commit
└── screenshots/       evidence (not committed)
```

See `docs/PIPELINE.md` for how the pipeline works.
