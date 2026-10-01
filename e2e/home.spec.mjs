import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5 Home (allengillon.com/): the hero LCP image, two doorways, the venue
// handbill, one pull-quote, the line to the other site, and accessibility.

const port = Number(process.env.SITE_DEV_PORT || 3001);
const HOME = `http://localhost:${port}/`;
const HERO = "/images/personal/allen-playing-red-gibson-waterfront.jpg";

test.describe("main home", () => {
  test("hero photo is the preloaded, sized, high-priority LCP image", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "load" });
    const preload = page.locator(`head link[rel="preload"][as="image"][href="${HERO}"]`);
    await expect(preload).toHaveCount(1);
    expect((await preload.getAttribute("fetchpriority"))?.toLowerCase()).toBe("high");
    const img = page.locator(`.home-photo img[src="${HERO}"]`);
    await expect(img).toHaveAttribute("width", "600");
    await expect(img).toHaveAttribute("height", "600");
    expect((await img.getAttribute("fetchpriority"))?.toLowerCase()).toBe("high");
    expect(await img.getAttribute("loading")).not.toBe("lazy");
    await expect(page.locator(".home-hero > h1.script")).toHaveText("Allen Gillon");
  });

  test("the framed photo sits inside the gutters; name and photo never overlap", async ({ page }) => {
    for (const width of [375, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(HOME, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const photo = document.querySelector(".home-photo").getBoundingClientRect();
        const names = [...document.querySelectorAll(".home-name")].map((n) => n.getBoundingClientRect());
        const intro = document.querySelector(".home-intro").getBoundingClientRect();
        const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        return {
          right: photo.right,
          left: photo.left,
          vw: document.documentElement.clientWidth,
          overlap: [...names, intro].some((b) => hit(b, photo)),
        };
      });
      // The two-ink frame (and its 3px offset line) stays inside the gutter.
      expect(r.vw - r.right, `photo right edge at ${width}`).toBeGreaterThanOrEqual(12);
      expect(r.vw - r.right, `photo right edge at ${width}`).toBeLessThanOrEqual(80);
      if (width < 900) expect(r.left, `photo left edge at ${width}`).toBeGreaterThanOrEqual(12);
      expect(r.overlap, `text over the photo at ${width}`).toBe(false);
    }
  });

  test("the 600px photo is never upscaled past 1.2x, and the name leads the doorways", async ({ page }) => {
    for (const width of [1280, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(HOME, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => ({
        photo: document.querySelector(".home-photo img").getBoundingClientRect().width,
        h1: parseFloat(getComputedStyle(document.querySelector(".home-hero > h1")).fontSize),
        door: parseFloat(getComputedStyle(document.querySelector(".door-word")).fontSize),
      }));
      expect(r.photo, `photo width at ${width}`).toBeLessThanOrEqual(721);
      expect(r.h1 / r.door, `name to door-word ratio at ${width}`).toBeGreaterThanOrEqual(1.8);
    }
  });

  test("the first doorway is on the first phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(HOME, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const bottom = await page.evaluate(() => document.querySelector(".door .door-word").getBoundingClientRect().bottom);
    expect(bottom).toBeLessThanOrEqual(812);
  });

  test("doorways read as links at rest; handbill has no frame; quote mark is silent", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "load" });
    const r = await page.evaluate(() => {
      const bill = document.querySelector(".bill");
      const pseudo = (p) => getComputedStyle(bill, p).content;
      return {
        underline: [...document.querySelectorAll(".door-word")].map((w) => getComputedStyle(w).textDecorationLine),
        frame: [pseudo("::before"), pseudo("::after")],
        border: getComputedStyle(bill).borderTopStyle,
        align: getComputedStyle(bill).textAlign,
      };
    });
    for (const u of r.underline) expect(u).toContain("underline");
    expect(r.frame).toEqual(["none", "none"]);
    expect(r.border).toBe("none");
    expect(r.align).not.toBe("center");
    const snap = await page.locator("main blockquote").ariaSnapshot();
    expect(snap).not.toContain("“");
    await expect(page.locator(".home-quote-mark")).toHaveAttribute("aria-hidden", "true");
  });

  test("two doorways, each one link with a drawing", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "load" });
    const doors = page.locator(".home-doors a.door");
    await expect(doors).toHaveCount(2);
    await expect(doors.nth(0)).toHaveAttribute("href", "/hire");
    await expect(doors.nth(1)).toHaveAttribute("href", "/music");
    await expect(doors.nth(0).locator(".door-word")).toHaveText("Bookings");
    await expect(doors.nth(1).locator(".door-word")).toHaveText("Albums");
    for (const i of [0, 1]) {
      await expect(doors.nth(i).locator('svg.two-ink[aria-hidden="true"]')).toHaveCount(1);
      await expect(doors.nth(i).locator("a")).toHaveCount(0);
    }
  });

  test("venue handbill is legible and printed only in the two inks", async ({ page }) => {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(HOME, { waitUntil: "load" });
      const venues = await page.evaluate(() => {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return [...document.querySelectorAll(".bill-venues li span")].map((s) => {
          const cs = getComputedStyle(s);
          return { text: s.textContent, rem: parseFloat(cs.fontSize) / rem, color: cs.color };
        });
      });
      expect(venues).toHaveLength(8);
      const inks = await page.evaluate(() => {
        const probe = (v) => {
          const el = document.createElement("span");
          el.style.color = `var(${v})`;
          document.body.appendChild(el);
          const c = getComputedStyle(el).color;
          el.remove();
          return c;
        };
        return [probe("--red-deep"), probe("--blue")];
      });
      for (const v of venues) {
        expect(v.rem, `${v.text} at ${width}`).toBeGreaterThanOrEqual(1.1);
        expect(inks, `${v.text} colour`).toContain(v.color);
      }
    }
    await expect(page.locator(".photoCollage, .venues")).toHaveCount(0);
  });

  test("one pull-quote with a cite, and an absolute link to the other site", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "load" });
    await expect(page.locator("main blockquote")).toHaveCount(1);
    await expect(page.locator("main figure cite")).toHaveText("Jan Hanson");
    const cross = page.locator(".home-cross a[data-cross-site='other']");
    await expect(cross).toHaveText("But wait, there's more 😊");
    expect(await cross.getAttribute("href")).toMatch(/^https?:\/\/other\./);
  });

  test("decorative SVG stays under 40KB and every drawing is hidden from AT", async ({ page }) => {
    await page.goto(HOME, { waitUntil: "load" });
    const r = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("main svg")];
      return {
        bytes: svgs.reduce((n, s) => n + s.outerHTML.length, 0),
        exposed: svgs.filter((s) => s.getAttribute("aria-hidden") !== "true").length,
      };
    });
    expect(r.bytes).toBeLessThan(40 * 1024);
    expect(r.exposed).toBe(0);
  });

  test("drawings are fully visible under reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(HOME, { waitUntil: "load" });
    await page.locator(".bill-umbrella").scrollIntoViewIfNeeded();
    const states = await page.evaluate(() => ({
      motionOk: document.documentElement.classList.contains("motion-ok"),
      opacities: [...document.querySelectorAll("main svg.two-ink")].map((s) => getComputedStyle(s).opacity),
    }));
    expect(states.motionOk).toBe(false);
    for (const o of states.opacities) expect(o).toBe("1");
    await ctx.close();
  });

  for (const reducedMotion of ["no-preference", "reduce"]) {
    test(`axe: no WCAG 2.2 AA violations (${reducedMotion})`, async ({ browser }) => {
      for (const width of [375, 1280]) {
        const ctx = await browser.newContext({ reducedMotion, viewport: { width, height: 900 } });
        const page = await ctx.newPage();
        await page.goto(HOME, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`), `at ${width}`).toEqual([]);
        await ctx.close();
      }
    });
  }
});
