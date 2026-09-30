import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

// W7 accessibility and legal, on both hosts of the dev server. The reader
// (/read/**) belongs to W4 and is not covered here.
const port = Number(process.env.SITE_DEV_PORT || 3001);
const HOSTS = { main: `http://localhost:${port}`, other: `http://other.localhost:${port}` };
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const legal = JSON.parse(readFileSync(new URL("../content/legal.config.json", import.meta.url), "utf8"));
const LEGAL_PATHS = ["/privacy", "/terms", "/accessibility"];

const ROUTES = {
  main: ["/", "/hire", "/music", "/reviews", "/shows", "/comments", ...(legal.published ? LEGAL_PATHS : [])],
  other: ["/", "/biography", "/books", "/anns-art", "/anns-art/ann-426502619623139", "/delivery", "/comments"],
};

const VAGUE = /^(here|click here|read more|more|learn more|find out more|this|link|this page)$/i;

for (const [site, base] of Object.entries(HOSTS)) {
  test.describe(`${site} landmarks and links`, () => {
    for (const path of ROUTES[site]) {
      test(`${path}: one main#main, one h1, banner and nav, meaningful links, axe clean`, async ({ page }) => {
        await page.goto(`${base}${path}`);
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("main#main[tabindex='-1']")).toHaveCount(1);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("body header.mast")).toHaveCount(1);
        await expect(page.locator("header.mast nav")).toHaveCount(1);
        await expect(page.locator("body footer")).toHaveCount(1);
        // No landmark inside main may be another main, and the mast and footer sit outside it.
        await expect(page.locator("main header.mast, main footer")).toHaveCount(0);

        const names = await page.locator("a[href]").evaluateAll((links) =>
          links
            .filter((a) => a.getClientRects().length && getComputedStyle(a).visibility !== "hidden" && !a.closest("[aria-hidden='true']"))
            .map((a) => (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim()),
        );
        expect(names.filter((n) => VAGUE.test(n))).toEqual([]);
        expect(names.filter((n) => n === "")).toEqual([]);

        const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
      });
    }

    test("the skip link is the first tab stop and moves focus to main", async ({ page }) => {
      await page.goto(`${base}/`);
      await page.keyboard.press("Tab");
      const skip = page.locator(".skip-link");
      await expect(skip).toBeFocused();
      await expect(skip).toHaveAttribute("href", "#main");
      await page.keyboard.press("Enter");
      await expect(page.locator("main#main")).toBeFocused();
    });

    test("the footer carries the contact block, legal links per the gate and the copyright line", async ({ page }) => {
      await page.goto(`${base}/`);
      const footer = page.locator("footer");
      await expect(footer).toContainText("Bribie Island QLD");
      await expect(footer.locator('a[href="sms:+61438747882"]')).toHaveCount(1);
      await expect(footer.locator('a[href="mailto:support@allengillon.com"]')).toHaveText("support@allengillon.com");
      await expect(footer.locator('a[href*="facebook.com"]')).toHaveCount(1);
      await expect(footer).toContainText(`© ${new Date().getFullYear()} Allen Gillon · Paintings © Ann Gillon`);
      const legalNav = footer.locator('nav[aria-label="Legal"] a');
      if (!legal.published) {
        await expect(legalNav).toHaveCount(0);
        for (const path of LEGAL_PATHS) await expect(footer.locator(`a[href$="${path}"]`)).toHaveCount(0);
      } else {
        await expect(legalNav).toHaveCount(3);
        const hrefs = await legalNav.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
        for (const href of hrefs) {
          if (site === "other") expect(href).toMatch(/^http:\/\/localhost:\d+\/(privacy|terms|accessibility)$/);
          else expect(href).toMatch(/^\/(privacy|terms|accessibility)$/);
        }
      }
    });

    if (!legal.published) {
      test("the legal routes 404 while unpublished", async ({ request }) => {
        for (const path of LEGAL_PATHS) {
          const res = await request.get(`${base}${path}`, { maxRedirects: 0 });
          expect(res.status(), `${site}${path}`).toBe(404);
        }
      });
    }
  });
}

test.describe("media and the now-playing bar", () => {
  test("the self-hosted Timeless videos have posters and English captions", async ({ page, request }) => {
    await page.goto(`${HOSTS.main}/music`);
    const videos = page.locator("video");
    await expect(videos).toHaveCount(2);
    for (const video of await videos.all()) {
      expect(await video.getAttribute("poster")).toMatch(/\.webp$/);
      const track = video.locator('track[kind="captions"][srclang="en"]');
      await expect(track).toHaveCount(1);
      const res = await request.get(`${HOSTS.main}${await track.getAttribute("src")}`);
      expect(res.status()).toBe(200);
      expect((await res.text()).startsWith("WEBVTT")).toBe(true);
    }
  });

  test("every story audiobook on /books has a text version beside it", async ({ page }) => {
    await page.goto(`${HOSTS.other}/books`);
    const stories = page.locator("#stories li.book");
    const count = await stories.count();
    expect(count).toBeGreaterThan(0);
    for (const story of await stories.all()) {
      await expect(story.locator('a[href$="/text"]')).toHaveCount(1);
    }
  });

  for (const width of [1280, 375]) {
    test(`scroll padding matches the now-playing bar at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${HOSTS.main}/music`);
      await page.evaluate(() => document.getElementById("nowbar").classList.add("on"));
      const { padding, bar } = await page.evaluate(() => ({
        padding: parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom),
        bar: document.getElementById("nowbar").getBoundingClientRect().height,
      }));
      expect(Math.abs(padding - bar)).toBeLessThanOrEqual(2);
    });
  }
});
