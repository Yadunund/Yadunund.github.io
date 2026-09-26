// Usage: node tools/check.mjs [--url http://localhost:8123/] [--skip-external]
import { chromium } from "playwright";

const args = process.argv.slice(2);
const i = args.indexOf("--url");
const url = i >= 0 ? args[i + 1] : "http://localhost:8123/";
const skipExternal = args.includes("--skip-external");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const browser = await chromium.launch();
const page = await browser.newPage({ userAgent: UA });
let bytes = 0;
page.on("response", async (r) => {
  try {
    bytes += (await r.body()).length;
  } catch {}
});
await page.goto(url, { waitUntil: "networkidle" });
const initialKB = Math.round(bytes / 1024);

const refs = await page.evaluate(() => {
  const abs = (u) => new URL(u, location.href).href;
  const out = new Set();
  document.querySelectorAll("a[href]").forEach((a) => a.getAttribute("href").startsWith("#") || out.add(abs(a.href)));
  document.querySelectorAll("img[src], video[data-src], video[poster], [data-src]").forEach((e) => {
    for (const k of ["src", "poster", "data-src"]) if (e.getAttribute(k)) out.add(abs(e.getAttribute(k)));
  });
  document.querySelectorAll("[data-embed]").forEach((e) => out.add(e.dataset.embed));
  return [...out];
});
await browser.close();

const bad = [];
await Promise.all(
  refs.map(async (u) => {
    if (u.startsWith("mailto:")) return;
    const local = u.startsWith(new URL(url).origin);
    if (!local && skipExternal) return;
    try {
      let r = await fetch(u, { method: "HEAD", redirect: "follow", headers: { "user-agent": UA } });
      if (r.status >= 400) r = await fetch(u, { redirect: "follow", headers: { "user-agent": UA } });
      // sites that block bots (LinkedIn 999, X 403, Cloudflare 401/403) are reported but not failed
      const blocked = [401, 403, 429, 999].includes(r.status) && !local;
      if (r.status >= 400) bad.push(`${blocked ? "WARN" : "FAIL"} ${r.status} ${u}`);
    } catch (e) {
      bad.push(`FAIL ${e.cause?.code || e.message} ${u}`);
    }
  })
);

console.log(`checked ${refs.length} refs, initial load ${initialKB} KB`);
bad.sort().forEach((b) => console.log(b));
process.exit(bad.some((b) => b.startsWith("FAIL")) ? 1 : 0);
