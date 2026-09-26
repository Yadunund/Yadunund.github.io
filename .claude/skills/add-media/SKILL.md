---
name: add-media
description: Import images, GIFs or videos into the site (from a URL, a GitHub repo, or files the user supplies) and wire them into a panel, replacing placeholders. Use when the user provides media or asks to pull media for a project.
---

# Add media

1. Find sources.
   - User-supplied files: take the path they give.
   - GitHub repo: many repos keep media on a `media` branch or in `docs/media`. List candidates:
     ```bash
     curl -s "https://api.github.com/repos/<owner>/<repo>/git/trees/media" | python3 -c "import json,sys;[print(x['path'],x.get('size')) for x in json.load(sys.stdin).get('tree',[])]"
     curl -s "https://api.github.com/repos/<owner>/<repo>/git/trees/HEAD?recursive=1" | python3 -c "import json,sys;[print(x['path']) for x in json.load(sys.stdin).get('tree',[]) if x['path'].endswith(('.gif','.mp4','.png','.jpg'))]"
     ```
     Download via `https://github.com/<owner>/<repo>/raw/<branch>/<path>`.
   - Only use media the user owns or that is openly licensed; add a `credit` on the panel for third-party repos and extend the footer credit line in `index.html` if it is a new source.

2. Optimize into `media/<issue-id>/`:
   ```bash
   tools/media.sh <issue-id> <url-or-path>...
   ```
   GIF/video → MP4 + poster JPG; images → JPG ≤1400px; transparent PNG kept ≤640px.
   To preview what you downloaded, build a contact sheet with ffmpeg `xstack` and view it with Read before choosing.

3. Wire it: in `data/projects.js` swap the panel's `placeholder` for `video` / `img`. Keep `caption`, adjust `text`.

4. Keep the repo light: aim for < 1.5 MB per video, check `du -sh media`.

5. Run the `screenshot` skill and look at the panel. Media is automatically toned to the palette (see `css/comic.css`, "media blend"); if something still clashes (very white UI screenshots), prefer a crop or a different frame over adding new CSS.
