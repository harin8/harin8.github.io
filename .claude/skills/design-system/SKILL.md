---
name: design-system
description: The harin.dev visual system - @theme tokens, typography, CRT/HUD utilities, components, motion, mobile and accessibility rules, and CSP limits. Apply when designing, building, reviewing or testing any UI on the site.
user-invocable: false
---

# harin.dev design system

Identity: **cyber-noir operator console**. Dark CRT surface, phosphor-green accent, monospace everything, HUD labels, boot sequences and decrypting text. Calm by default, with moments of glitch.

Source of truth for values: the `@theme` block in `app/globals.css`. If this file and the CSS disagree, the CSS wins; update this file.

## Color tokens
| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#07090c` | page background |
| `--color-bg-elev` | `#0e1218` | cards, palette, terminal panes |
| `--color-ink` | `#c7d1da` | body text |
| `--color-accent` | `#00ff9c` | primary actions, active states, prompts |
| `--color-accent-dim` | `#4d8a78` | secondary accent, borders |
| `--color-alert` | `#ff2e63` | errors, destructive, glitch |
| `--color-haze` | `#8a96a4` | labels, metadata, muted text |

Contrast on `bg` (WCAG AA needs 4.5 for body text, 3 for large text and UI borders):
- Full opacity: ink 12.9, accent 15.0, haze 6.6, alert 5.5, accent-dim 5.0. All pass.
- Opacity modifiers lower contrast. Lowest that still passes 4.5 for body text: `text-ink/60` (5.1), `text-accent/60` (5.7), `text-haze/80` (4.6). `accent-dim` only at full opacity, and not on `bg-elev` for small text (4.7, borderline).
- New colors go into `@theme` as tokens, never as raw hex in components.

## Typography
- `font-mono` / `font-display`: JetBrains Mono (via `next/font`, self-hosted, CSP-safe).
- `font-hud`: VT323, for HUD-style labels only.
- `.hud-label` for small uppercase metadata strips.
- One family carries everything; hierarchy comes from size, weight, tracking and color, not new typefaces.

## Utilities in `globals.css`
`.crt-scanlines`, `.crt-vignette`, `.crt-noise` (overlays) · `.crt-flicker`, `.glitch`, `.cursor-block` (effects; flicker and cursor already stop under reduced motion) · `.hud-label` · `.tap-target` (minimum touch size) · `.safe-top/-bottom/-left/-right` (notch insets).

## Components
- `components/chrome/`: `Nav`, `CommandPalette` (opens with `/`)
- `components/hero/`: `BootSequence`, `MatrixRain`, `DecryptText`
- `components/timeline/`: `TimelineScene`, `TimelineNode`
- `components/chat/`: `Terminal` (streams from `/api/chat`)
- `components/fx/`: `SmoothScroll` (Lenis)
Reuse these patterns before inventing new ones. Buttons and links follow the hero CTAs: bordered, uppercase mono, `›` prefix, `→` that nudges on hover.

## Motion
- GSAP + ScrollTrigger for choreography, Lenis for smooth scroll, CSS for micro-interactions.
- Every animation has a `prefers-reduced-motion: reduce` path: skip, shorten to a fade, or show the end state.
- Touch devices: Lenis is skipped, `MatrixRain` is throttled, GSAP pin/scrub is dropped on phones. New heavy effects follow the same pattern.
- Text must be readable without waiting for an animation to finish.

## Layout and mobile
- Tailwind default breakpoints (`sm` 640, `md` 768, `lg` 1024). Design and test at **393, 768, 1440**.
- No horizontal overflow at 393px. Long HUD strips wrap; brand and nav text shrink.
- Touch targets at least 44px (`.tap-target`, `min-h-12`).

## Accessibility baseline
- Visible focus on everything interactive. There is no global `:focus-visible` rule in `globals.css` yet, so each new control needs its own `focus-visible:` styles (an accent outline or border fits the system).
- Semantic headings: one `h1` per page.
- Dialogs follow `CommandPalette`: `role="dialog"` + `aria-modal`, focus trapped while open, Esc closes, focus returns to where it was.
- Decorative canvases and overlays follow `MatrixRain`: `aria-hidden` and `pointer-events-none`.

## CSP limits (`vercel.json`)
`default-src 'self'`, `connect-src 'self'`, `img-src 'self' data: blob:`, `font-src 'self' data:`. No external images, fonts, scripts, embeds or API calls from the browser without a deliberate, minimal CSP edit in the same change.
