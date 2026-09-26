// Mobile scroll smoothness probe.
// Usage: node tools/perf.mjs [--url http://localhost:8123/] [--cpu 4] [--budget 10]
// Scrolls the whole page at a steady speed on an emulated phone with CPU throttling and
// reports frame times. Fails if more than --budget % of frames miss 2 vsyncs (> 33 ms).
import { chromium } from "playwright";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const url = opt("url", "http://localhost:8123/");
const cpu = Number(opt("cpu", 4));
const budget = Number(opt("budget", 10));

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

await page.waitForTimeout(1500);
const motion = await page.evaluate(() => ({
  scrubbed: window.ScrollTrigger ? ScrollTrigger.getAll().filter((t) => t.vars.scrub).length : 0,
  endless: document.getAnimations().filter((a) => {
    if (a.effect?.getTiming().iterations !== Infinity || a.playState !== "running") return false;
    const r = a.effect.target.getBoundingClientRect();
    return r.width * r.height > 20000;
  }).length +
    (window.gsap ? gsap.globalTimeline.getChildren(true, true, false).filter((t) => t.repeat() === -1).length : 0),
}));

const stats = await page.evaluate(async () => {
  const frames = [];
  let longTasks = 0;
  try {
    new PerformanceObserver((l) => (longTasks += l.getEntries().length)).observe({ type: "longtask", buffered: false });
  } catch {}
  const end = document.documentElement.scrollHeight - innerHeight;
  const pxPerMs = 1.6; // brisk thumb scroll
  let last = performance.now();
  const t0 = last;
  await new Promise((resolve) => {
    const step = (now) => {
      frames.push(now - last);
      last = now;
      const y = Math.min(end, (now - t0) * pxPerMs);
      window.scrollTo(0, y);
      if (y >= end) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  frames.shift();
  const sorted = [...frames].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  return {
    frames: frames.length,
    p50: pct(0.5),
    p95: pct(0.95),
    max: sorted[sorted.length - 1],
    janky: (100 * frames.filter((f) => f > 33.4).length) / frames.length,
    longTasks,
  };
});
await browser.close();

const f = (n) => n.toFixed(1);
console.log(
  `[perf mobile cpu×${cpu}] frames ${stats.frames}  p50 ${f(stats.p50)}ms  p95 ${f(stats.p95)}ms  max ${f(stats.max)}ms  janky ${f(stats.janky)}%  long tasks ${stats.longTasks}`
);
if (motion.endless) console.log(`endless animations running on mobile: ${motion.endless} (expected 0; they force recompositing while scrolling)`);
if (motion.scrubbed) console.log(`scroll-scrubbed animations on mobile: ${motion.scrubbed} (expected 0; they lag behind native momentum scroll)`);
process.exit(stats.janky > budget || motion.scrubbed || motion.endless ? 1 : 0);
