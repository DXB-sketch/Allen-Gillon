import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5 Timeless (/biography on other.allengillon.com).
const port = Number(process.env.SITE_DEV_PORT || 3001);
const URL = `http://other.localhost:${port}/biography`;

test("every photo and video renders once, and the sticky aside is gone", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  expect(await page.locator("main aside").count()).toBe(0);
  const srcs = await page.$$eval("main img, main video source", (els) => els.map((e) => e.getAttribute("src")));
  expect(srcs.length).toBeGreaterThanOrEqual(6);
  expect(new Set(srcs).size, `duplicates in ${srcs.join(", ")}`).toBe(srcs.length);
  expect(await page.locator("main .scene video").count()).toBe(1);
});

test("Timeless Duo, with Ann sits under Today on an ink band, linking back to the main site", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const band = page.locator("#timeless-duo");
  await expect(band).toHaveClass(/\bink\b/);
  expect(await band.evaluate((el) => el.previousElementSibling.id)).toBe("timeless");
  await expect(band.locator("h2")).toHaveText("Timeless Duo, with Ann");
  await expect(band.locator("video")).toHaveCount(2);
  const cross = band.locator("a[data-cross-site='main']");
  await expect(cross).toHaveCount(2);
  for (const href of await cross.evaluateAll((els) => els.map((a) => a.getAttribute("href")))) {
    expect(href).not.toMatch(/\/\/other\./);
  }
});

test("alt text describes each image instead of repeating its caption", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const figs = await page.$$eval("main figure:has(img)", (els) =>
    els.map((f) => ({ alt: f.querySelector("img").getAttribute("alt") || "", cap: f.querySelector("figcaption")?.textContent.trim() || "" })),
  );
  expect(figs.length).toBe(5);
  for (const { alt, cap } of figs) {
    expect(alt.length, `alt for "${cap}"`).toBeGreaterThan(cap.length + 20);
    expect(alt.toLowerCase().replace(/\W+/g, " ").trim()).not.toBe(cap.toLowerCase().replace(/\W+/g, " ").trim());
  }
});

test("the video has a poster, lazy preload and a captions track that loads", async ({ page, request }) => {
  await page.goto(URL, { waitUntil: "load" });
  const video = page.locator("main .scene video");
  await expect(video).toHaveAttribute("poster", /\.jpg$/);
  expect(["none", "metadata"]).toContain(await video.getAttribute("preload"));
  const track = video.locator('track[kind="captions"]');
  await expect(track).toHaveCount(1);
  await expect(track).toHaveAttribute("srclang", "en");
  for (const attr of ["poster"]) {
    const res = await request.get(new globalThis.URL(await video.getAttribute(attr), URL).href);
    expect(res.status()).toBe(200);
  }
  const vtt = await request.get(new globalThis.URL(await track.getAttribute("src"), URL).href);
  expect(vtt.status()).toBe(200);
  expect((await vtt.text()).startsWith("WEBVTT")).toBe(true);
});

for (const width of [375, 1280, 1920]) {
  test(`the curtain sits above the h1 and never overlaps it (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(2600); // let the one-time parting finish
    const r = await page.evaluate(() => {
      const curtain = document.querySelector(".curtain");
      const h1 = document.querySelector("main h1");
      const box = (el) => el.getBoundingClientRect();
      const drapes = [...curtain.querySelectorAll("svg")].map((s) => box(s).bottom);
      return {
        before: !!(curtain.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING),
        curtainBottom: Math.max(box(curtain).bottom, ...drapes),
        h1Top: box(h1).top,
        hidden: curtain.getAttribute("aria-hidden"),
      };
    });
    expect(r.before).toBe(true);
    expect(r.hidden).toBe("true");
    expect(r.curtainBottom).toBeLessThanOrEqual(r.h1Top);
  });
}

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });
  test("the curtain renders parted (no transform) and content is visible", async ({ page }) => {
    await page.goto(URL, { waitUntil: "load" });
    const t = await page.$$eval(".curtain-drape", (els) => els.map((e) => getComputedStyle(e).transform));
    expect(t).toEqual(["none", "none"]);
    await expect(page.locator("main h1")).toBeVisible();
    const op = await page.$$eval("main [data-motion]", (els) => els.map((e) => getComputedStyle(e).opacity));
    expect(op.every((o) => o === "1")).toBe(true);
  });
});

test("the Matthew Allen 5 scene stays quiet: no year, drawing, corners or bleed", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const quiet = page.locator("section:has(#era-ma5)");
  await expect(quiet.locator("svg, .scene-year, .snap-corner, .snap--bleed")).toHaveCount(0);
});

test("decorative SVG stays under 40KB", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const bytes = await page.$$eval("main svg", (els) => els.reduce((n, s) => n + s.outerHTML.length, 0));
  expect(bytes).toBeLessThan(40 * 1024);
});

for (const width of [375, 1280, 1920]) {
  test(`bleeding photos alternate sides and never overlap the text (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    const r = await page.$$eval(".snap--bleed", (els) =>
      els.map((f) => {
        const img = f.querySelector("img").getBoundingClientRect();
        const text = f.closest(".scene").querySelector(".scene-text").getBoundingClientRect();
        const overlap = !(img.right <= text.left || img.left >= text.right || img.bottom <= text.top || img.top >= text.bottom);
        return { left: Math.round(img.left), right: Math.round(img.right), vw: document.documentElement.clientWidth, overlap, natural: Number(f.querySelector("img").getAttribute("width")), w: img.width };
      }),
    );
    expect(r.length).toBe(2);
    expect(r[0].left).toBe(0); // Page One Revue: off the left edge
    expect(r[1].right).toBe(r[1].vw); // Ann and Allen on stage: off the right edge
    for (const b of r) {
      expect(b.overlap).toBe(false);
      expect(b.w).toBeLessThanOrEqual(b.natural + 0.5); // never upscaled past native size
    }
  });
}

test("the curtain does not flicker at load: parted and still once motion starts", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "load" });
  await page.waitForFunction(() => document.documentElement.classList.contains("motion-ok"));
  for (let i = 0; i < 6; i++) {
    const s = await page.$$eval(".curtain-drape", (els) => els.map((e) => `${getComputedStyle(e).opacity} ${getComputedStyle(e).transform}`));
    expect(s).toEqual(["1 none", "1 none"]);
    await page.waitForTimeout(150);
  }
});

for (const width of [375, 1280, 1920]) {
  test(`axe: no WCAG 2.2 AA violations (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
  });
}
