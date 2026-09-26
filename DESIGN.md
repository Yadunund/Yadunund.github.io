# DESIGN.md — "The Robotics Architect"

Derived from The Verge design system in [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md/tree/main/design-md/theverge), re-inked as a retro comic book. Coding agents: follow this file when adding or restyling anything on the site.

## 1. Theme

A dark editorial canvas carrying saturated, halftoned comic panels. The page reads like a comic series in **reverse chronological order**: the newest issue opens the book and each chapter hands over with a "MEANWHILE, EARLIER…" caption. Verge-style flat depth (hairlines, no soft shadows) is replaced by comic ink: thick black outlines and hard offset shadows. A terminal/HUD layer (mono captions, timestamps, file paths) signals the engineering side.

## 2. Color tokens (`css/tokens.css`)

| Token | Hex | Role |
|---|---|---|
| `--canvas` | `#131313` | Page background (Verge canvas) |
| `--slate` | `#2d2d2d` | Secondary surfaces |
| `--ink` | `#0b0b0b` | Panel outlines, hard shadows, text on bright fills |
| `--paper` | `#f4ecd8` | Newsprint panels, caption backgrounds |
| `--mint` | `#3cffd0` | Verge "jelly mint" — primary hazard accent |
| `--uv` | `#5200ff` | Verge ultraviolet — secondary accent |
| `--yellow` | `#ffe600` | Caption boxes, cover masthead |
| `--red` | `#ff3b30` | SFX bursts, alerts |
| `--pink` | `#ff5fa2` | Issue color |
| `--blue` | `#2f6bff` | Issue color, link hover |
| `--orange` | `#ff8a00` | Issue color |

Each issue picks one fill color (`color` field in `data/projects.js`). Text on bright fills is always `--ink`.

## 3. Typography

- **Display / SFX:** `Bangers` — uppercase, letter-spacing .02em, black text-stroke + hard shadow on large sizes.
- **Body:** `Space Grotesk` 400/500/700, 17px mobile, 18px desktop, line-height 1.55.
- **HUD / captions / dates:** `JetBrains Mono` 500, uppercase, 11–13px, letter-spacing .08em.

## 4. Components

- **Panel** (`.panel`): 3px ink border, `6px 6px 0 var(--ink)` shadow, slight alternating tilt (±0.6deg desktop only), optional halftone overlay. Sizes: `wide` (4/6 cols), `sq` (2/6), `tall` (2 cols × 2 rows), `full` (6/6). Mobile: single column.
- **Caption box** (`.caption`): yellow fill, ink border, mono uppercase, pinned top-left of a panel.
- **Speech bubble** (`.bubble`): paper fill, ink border, rounded, triangle tail. Used for quotes and punchy facts.
- **SFX burst** (`.sfx`): starburst via `clip-path`, red/yellow, Bangers, pops in on scroll.
- **Issue splash** (`.issue-head`): full-width color block with halftone, issue number, era, title.
- **Meanwhile strip** (`.meanwhile`): used once, before Origins.
- **Press clipping** (`.clipping`): newspaper-cutting link with outlet, date and serif headline.
- **Power card** (`.power`): trading card, flips on hover/tap to list skills.
- **Placeholder** (`.ph`): halftone panel with line-art robot + "MEDIA INCOMING" and the expected file path.

## 5. Motion — flip-through motion comic

GSAP + ScrollTrigger (+ Lenis on desktop).
- **Pages:** every issue, Talks, Workshop and Origins is a `.page`. Its splash turns in on its left spine (`rotateY` −82° → 0°, scrubbed to scroll, with a fading `.turn-shade`), so scrolling feels like turning pages. No "Meanwhile" strips between issues.
- **Navigation:** page-curl corner on each splash, floating ◀ ▶ pager, and ←/→ keys jump page to page.
- **Panels:** ink in one at a time (`clip-path` wipe), art settles with a slow push-in, then caption slides, stats pop, bubbles pop, body text follows.
- Videos autoplay muted only while visible. `prefers-reduced-motion: reduce` disables tweens; paging still works.

## 6. Layout

Mobile first (390px reference): 16px gutter, one column, no horizontal page scroll; horizontal scroll-snap rows for cards and back issues. ≥768px: 6-col panel grid. ≥1200px: max width 1200px, left timeline rail with years.
