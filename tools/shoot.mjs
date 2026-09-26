// Usage: node tools/shoot.mjs [--url http://localhost:8123] [--out screenshots] [--only mobile|desktop] [--sections] [--reduced] [--interact]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const flag = (k) => args.includes(`--${k}`);
const url = opt("url", "http://localhost:8123/");
const out = opt("out", "screenshots");
const only = opt("only", "");
mkdirSync(out, { recursive: true });

const viewports = [
  {
    name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  },
  {
    name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  },
].filter((v) => !only || v.name === only);

const browser = await chromium.launch();
let failed = false;
for (const vp of viewports) {
  const { name, ...ctxOpts } = vp;
  const ctx = await browser.newContext({
    viewport: { width: ctxOpts.width, height: ctxOpts.height },
    deviceScaleFactor: ctxOpts.deviceScaleFactor,
    isMobile: ctxOpts.isMobile,
    hasTouch: ctxOpts.hasTouch,
    userAgent: ctxOpts.userAgent,
    reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  const embedded = (u) => /vimeo|youtube|ytimg|googlevideo|doubleclick|cloudflare\.com\/cdn-cgi/.test(u);
  page.on("console", (m) => m.type() === "error" && !embedded(m.location()?.url || "") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  // browsers cancel media range requests when a video scrolls away before playing; that's not a missing file
  const cancelledMedia = (r) => /\.(mp4|webm)$/.test(r.url()) && /ERR_ABORTED/.test(r.failure()?.errorText || "");
  page.on("requestfailed", (r) => !embedded(r.url()) && !cancelledMedia(r) && errors.push(`request failed: ${r.url()} ${r.failure()?.errorText || ""}`));
  page.on("response", (r) => r.status() >= 400 && !embedded(r.url()) && errors.push(`${r.status()} ${r.url()}`));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const tag = `${name}${flag("reduced") ? "-reduced" : ""}`;
  await page.screenshot({ path: `${out}/${tag}-top.png` });
  const barcode = page.locator(".barcode img");
  if (await barcode.count()) await barcode.screenshot({ path: `${out}/${tag}-barcode.png` });

  // scroll through so scroll-triggered reveals fire
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += ctxOpts.height / 2) {
    await page.mouse.wheel(0, ctxOpts.height / 2);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 0) errors.push(`horizontal overflow: ${overflow}px`);
  const bigIcons = await page.evaluate(() =>
    [...document.querySelectorAll('svg:has(> use[href^="#ico-"])')]
      .map((s) => s.getBoundingClientRect())
      .filter((r) => r.width > 32 || r.height > 32).length
  );
  const brokenImgs = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"))
  );
  brokenImgs.forEach((src) => errors.push(`broken image: ${src}`));
  if (bigIcons) errors.push(`${bigIcons} social icons render larger than 32px`);

  if (flag("sections")) {
    const ids = await page.evaluate(() => [...document.querySelectorAll(".issue, #workshop, #origins, #letters, .powers-wrap")].map((e) => e.id || e.className.split(" ")[0]));
    for (const id of ids) {
      const loc = page.locator(`#${id}, .${id}`).first();
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/${tag}-${id}.png` });
    }
  }

  if (flag("interact")) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const pages = await page.evaluate(() => [...document.querySelectorAll(".page")].map((p) => p.id));
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1600);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(1600);
    const onPage = await page.evaluate(() => {
      const ps = [...document.querySelectorAll(".page")];
      return ps.findIndex((p) => Math.abs(p.getBoundingClientRect().top - 70) < 40);
    });
    if (onPage !== 1) errors.push(`arrow-key paging landed on page index ${onPage}, expected 1 (${pages[1]})`);
    if (!(await page.evaluate(() => document.getElementById("pager").classList.contains("show")))) errors.push("pager not shown after paging");
    const fresh = await ctx.newPage();
    await fresh.goto(url, { waitUntil: "networkidle" });
    await fresh.waitForTimeout(800);
    const lastIssue = await fresh.evaluate(() => [...document.querySelectorAll(".issue")].at(-1).id);
    await fresh.click(`.mini[href="#${lastIssue}"]`);
    await fresh.waitForTimeout(1800);
    const hidden = await fresh.evaluate(() =>
      [...document.querySelectorAll(".panel:not(.shop)")].filter((p) => {
        const r = p.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && getComputedStyle(p).clipPath.includes("100%");
      }).length
    );
    await fresh.screenshot({ path: `${out}/${tag}-jump.png` });
    await fresh.close();
    if (hidden) errors.push(`${hidden} on-screen panels still hidden after jumping via the cover strip`);
    await page.screenshot({ path: `${out}/${tag}-paged.png` });

    const power = page.locator(".power").first();
    await power.scrollIntoViewIfNeeded();
    await power.click();
    await page.waitForTimeout(700);
    if (!(await power.evaluate((e) => e.classList.contains("flipped")))) errors.push("power card did not flip");
    await page.screenshot({ path: `${out}/${tag}-power-flip.png` });

    const play = page.locator("#tv-grid [data-embed]").first();
    await play.scrollIntoViewIfNeeded();
    await play.click();
    await page.waitForTimeout(800);
    const src = await page.evaluate(() => document.querySelector("#lightbox[open] iframe")?.src || "");
    if (!src) errors.push("talk lightbox did not open with iframe");
    await page.screenshot({ path: `${out}/${tag}-lightbox.png` });
    await page.keyboard.press("Escape");

    const zoom = page.locator(".panel-media[data-zoom]").first();
    await zoom.scrollIntoViewIfNeeded();
    await zoom.click();
    await page.waitForTimeout(500);
    if (!(await page.evaluate(() => document.querySelector("#lightbox").open))) errors.push("media lightbox did not open");
    await page.keyboard.press("Escape");
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${tag}-full.png`, fullPage: true });

  console.log(`[${tag}] ${errors.length ? "ISSUES:\n  " + errors.join("\n  ") : "ok"}`);
  if (errors.length) failed = true;
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
