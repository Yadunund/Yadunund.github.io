---
name: research-work
description: Gather facts about the user's work to add or refresh site content — pinned GitHub repos, contribution stats, repo media, conference talks, press. Use when asked to "find", "include" or "update" projects/talks, before writing any copy.
---

# Research the user's work

GitHub user: `Yadunund` (gh CLI not installed; use the public API with curl).

- Pinned repos (the user's own highlight list):
  ```bash
  curl -sL https://github.com/Yadunund | python3 -c "import re,sys;h=sys.stdin.read();i=h.find('Pinned');print(sorted(set(re.findall(r'href=\"/([\w.-]+/[\w.-]+)\"',h[i:i+60000]))))"
  ```
- Own repos by stars: `curl -s "https://api.github.com/users/Yadunund/repos?per_page=100"` — ignore `fork: true` unless the fork has substantial commits by the user.
- Contribution check (include only significant work):
  ```bash
  curl -s "https://api.github.com/repos/<o>/<r>/contributors?per_page=10"
  curl -s "https://api.github.com/repos/<o>/<r>/commits?author=Yadunund&per_page=100" | python3 -c "import json,sys;print(len(json.load(sys.stdin)))"
  ```
- Descriptions: README head via `https://raw.githubusercontent.com/<o>/<r>/HEAD/README.md`.
- Talks: ROSCon programs `https://roscon.ros.org/<year>/`, ROSCon JP `https://roscon.jp`, ROSCon India, Zenoh events, YouTube/Vimeo oEmbed (see `add-talk`).
- ROS Discourse profile: `https://discourse.openrobotics.org/u/yadunund.json`.
- Press/blogs: WebSearch for the project name + "Intrinsic" / "Open Robotics" / "FieldAI".

Rules:
- Never invent facts, dates, metrics or commands. If a date is uncertain, mark it `// TODO(confirm)` in `data/projects.js` and tell the user.
- Prefer primary sources (repo, program page, video title) over summaries.
- Record where media came from via panel `credit`.
