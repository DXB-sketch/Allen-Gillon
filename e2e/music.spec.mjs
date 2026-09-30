import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5 Albums (/music): the sleeve toggle, free downloads, the record that turns
// only while its album plays, the lite YouTube facade, the instruments and axe.

const ALBUMS = ["That's The Time", "Wonderful World", "Misty", "I Just Called"];

test("each sleeve is the only toggle, named for its album, and opens its panel", async ({ page }) => {
  await page.goto("/music", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText("Albums");
  await expect(page.locator(".tracklist-toggle")).toHaveCount(0);
  for (const title of ALBUMS) {
    const sleeve = page.getByRole("button", { name: `Show tracks for ${title}`, exact: true });
    await expect(sleeve).toHaveAttribute("aria-expanded", "false");
    const box = await sleeve.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    const panel = page.locator(`#${await sleeve.getAttribute("aria-controls")}`);
    await expect(panel).toBeHidden();
    await sleeve.click();
    await expect(sleeve).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    // One primary action inside the open panel.
    await expect(panel.getByRole("button", { name: "Download album free" })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Download album free" })).toHaveCount(1);
    // Each track row: play, title, time and a visible 44px download link.
    const downloads = panel.locator("a.track-download");
    const count = await downloads.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const d = await downloads.nth(i).boundingBox();
      expect(d.width).toBeGreaterThanOrEqual(44);
      expect(d.height).toBeGreaterThanOrEqual(44);
      await expect(downloads.nth(i)).toHaveAttribute("download", "");
    }
  }
  // Opening one album closes the one before.
  await expect(page.locator(".trkpanel:visible")).toHaveCount(1);
});

test("albums are free: no Payment Link or price anywhere on the page", async ({ page }) => {
  await page.goto("/music", { waitUntil: "networkidle" });
  const html = await page.content();
  expect(html).not.toMatch(/buy\.stripe\.com/);
  expect(html).not.toMatch(/A\$\s?\d|\$\d+\s?AUD/);
});

test("the record turns only while that album is playing", async ({ page }) => {
  await page.route(/\.mp3(\?.*)?$/, (route) => route.continue());
  await page.goto("/music", { waitUntil: "networkidle" });
  const misty = page.locator("#misty");
  const disc = misty.locator(".disc");
  const state = () => disc.evaluate((el) => {
    const cs = getComputedStyle(el);
    return cs.animationName === "none" ? "none" : cs.animationPlayState;
  });
  expect(await state()).toBe("none");
  await page.getByRole("button", { name: "Show tracks for Misty", exact: true }).click();
  expect(await state()).toBe("none"); // open but not playing: still
  await page.getByRole("button", { name: "Play Misty", exact: true }).click();
  await expect(page.locator("#nowname")).toHaveText("Playing: Misty", { timeout: 15_000 });
  await expect.poll(state).toBe("running");
  expect(await page.locator("#thats-the-time .disc").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.getByRole("button", { name: "Pause Misty", exact: true }).click();
  await expect(page.locator("#nowname")).toHaveText("Paused: Misty");
  await expect.poll(state).toBe("paused");
});

test("the record never turns under reduced motion", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto(`http://localhost:${process.env.SITE_DEV_PORT || 3001}/music`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Show tracks for Misty", exact: true }).click();
  await page.getByRole("button", { name: "Play Misty", exact: true }).click();
  await expect(page.locator("#nowname")).toHaveText("Playing: Misty", { timeout: 15_000 });
  expect(await page.locator("#misty .disc").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.close();
});

test("videos load nothing from YouTube until asked, then play from youtube-nocookie", async ({ page }) => {
  const youtube = [];
  page.on("request", (r) => /youtube|ytimg|googlevideo/.test(r.url()) && youtube.push(r.url()));
  await page.goto("/music", { waitUntil: "networkidle" });
  await expect(page.locator("#originals iframe")).toHaveCount(0);
  expect(youtube).toEqual([]);
  const facade = page.getByRole("link", { name: "Play video: Jamie" });
  await expect(facade).toHaveAttribute("href", "https://www.youtube.com/watch?v=AWTyzHr4eaI");
  const ratio = await facade.evaluate((el) => el.getBoundingClientRect().width / el.getBoundingClientRect().height);
  expect(Math.abs(ratio - 16 / 9)).toBeLessThan(0.02);
  await facade.click();
  const frame = page.locator("#originals iframe");
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\/AWTyzHr4eaI\?autoplay=1/);
  await expect(frame).toHaveAttribute("title", "Jamie");
});

test("Timeless stays here on an ink band with absolute links to the other site", async ({ page }) => {
  await page.goto("/music", { waitUntil: "networkidle" });
  const band = page.locator("#timeless");
  await expect(band).toHaveClass(/\bink\b/);
  const cross = band.locator("a[data-cross-site='other']");
  await expect(cross).toHaveCount(2);
  for (const href of await cross.evaluateAll((els) => els.map((a) => a.getAttribute("href")))) {
    expect(href).toMatch(/^https?:\/\/other\./);
  }
  await expect(band.locator("video")).toHaveCount(2);
});

test.describe("instruments", () => {
test.use({ reducedMotion: "reduce" });
// Instruments: decorative, never over text, never sized from the viewport,
// running off the page edge on wide screens; one peeks from the header on phones.
for (const width of [320, 375, 768, 1024, 1280, 1440, 1920, 2560]) {
  test(`instruments never cover text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/music", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const shown = [...document.querySelectorAll(".instrument")].filter((el) => el.getClientRects().length && getComputedStyle(el).display !== "none");
      const collect = () => {
      const textRects = [];
      const walker = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest(".instrument,.visually-hidden,[hidden]")) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width && r.height) textRects.push({ r, text: node.textContent.trim().slice(0, 30) });
      }
      return textRects;
      };
      const style = document.createElement("style");
      style.textContent = ".instrument :is(path,line,polyline,polygon,circle,ellipse,rect){pointer-events:visibleStroke!important}";
      document.head.appendChild(style);
      const hits = [];
      for (const inst of shown) {
        inst.scrollIntoView({ block: "center", behavior: "instant" });
        // The instrument's visible box: the svg clipped by its own box when it clips.
        const svg = inst.querySelector("svg").getBoundingClientRect();
        const own = inst.getBoundingClientRect();
        const clips = getComputedStyle(inst).overflow.includes("clip") || getComputedStyle(inst).overflow.includes("hidden");
        const box = clips
          ? { left: Math.max(svg.left, own.left), right: Math.min(svg.right, own.right), top: Math.max(svg.top, own.top), bottom: Math.min(svg.bottom, own.bottom) }
          : svg;
        // Strokes, not the rotated bounding box: sample each text rect against
        // the painted strokes with elementsFromPoint.
        for (const { r, text } of collect()) {
          if (r.bottom < 0 || r.top > innerHeight) continue;
          if (r.right <= box.left || r.left >= box.right || r.bottom <= box.top || r.top >= box.bottom) continue;
          for (let x = r.left + 1; x < r.right; x += 4) {
            for (let y = r.top + 1; y < r.bottom; y += 4) {
              const stack = document.elementsFromPoint(x, y);
              if (stack.some((el) => inst.contains(el) && el.tagName !== "svg" && el.tagName !== "g")) {
                hits.push(`${inst.className} over "${text}"`);
                x = r.right; y = r.bottom;
              }
            }
          }
        }
      }
      return {
        shown: shown.map((el) => el.className),
        hits,
        aria: shown.every((el) => el.querySelector("svg").getAttribute("aria-hidden") === "true"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(result.hits).toEqual([]);
    expect(result.aria).toBe(true);
    expect(result.overflow).toBeLessThanOrEqual(0);
    if (width < 1024) expect(result.shown).toEqual(["instrument instrument--gibson"]);
    else expect(result.shown.length).toBe(4);
  });
}

});

test("instrument CSS never sizes from the viewport width", async ({ page }) => {
  await page.goto("/music", { waitUntil: "load" });
  const css = await page.evaluate(() =>
    [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } })
      .filter((t) => /instrument/.test(t)).join("\n"));
  // Sizes come from grid cells (%), px clamps or the title's own em size.
  expect(css).not.toMatch(/(?:^|[;{\s])(?:width|height|max-width|min-width)\s*:[^;}]*vw/);
  expect(css).not.toMatch(/100vw/);
});

for (const [label, open] of [["closed", null], ["open", "Misty"]]) {
  test(`axe: /music ${label} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto("/music", { waitUntil: "networkidle" });
    if (open) await page.getByRole("button", { name: `Show tracks for ${open}`, exact: true }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}
