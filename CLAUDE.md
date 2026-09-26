# yadunund.github.io

Static comic-book portfolio, no build step. Served by GitHub Pages.

- Content: `data/projects.js` (SITE, POWERS, ISSUES newest-first, TALKS, WORKSHOP, ORIGINS). Edit data, not HTML.
- Render: `js/render.js`; motion (GSAP/ScrollTrigger/Lenis via CDN): `js/motion.js`.
- Styles: `css/tokens.css` (palette), `css/comic.css` (components), `css/layout.css` (sections). Design rules in `DESIGN.md`.
- Media: `media/<issue-id>/`, optimized with `tools/media.sh`. No runtime hotlinking.
- QA: `tools/shoot.mjs` (Playwright screenshots), `tools/check.mjs` (links/weight). Skills in `.claude/skills/`.
- Dev server: `python3 tools/serve.py 8123` (sends `Cache-Control: no-store`; plain `http.server` lets browsers serve stale CSS/JS).

## Workflow (required)
After every change, run `tools/test.sh` (data/JS syntax, Playwright mobile+desktop with interactions, reduced motion, local link check) and look at the screenshots of what changed. Use `tools/test.sh --external` before a batch of content lands. Don't report a change as done while tests fail. A Stop hook (`.claude/settings.json` → `tools/test-if-changed.sh`) enforces this when Claude runs from this repo.
Keep the site as a single commit on top of `master`: fold every change into it with `git commit --amend` (overwrite, don't stack). Record notable iterations in the knowledge vault (`~/Documents/knowledge-vault/design/Portfolio Site - Build Process.md`) instead of git history. After tests pass, force-push that single commit to `master` (`git push --force-with-lease origin HEAD:master`); GitHub Pages deploys it. Then verify the live site with `node tools/shoot.mjs --url https://yadunund.github.io/ --interact`.

Conventions: mobile-first; minimal code comments; commit messages without session IDs; inline SVGs always carry width/height attributes.
