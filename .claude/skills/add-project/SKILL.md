---
name: add-project
description: Add a new project to the portfolio as a timeline issue, a Workshop side project, or an Origins back-issue. Use when the user wants to add, feature, reorder or edit a project on the site.
---

# Add a project

All content lives in `data/projects.js`. Never hand-edit rendered HTML for content.

## 1. Pick the slot
- **Timeline issue** (`window.ISSUES`): significant professional work. Newest first. Only include projects the user led or contributed to significantly (pinned repos, top contributor) — never fork-only repos.
- **Workshop** (`window.WORKSHOP`): personal side projects in the user's own repos.
- **Origins** (`window.ORIGINS.items`): pre-2019 student/maker work. Low focus.

Verify contribution before adding a GitHub project:
```bash
curl -s "https://api.github.com/repos/<owner>/<repo>/contributors?per_page=10" | python3 -c "import json,sys;print([(c['login'],c['contributions']) for c in json.load(sys.stdin)])"
```

## 2. Issue entry shape
```js
{
  id: "slug",            // anchor + media folder name
  num: 11,               // issue number; newest = highest
  year: "2026",          // drives the "Meanwhile, in <year>…" strip
  era: "2026 → Now",
  org: "Company",
  title: "Headline",
  cover: "media/<id>/x.jpg", // optional: thumbnail for the cover strip; defaults to the first real panel media
  color: "mint",         // mint | uv | yellow | red | pink | blue | orange
  sfx: "BOOM!",          // comic sound effect, short
  lede: "2–3 sentences, first person, outcome-focused. Not a resume bullet.",
  panels: [ /* see below */ ],
  links: [{ label: "repo", href: "https://…" }],
}
```
Insert at the correct chronological position, then renumber every `num` so they count down contiguously to 2 (Origins is #1). Avoid giving two adjacent issues the same `color`.

## 3. Panels
Sizes on desktop's 6-col grid: `wide` = 4, `sq` = 2, `full` = 6. Rows must sum to 6 (e.g. wide+sq, sq+wide, sq+sq+sq, full) or the grid leaves holes.

Panel fields (all optional except `size`): `caption`, `media`, `bubble` (speech bubble over media), `bubbleOnly` (big quote, no media), `text`, `code` (shell line), `stat: {k, v}`, `credit`, `link: {label, href}`.

Media:
- `{ type: "video", src: "media/<id>/x.mp4", poster: "media/<id>/x.jpg" }`
- `{ type: "img", src: "media/<id>/x.jpg", contain: true? }` (`contain` for diagrams/art with transparency)
- `{ type: "embed", vimeo: "id" | "id/hash" | youtube: "id", thumb: "media/talks/x.jpg" }`
- `{ type: "placeholder", art: "arm|quadruped|amr|factory|network|humanoid", path: "media/<id>/hero.mp4" }` — use when real media is pending; the path tells the user what file to drop in.

Get media in with the `add-media` skill. Never hotlink media at runtime.

## 4. Workshop entry
```js
{ title, text, media | code, href, tag, feature?: true }
```
`feature` spans 2 columns on desktop; keep the total cell count a multiple of 3.

## 5. Verify
Run the `screenshot` skill (mobile + desktop, `--interact`) and look at the new section. Then run `site-check`. Amend the single site commit (`git commit --amend --no-edit`) and force-push it to `master` (see CLAUDE.md); don't add new commits.
