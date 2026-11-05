---
name: design-phase
description: Design a change to the portfolio site from its approved brief - layout per breakpoint, components, tokens, states, motion, accessibility, and a verbatim copy deck - inside the site's cyber-noir system. Used as phase 2 of /ship; also usable alone as "/design-phase <change folder>".
argument-hint: "<change folder>"
---

# Design phase

Produce a design a developer can build without guessing and a content editor can review line by line. The site already has a strong identity (cyber-noir "operator console"); extend it unless the brief explicitly asks for a redesign.

Input: $ARGUMENTS (a change folder containing an approved `brief.md`)

## Steps

1. **Load the system.** Read the `design-system` skill (tokens, type, motion, mobile and accessibility rules) and `app/globals.css`. Load the `frontend-design` skill for craft: hierarchy, typography, composition, avoiding templated defaults. Where the two disagree, the site's existing identity wins.
2. **Look at what's there.** Read the components the brief lists. If the dev server is running (or you can start `npm run dev`), screenshot the affected pages at 393 and 1440 wide into `<change folder>/screenshots/before-<page>-<width>.png` so the review has a baseline.
3. **Choose a direction.**
   - Size S, or no visual change: one direction; say so in a line.
   - Size M or L: sketch two distinct directions in a few sentences each (what the visitor sees first, the layout idea, the motion idea), recommend one, and ask the user with AskUserQuestion. If the user is not around, take the recommended one and say why in `design.md`.
4. **Write `design.md`** from `${CLAUDE_SKILL_DIR}/template.md`. Rules for the sections:
   - **Layout** for 393, 768 and 1440 wide. Describe what moves, stacks or hides.
   - **Components:** reuse existing ones first; any new component gets a path and props.
   - **Tokens:** only `@theme` tokens. A new color or font means adding a token and saying why.
   - **States:** default, hover, focus-visible, active, loading, empty, error, as they apply.
   - **Motion:** what moves, duration and easing, what happens under `prefers-reduced-motion`, and what is skipped on touch devices.
   - **Accessibility:** contrast pair for each new text/background combination, focus order, landmarks and headings, keyboard behavior, alt text needs.
   - **Copy deck:** every user-facing string verbatim, with an ID (`C1`, `C2`, ...), where it appears, and a character limit where layout depends on it. Include aria-labels, alt text, page titles and meta descriptions. This is what the content editor reviews and what the developer must use word for word.
   - **Assets and CSP:** any image, font, script or embed must be self-hosted or have a named `vercel.json` change.
5. **Optional prototype** for size L, or when the user asks: a single static `prototype.html` in the change folder using the site's token values, for looking at, not for shipping. If the user works in Figma and the Figma tools are connected, you may mock it there instead.

Return a short summary to the caller: the direction in one or two sentences, new components, the number of copy deck entries, and open questions.
