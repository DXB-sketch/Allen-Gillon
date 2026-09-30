import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5: /reviews, /comments (both hosts) and the other-site home "The sideboard".

const port = Number(process.env.SITE_DEV_PORT || 3001);
const MAIN = `http://localhost:${port}`;
const OTHER = `http://other.localhost:${port}`;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function axe(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

test.describe("/reviews", () => {
  test("reaches networkidle (the reviews request never stays open)", async ({ page }) => {
    await page.goto(`${MAIN}/reviews`, { waitUntil: "networkidle", timeout: 30_000 });
  });

  test("featured quote, table comments, approved reviews, then the form; no Back home", async ({ page }) => {
    await page.route("**/api/reviews", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({ reviews: [{ id: "a", name: "Pat", place: "Bribie RSL", body: "Lovely evening of music." }] }),
          })
        : route.continue(),
    );
    await page.goto(`${MAIN}/reviews`);
    await expect(page.locator(".approvedReviews figure")).toHaveCount(1);
    const order = await page.evaluate(() =>
      [".featuredReview", ".tableComments", ".approvedReviews", ".addReview"].map((s) => document.querySelector(s)?.getBoundingClientRect().top ?? -1),
    );
    expect(order.every((top) => top >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    await expect(page.getByText("Back home")).toHaveCount(0);
    await expect(page.locator(".featuredReview blockquote")).toHaveCount(1);
    await expect(page.locator(".tableComments li")).toHaveCount(4);
  });

  test("approved reviews section is absent when the API fails", async ({ page }) => {
    await page.goto(`${MAIN}/reviews`, { waitUntil: "networkidle" });
    await expect(page.locator(".approvedReviews")).toHaveCount(0);
  });

  test("every field has the same 2px border and the form links /privacy on the main host", async ({ page }) => {
    await page.goto(`${MAIN}/reviews`);
    const borders = await page.$$eval(".friendlyReviewForm input:not([name=website]), .friendlyReviewForm textarea", (els) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth, cs.borderTopStyle, cs.borderTopColor].join(" ");
      }),
    );
    expect(borders).toHaveLength(3);
    expect(new Set(borders).size).toBe(1);
    expect(borders[0]).toMatch(/^2px 2px 2px 2px solid/);
    const privacy = page.locator(".reviewPrivacy a");
    await expect(privacy).toHaveAttribute("href", `${MAIN}/privacy`);
  });

  test("axe: 0 violations", async ({ page }) => {
    await page.goto(`${MAIN}/reviews`, { waitUntil: "networkidle" });
    await axe(page);
  });
});

test.describe("/comments", () => {
  for (const [site, origin] of [["main", MAIN], ["other", OTHER]]) {
    test(`${site}: one filled button (SMS); back and Facebook are text links; axe clean`, async ({ page }) => {
      await page.goto(`${origin}/comments?subject=Misty`);
      const main = page.locator("main");
      await expect(main.locator(".btn")).toHaveCount(1);
      await expect(main.locator("button.btn")).toHaveText("Send as a text to Allen");
      await expect(main.locator(".back-link")).toHaveCount(1);
      const fb = main.getByRole("link", { name: "Or comment on Facebook" });
      await expect(fb).not.toHaveClass(/btn/);
      expect(await fb.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
      await axe(page);
    });
  }
});

test.describe("other-site home: the sideboard", () => {
  test("three art-led doorways, each a single link with one object", async ({ page }) => {
    await page.goto(`${OTHER}/`);
    const doorways = page.locator(".doorways > a");
    await expect(doorways).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const d = doorways.nth(i);
      await expect(d.locator("a")).toHaveCount(0);
      await expect(d.locator(".doorway-object img").first()).toBeVisible();
    }
    await expect(doorways.nth(0).locator("img[src*='little-ray/p001']")).toHaveCount(1);
    await expect(doorways.nth(1).locator(".frame-drawing")).toHaveCount(1);
    await expect(doorways.nth(2).locator(".corner")).toHaveCount(4);
    // Decorative svg stays under the 40KB budget (both ink copies included).
    const svgBytes = await page.$$eval("main svg", (els) => els.reduce((n, el) => n + el.outerHTML.length, 0));
    expect(svgBytes).toBeLessThan(40_000);
  });

  test("keeps its metadata and uses the W6 OG image", async ({ request }) => {
    const html = await (await request.get(`${OTHER}/`)).text();
    expect(html).toContain('<link rel="canonical" href="https://other.allengillon.com/"/>');
    expect(html).toContain('<meta property="og:image" content="https://other.allengillon.com/og/other/home.jpg"/>');
    expect(html).not.toContain("chinese-chimes-together.webp");
  });

  for (const width of [375, 1280]) {
    test(`axe at ${width}px: 0 violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${OTHER}/`);
      await axe(page);
    });
  }
});
