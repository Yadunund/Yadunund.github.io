(() => {
  const { SITE, POWERS, ISSUES, WORKSHOP, ORIGINS } = window;
  const $ = (sel, root = document) => root.querySelector(sel);

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const art = (name) => `<svg viewBox="0 0 200 160" width="200" height="160" aria-hidden="true"><use href="#art-${esc(name)}"/></svg>`;

  const ext = (href) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "");

  const embed = (v) =>
    v.youtube
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1`
      : (([id, h]) => `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1${h ? `&h=${encodeURIComponent(h)}` : ""}`)(v.vimeo.split("/"));
  function media(m, alt = "") {
    if (!m) return "";
    switch (m.type) {
      case "video":
        return `<div class="panel-media" data-zoom="video" data-src="${esc(m.src)}">
          <video muted loop playsinline preload="none" poster="${esc(m.poster || "")}" data-src="${esc(m.src)}" aria-label="${esc(alt)}"></video></div>`;
      case "img":
        return `<div class="panel-media${m.contain ? " contain" : ""}" data-zoom="img" data-src="${esc(m.src)}">
          <img src="${esc(m.src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`;
      case "embed":
        return `<div class="panel-media">
          <img src="${esc(m.thumb)}" alt="${esc(alt)}" loading="lazy" decoding="async">
          <button class="play" data-embed="${esc(embed(m))}" aria-label="Play video: ${esc(alt)}"><span>▶</span></button></div>`;
      case "placeholder":
        return `<div class="panel-media"><div class="ph">${art(m.art)}
          <span class="ph-tag"><b>MEDIA INCOMING</b> ${esc(m.path)}</span></div></div>`;
    }
    return "";
  }

  const clip = (c) => `<a class="clipping" href="${esc(c.href)}"${ext(c.href)}>
      <span class="clip-outlet">${esc(c.outlet)}<em>${esc(c.date || "")}</em></span>
      <span class="clip-headline">${esc(c.headline)}</span>
      <span class="clip-more">Read ↗</span></a>`;

  function panel(p) {
    const alt = p.caption || "";
    const body = [
      p.bubbleOnly ? `<p class="bubble solo">${esc(p.bubbleOnly)}</p>` : "",
      p.press ? `<div class="clippings">${p.press.map(clip).join("")}</div>` : "",
      p.code ? `<pre class="code">${esc(p.code)}</pre>` : "",
      p.text ? `<p>${esc(p.text)}</p>` : "",
      p.credit ? `<span class="credit">${esc(p.credit)}</span>` : "",
      p.link ? `<a class="link" href="${esc(p.link.href)}"${ext(p.link.href)}>${esc(p.link.label)}</a>` : "",
    ].join("");
    const stat = p.stat ? `<div class="stat-block"><b>${esc(p.stat.k)}</b><span>${esc(p.stat.v)}</span></div>` : "";
    return `<article class="panel ${esc(p.size || "sq")}">
      ${p.caption ? `<span class="caption">${esc(p.caption)}</span>` : ""}
      ${media(p.media, alt)}
      ${p.bubble ? `<p class="bubble">${esc(p.bubble)}</p>` : ""}
      ${stat}
      ${body ? `<div class="panel-body">${body}</div>` : ""}
    </article>`;
  }

  function issue(is, i) {
    const links = (is.links || [])
      .map((l) => `<a class="chip" href="${esc(l.href)}"${ext(l.href)}>${esc(l.label)}</a>`)
      .join("");
    return `<section class="issue page" id="${esc(is.id)}" data-color="${esc(is.color)}" data-num="${is.num}" data-year="${esc(is.year)}" aria-labelledby="${esc(is.id)}-h">
      <header class="issue-head halftone" data-year="${esc(is.year)}">
        <div class="issue-meta">
          <p class="issue-no">Issue #${is.num}</p>
          <span class="issue-org">${esc(is.org)}</span>
          <span class="issue-era">${esc(is.era)}</span>
        </div>
        ${is.sfx ? `<span class="sfx-word" aria-hidden="true">${esc(is.sfx)}</span>` : ""}
        <h2 id="${esc(is.id)}-h" class="display">${esc(is.title)}</h2>
        <p class="lede">${esc(is.lede)}</p>
        ${links ? `<div class="issue-links">${links}</div>` : ""}
        <span class="turn-shade" aria-hidden="true"></span>
        <button class="page-curl" data-turn="next" aria-label="Next issue"><span>Turn page</span></button>
      </header>
      <div class="panels">${is.panels.map(panel).join("")}</div>
    </section>`;
  }

  function power(p) {
    const meter = Array.from({ length: 5 }, () => "<i></i>").join("");
    return `<button class="power" data-color="${esc(p.color)}" aria-label="${esc(p.name)}: ${esc(p.items.join(", "))}">
      <div class="power-inner">
        <div class="power-face power-front">
          <div class="power-top"><span>Power</span><span>★★★★★</span></div>
          <div class="ph-art">${art(p.icon)}</div>
          <h3>${esc(p.name)}</h3>
          <div class="meter">${meter}</div>
        </div>
        <div class="power-face power-back">
          <h3>${esc(p.name)}</h3>
          <ul>${p.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <span class="power-hint">tap to flip back</span>
        </div>
      </div>
    </button>`;
  }

  function shop(w) {
    const m = w.code
      ? `<div class="code-wrap"><pre class="code">${esc(w.code)}</pre></div>`
      : media(w.media, w.title);
    return `<a class="panel shop${w.feature ? " feature" : ""}" href="${esc(w.href)}"${ext(w.href)}>
      <span class="tag">${esc(w.tag)}</span>
      ${m}
      <div class="panel-body"><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div>
    </a>`;
  }

  const watchUrl = (v) => (v.youtube ? `https://www.youtube.com/watch?v=${v.youtube}` : `https://vimeo.com/${v.vimeo}`);

  function tv(t) {
    const screen = t.thumb
      ? `<img src="${esc(t.thumb)}" alt="" loading="lazy">`
      : `<div class="tv-static"><span>${esc(t.kind)}</span></div>`;
    const play = t.video
      ? `<button class="play" data-embed="${esc(embed(t.video))}" aria-label="Play: ${esc(t.title)}"><span>▶</span></button>`
      : "";
    const links = [
      t.video ? `<a class="chip" href="${esc(watchUrl(t.video))}" target="_blank" rel="noopener">Watch</a>` : "",
      t.slides ? `<a class="chip" href="${esc(t.slides)}" target="_blank" rel="noopener">Slides</a>` : "",
      t.href ? `<a class="chip" href="${esc(t.href)}" target="_blank" rel="noopener">Program</a>` : "",
    ].join("");
    return `<article class="tv">
      <div class="tv-screen">${screen}${play}<span class="tv-kind">${esc(t.kind)}</span></div>
      <div class="tv-meta">
        <span class="caption">${esc(t.venue)}</span>
        <h3>${esc(t.title)}</h3>
        ${t.with ? `<p class="tv-with">with ${esc(t.with)}</p>` : ""}
        ${t.blurb ? `<p>${esc(t.blurb)}</p>` : ""}
        <div class="tv-links">${links}</div>
      </div>
    </article>`;
  }

  const highlight = (text) =>
    esc(text).replace(
      /(embodiment-agnostic robotics platforms|verifiable, repeatable execution|Simulation-first)/g,
      "<mark>$1</mark>"
    );

  $("#name").textContent = SITE.name;
  $("#now").textContent = SITE.now;
  $("#tagline").textContent = SITE.tagline;
  $("#intro").innerHTML = highlight(SITE.intro);
  $("#powers").innerHTML = POWERS.map(power).join("");
  $("#issues").innerHTML = ISSUES.map(issue).join("");
  const coverArt = (is) => {
    if (is.cover) return `<img src="${esc(is.cover)}" alt="" loading="lazy" decoding="async">`;
    const withMedia = is.panels.map((p) => p.media).filter(Boolean);
    const m = withMedia.find((x) => x.type !== "placeholder") || withMedia[0];
    if (!m) return art("network");
    if (m.type === "placeholder") return art(m.art);
    const src = m.type === "video" ? m.poster : m.type === "embed" ? m.thumb : m.src;
    return `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
  };
  const minis = [
    ...ISSUES.map((is) => ({ id: is.id, color: is.color, no: `#${is.num}`, year: is.year, title: is.title, art: coverArt(is) })),
    { id: "talks", color: "red", no: "On air", year: "", title: "Talks & Broadcasts", art: `<img src="${esc((window.TALKS || [])[1]?.thumb || "")}" alt="" loading="lazy">` },
    { id: "workshop", color: "uv", no: "Annual", year: "", title: "The Workshop", art: `<img src="${esc(WORKSHOP[0].media.poster || WORKSHOP[0].media.src)}" alt="" loading="lazy">` },
    { id: "origins", color: "paper", no: "#1", year: "", title: "Origins", art: `<img src="${esc(ORIGINS.items[1]?.src || ORIGINS.items[0].src)}" alt="" loading="lazy">` },
  ];
  $("#inside").innerHTML = minis
    .map(
      (c, i) => `<li><a class="mini" href="#${esc(c.id)}" data-color="${esc(c.color)}" style="--tilt:${i % 2 ? 1.2 : -1.2}deg">
        <span class="mini-top"><b>${esc(c.no)}</b><em>${esc(c.year)}</em></span>
        <span class="mini-art">${c.art}</span>
        <span class="mini-title">${esc(c.title)}</span></a></li>`
    )
    .join("");
  $("#tv-grid").innerHTML = (window.TALKS || []).map(tv).join("");
  $("#workshop-grid").innerHTML = WORKSHOP.map(shop).join("");
  $("#origins-lede").textContent = ORIGINS.lede;
  $("#schools").innerHTML = ORIGINS.schools.map((s) => `<li><b>${esc(s.short)}</b>${esc(s.deg)}</li>`).join("");
  $("#backissues").innerHTML = ORIGINS.items
    .map(
      (o, i) => `<figure class="back" style="--tilt:${i % 2 ? 1.5 : -1.5}deg" data-zoom="img" data-src="${esc(o.src)}" tabindex="0">
      <img src="${esc(o.src)}" alt="${esc(o.title)}" loading="lazy"><figcaption>${esc(o.title)}</figcaption></figure>`
    )
    .join("");
  const socials = [
    ["github", "GitHub", SITE.links.github],
    ["linkedin", "LinkedIn", SITE.links.linkedin],
    ["youtube", "YouTube", SITE.links.youtube],
    ["x", "X", SITE.links.x],
  ].filter(([, , href]) => href);
  const icon = (k) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><use href="#ico-${k}"/></svg>`;
  const social = (cls, withLabel) =>
    socials
      .map(([k, label, href]) => `<a class="${cls}" href="${esc(href)}"${ext(href)} aria-label="${label}">${icon(k)}${withLabel ? `<span>${label}</span>` : ""}</a>`)
      .join("");
  $("#socials").innerHTML = social("social", true);
  $("#top-socials").innerHTML = social("top-social", false);
  $("#letter-links").innerHTML = socials
    .map(([k, label, href]) => `<a class="chip" href="${esc(href)}"${ext(href)}>${icon(k)}${label}</a>`)
    .join("");
  $("#year").textContent = new Date().getFullYear();

  document.querySelectorAll(".power").forEach((b) => b.addEventListener("click", () => b.classList.toggle("flipped")));

  const videos = document.querySelectorAll("video[data-src]");
  const near = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const v = e.target;
        v.preload = "auto";
        v.src = v.dataset.src;
        near.unobserve(v);
      }),
    { rootMargin: "600px 0px" }
  );
  // play only when mostly on screen so several decoders don't start while scrolling past
  const visible = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (!v.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      }),
    { threshold: 0.5 }
  );
  videos.forEach((v) => {
    near.observe(v);
    visible.observe(v);
  });

  const lb = $("#lightbox");
  const lbBody = $("#lb-body");
  const open = (html) => {
    lbBody.innerHTML = html;
    lb.showModal();
  };
  lb.addEventListener("close", () => (lbBody.innerHTML = ""));
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.closest(".lb-close")) lb.close();
  });

  document.addEventListener("click", (e) => {
    const pl = e.target.closest("[data-embed]");
    if (pl) {
      open(`<div class="lb-video"><iframe src="${esc(pl.dataset.embed)}" title="Talk video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`);
      return;
    }
    const z = e.target.closest("[data-zoom]");
    if (!z || z.closest(".shop")) return;
    const src = esc(z.dataset.src);
    open(z.dataset.zoom === "video" ? `<video src="${src}" autoplay muted loop playsinline controls></video>` : `<img src="${src}" alt="">`);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".back[data-zoom]")) e.target.click();
  });
})();
