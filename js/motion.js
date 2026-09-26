(() => {
  const trackerNum = document.getElementById("tracker-num");
  const trackerYear = document.getElementById("tracker-year");
  const progress = document.getElementById("progress");
  const pager = document.getElementById("pager");
  const pagerLabel = document.getElementById("pager-label");
  const pages = [...document.querySelectorAll(".page")];

  const label = (el) => {
    if (!el) return ["COVER", ""];
    if (el.id === "talks") return ["ON AIR", "●"];
    if (el.id === "workshop") return ["ANNUAL", "∞"];
    if (el.id === "origins") return ["#1", "ORIGINS"];
    return [`#${el.dataset.num}`, el.dataset.year];
  };

  let current = -1;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    const mid = innerHeight * 0.35;
    current = -1;
    pages.forEach((p, i) => {
      if (p.getBoundingClientRect().top < mid) current = i;
    });
    const [num, year] = label(pages[current]);
    trackerNum.textContent = num;
    trackerYear.textContent = year;
    pagerLabel.textContent = current < 0 ? "Cover" : `${num} ${year}`.trim();
    pager.classList.toggle("show", scrollY > innerHeight * 0.6);
  };
  let queued = false;
  const onScrollFrame = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      onScroll();
    });
  };
  addEventListener("scroll", onScrollFrame, { passive: true });
  addEventListener("resize", onScrollFrame);
  onScroll();

  let lenis = null;
  const goTo = (i) => {
    const target = i < 0 ? 0 : pages[Math.min(i, pages.length - 1)];
    if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.1 });
    else if (target === 0) scrollTo({ top: 0, behavior: "smooth" });
    else scrollTo({ top: target.getBoundingClientRect().top + scrollY - 70, behavior: "smooth" });
  };
  const turn = (dir, from) => {
    const idx = from ? pages.indexOf(from.closest(".page")) : current;
    goTo(dir === "next" ? idx + 1 : idx - 1);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-turn]");
    if (b) turn(b.dataset.turn, b.closest(".page") ? b : null);
  });
  addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (document.querySelector("dialog[open]") || e.target.closest("input, textarea, [contenteditable]")) return;
    if (e.key === "ArrowRight") turn("next");
    else if (e.key === "ArrowLeft") turn("prev");
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const desktop = matchMedia("(min-width: 768px)").matches;

  if (window.Lenis && desktop) {
    lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id === "#top" ? 0 : document.querySelector(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -70 });
      })
    );
  }

  document.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join("");
  });

  gsap
    .timeline({ defaults: { ease: "back.out(1.8)" } })
    .from(".cover-frame", { y: 40, rotate: -2, opacity: 0, duration: 0.6, ease: "power3.out" })
    .from(".mh-small", { x: -60, opacity: 0, duration: 0.4 }, "-=0.2")
    .from(".mh-big .ch", { yPercent: -120, rotate: () => gsap.utils.random(-25, 25), opacity: 0, stagger: 0.035, duration: 0.5 }, "-=0.2")
    .from(".cover-art", { scale: 0.85, rotate: 3, opacity: 0, duration: 0.6 }, "-=0.6")
    .from(".cover-art img", { yPercent: 30, duration: 0.7, ease: "power3.out" }, "-=0.4")
    .from(".cover-bubble", { scale: 0, transformOrigin: "20% 100%", duration: 0.45 }, "-=0.2")
    .from(".cover-burst", { scale: 0, rotate: -120, duration: 0.6, ease: "elastic.out(1, 0.5)" }, "-=0.2")
    .from(".featuring li, .who > *", { y: 16, opacity: 0, stagger: 0.04, duration: 0.3 }, "-=0.5");

  if (desktop) gsap.to(".cover-burst", { rotate: 12, scale: 1.06, yoyo: true, repeat: -1, duration: 1.4, ease: "sine.inOut", delay: 2 });

  const once = (el, start = "top 88%") => ({ trigger: el, start, once: true });
  gsap.utils.toArray(".meanwhile span").forEach((el) =>
    gsap.from(el, { scale: 0.4, rotate: -12, opacity: 0, duration: 0.5, ease: "back.out(2.4)", scrollTrigger: once(el) })
  );
  gsap.utils.toArray(".intro, .socials").forEach((el) =>
    gsap.from(el, { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: once(el) })
  );
  gsap.utils.toArray(".section-title").forEach((el) =>
    gsap.from(el, { x: -40, opacity: 0, duration: 0.5, ease: "power3.out", scrollTrigger: once(el) })
  );

  // page turn: each splash swings in on its spine (scrubbed on desktop)
  // build section animations in small idle-time chunks so first scroll isn't blocked
  const idle = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 16));
  const queue = [];
  const drain = (deadline) => {
    while (queue.length && deadline.timeRemaining() > 2) queue.shift()();
    if (queue.length) idle(drain);
    else ScrollTrigger.refresh();
  };
  const later = (fn) => queue.push(fn);

  gsap.utils.toArray(".issue-head, .onair-head, .annual-head, .origins-head").forEach((head) => later(() => {
    let shade = head.querySelector(".turn-shade");
    if (!shade) {
      shade = document.createElement("span");
      shade.className = "turn-shade";
      head.appendChild(shade);
    }
    if (desktop) {
      gsap
        .timeline({ scrollTrigger: { trigger: head, start: "top bottom", end: "top 22%", scrub: 0.8 } })
        .fromTo(
          head,
          { rotateY: -82, rotateX: 4, xPercent: 6, transformOrigin: "0% 50%", filter: "brightness(0.7)" },
          { rotateY: 0, rotateX: 0, xPercent: 0, filter: "brightness(1)", ease: "sine.out" }
        )
        .fromTo(shade, { opacity: 1 }, { opacity: 0, ease: "none" }, 0);
    } else {
      // phones: native momentum scrolling fights scrubbed 3D, so the page turns once as it arrives
      gsap
        .timeline({ scrollTrigger: once(head, "top 92%") })
        .fromTo(head, { rotateY: -32, transformOrigin: "0% 50%" }, { rotateY: 0, duration: 0.7, ease: "power2.out", clearProps: "transform" })
        .fromTo(shade, { opacity: 0.8 }, { opacity: 0, duration: 0.7, ease: "power1.out" }, 0);
    }
    const tl = gsap.timeline({ scrollTrigger: once(head, "top 60%") });
    tl.from(head.querySelectorAll(".issue-meta > *, .kicker"), { y: -20, opacity: 0, stagger: 0.06, duration: 0.3 })
      .from(head.querySelector("h2"), { scale: 1.3, skewX: -12, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.1")
      .from(head.querySelectorAll(".lede, .issue-links, .schools, p:not(.kicker):not(.issue-no)"), { y: 16, opacity: 0, duration: 0.4 }, "-=0.25")
      .from(head.querySelector(".page-curl"), { width: 0, height: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2");
    const sfx = head.querySelector(".sfx-word");
    if (sfx) tl.from(sfx, { scale: 0, rotate: -40, duration: 0.6, ease: "elastic.out(1.1, 0.45)" }, "-=0.5");
  }));

  // motion comic: panels ink in one by one, art settles, captions and bubbles follow
  const panelIn = (panel) => {
    const media = panel.querySelector(".panel-media img, .panel-media video, .ph svg");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)", y: desktop ? 24 : 0 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.6, ease: "power3.inOut", clearProps: "clipPath,transform" });
    if (media && desktop) tl.fromTo(media, { scale: 1.22 }, { scale: 1.06, duration: 1.8, ease: "power2.out" }, 0.1);
    tl.from(panel.querySelectorAll(":scope > .caption"), { x: -24, opacity: 0, duration: 0.35 }, 0.35);
    tl.from(panel.querySelectorAll(".stat-block b"), { scale: 0.4, opacity: 0, duration: 0.5, ease: "back.out(2.2)" }, 0.4);
    tl.from(panel.querySelectorAll(":scope > .bubble, .bubble.solo"), { scale: 0, transformOrigin: "85% 110%", duration: 0.45, ease: "back.out(2.5)" }, 0.55);
    tl.from(panel.querySelectorAll(".panel-body > *:not(.bubble)"), { y: 12, opacity: 0, stagger: 0.07, duration: 0.35 }, 0.5);
    return tl;
  };
  later(() => ScrollTrigger.batch(".panel:not(.shop)", {
    start: "top 88%",
    once: true,
    onEnter: (els) => {
      let n = 0;
      els.forEach((el) => {
        if (el.getBoundingClientRect().bottom < 0) return;
        panelIn(el).delay(Math.min(n++ * 0.22, 0.66));
      });
    },
  }));
  later(() => ScrollTrigger.batch(".shop, .power, .tv", {
    start: "top 92%",
    once: true,
    onEnter: (els) => gsap.from(els, { y: 50, rotateX: -25, transformOrigin: "50% 0%", opacity: 0, stagger: 0.08, duration: 0.6, ease: "back.out(1.6)", clearProps: "transform,opacity" }),
  }));
  later(() => ScrollTrigger.batch(".back", {
    start: "top 95%",
    once: true,
    onEnter: (els) => gsap.from(els, { x: 80, rotateY: -40, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power3.out", clearProps: "opacity,transform" }),
  }));

  if (desktop) later(() => {
    gsap.utils.toArray(".panel:not(.shop) .panel-media img, .panel:not(.shop) .panel-media video").forEach((m) =>
      gsap.to(m, { yPercent: 3, ease: "none", scrollTrigger: { trigger: m.parentElement, scrub: true } })
    );
    gsap.utils.toArray(".issue-head .sfx-word").forEach((s) =>
      gsap.to(s, { y: -40, ease: "none", scrollTrigger: { trigger: s.parentElement, scrub: true } })
    );
    gsap.to(".tbc", { x: 60, ease: "none", scrollTrigger: { trigger: ".letters", scrub: true, start: "top bottom", end: "bottom bottom" } });
  });
  idle(drain);

})();
