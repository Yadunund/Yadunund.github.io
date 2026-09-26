---
name: screenshot
description: Visually verify the site with Playwright — mobile (390px) and desktop (1440px) screenshots, reduced-motion variant, interaction checks, console/404/overflow errors. Use after any visual or content change, and iterate until it looks right.
---

# Screenshot QA loop

Fast path: `tools/test.sh` runs everything below and starts the server if needed.

1. Serve with caching disabled (once per session):
   ```bash
   cd <repo> && (setsid python3 tools/serve.py 8123 >/dev/null 2>&1 &)
   ```
2. First run only: `cd tools && npm install && npx playwright install chromium`.
3. Shoot individually when iterating on one view:
   ```bash
   cd tools
   node shoot.mjs --out ../screenshots                 # top + full page, mobile & desktop
   node shoot.mjs --out ../screenshots --interact      # + card flip, talk lightbox, media zoom
   node shoot.mjs --out ../screenshots --sections      # + one shot per section
   node shoot.mjs --out ../screenshots --reduced --only mobile
   ```
   Exit code 1 lists console errors, 4xx/failed first-party requests, horizontal overflow, or broken interactions.
4. Look at the images. Full pages are very tall — crop before reading:
   ```bash
   ffmpeg -loglevel error -y -i ../screenshots/desktop-full.png -vf "crop=1440:2400:0:<y>,scale=720:-1" /tmp/crop.png
   ```
   Section offsets: `page.evaluate(() => document.getElementById('<id>').offsetTop)`.
5. Check: no text overlapping SFX/stickers, grid rows without holes, media not clashing with the palette, tap targets ≥ 44px on mobile, no horizontal scroll. Fix, re-shoot, repeat.

`screenshots/` is gitignored.
