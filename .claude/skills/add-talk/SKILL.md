---
name: add-talk
description: Add a conference talk, keynote, workshop or podcast to the "On the Air" section, including thumbnail download from Vimeo/YouTube. Use when the user mentions a new talk or asks to refresh the talk list.
---

# Add a talk

1. Resolve details.
   - ROSCon programs: `curl -sL https://roscon.ros.org/<year>/` and search for "Yadunund"; the Watch (vimeo) and Slides (pdf) links follow the abstract.
   - Titles: Vimeo `https://vimeo.com/api/oembed.json?url=https://vimeo.com/<id>`, YouTube `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`. Prefer the title shown on the video thumbnail/slide over third-party summaries.

2. Thumbnail into `media/talks/<slug>.jpg`:
   ```bash
   # Vimeo (bump size in the returned URL)
   u=$(curl -s "https://vimeo.com/api/oembed.json?url=https://vimeo.com/<id>" | python3 -c "import json,sys;print(json.load(sys.stdin)['thumbnail_url'])")
   curl -sfL "$(echo $u | sed -E 's/d_[0-9]+x[0-9]+/d_960x540/')" -o media/talks/<slug>.jpg
   # YouTube
   curl -sfL https://i.ytimg.com/vi/<id>/maxresdefault.jpg -o media/talks/<slug>.jpg || curl -sfL https://i.ytimg.com/vi/<id>/hqdefault.jpg -o media/talks/<slug>.jpg
   # Slides only: first page of the PDF
   pdftoppm -jpeg -r 60 -f 1 -l 1 slides.pdf media/talks/<slug>
   ```
   Downscale with `tools/media.sh talks <file>` if > 150 KB.

3. Add to `window.TALKS` in `data/projects.js`, newest first:
   ```js
   { year, venue: "ROSCon 2026 · City", title, with?: "Co-speaker", blurb?, thumb?, video?: { vimeo: "id[/hash]" } | { youtube: "id" }, slides?, href?, kind: "Talk|Keynote|Workshop|Lightning talk|Tutorial|Podcast" }
   ```
   Unlisted Vimeo videos need the hash (`"879001905/d5ee7c2edf"`).
   If the talk belongs to a timeline issue, optionally also add an `embed` panel there.

4. Run `screenshot --interact` (clicks the first talk and checks the lightbox iframe) and `site-check`.
