---
name: site-check
description: Pre-publish health check — every link, media file and embed resolves, initial page weight, repo media size. Use before committing a batch of content changes or before pushing to GitHub Pages.
---

# Site check

With the local server running on 8123:
```bash
cd tools && node check.mjs            # add --skip-external for a fast offline pass
du -sh ../media && git -C .. count-objects -vH
```
- `FAIL` lines must be fixed (missing local media, dead links).
- `WARN` 401/403/429/999 are hosts that block bots (LinkedIn, X, Vimeo player, some org sites). Spot-check them in a real browser once, e.g. via Playwright with a desktop user agent.
- Initial load should stay under ~1.5 MB (videos load lazily when visible).

Then run the `screenshot` skill with `--interact --reduced` variants if anything visual changed.

## Publishing
The site is served by GitHub Pages from the default branch of `Yadunund/Yadunund.github.io` (no build step; `.nojekyll`). Only push when the user asks.
