import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { artworks } from "../lib/art-catalog.mjs";

// W5 Ann's art on other.allengillon.com: counted checks, the hallway and the
// index, the painting dialog and its views, keyboard only, reduced motion.

const port = Number(process.env.SITE_DEV_PORT || 3001);
const OTHER = `http://other.localhost:${port}`;
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const macaws = artworks.find((a) => a.title === "Blue Macaws");

async function fetchHtml(request, path) {
  const res = await request.get(`${OTHER}${path}`, { headers: { host: `other.localhost:${port}` } });
  expect(res.status(), path).toBe(200);
  return res.text();
}
// The wall is ready for clicks once hydrated: the view toggle only renders then.
async function openWall(page, path = "/anns-art") {
  await page.goto(`${OTHER}${path}`);
  await expect(page.locator(".wall-toggle")).toBeVisible();
}
const mainOf = (html) => (html.match(/<main[\s\S]*<\/main>/) || [""])[0];

test.describe("counted checks", () => {
  test("the /anns-art index HTML has 0 Buy this painting and 0 View 1", async ({ request }) => {
    const html = await fetchHtml(request, "/anns-art");
    expect(html.split("Buy this painting").length - 1).toBe(0);
    expect(html.split("View 1").length - 1).toBe(0);
    expect(html).not.toContain("Original painting<");
    expect(html).not.toContain("By Ann Gillon<");
    expect(html).toContain("Originals, A$100-250, free delivery in Australia");
    // Every painting is in the server HTML, linked to its own page.
    for (const art of artworks) expect(html).toContain(`href="/anns-art/${art.id}"`);
  });

  test("every /anns-art/[id] has exactly one Buy or Enquire link, and the right Stripe link", async ({ request }) => {
    const { stripePaymentLink } = await import("../lib/storefront.mjs");
    for (const art of artworks) {
      const main = mainOf(await fetchHtml(request, `/anns-art/${art.id}`));
      const buys = main.match(/<a [^>]*>Buy this painting<\/a>/g) || [];
      const enquiries = main.match(/<a [^>]*>Enquire about this painting<\/a>/g) || [];
      expect(buys.length + enquiries.length, art.id).toBe(1);
      const link = stripePaymentLink(`art-${art.id}`);
      if (art.availability === "available" && link) expect(buys[0], art.id).toContain(`href="${link}"`);
      expect(main, art.id).toContain('href="/delivery"');
    }
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("shows the index by default, and the hallway only on request", async ({ page }) => {
    await openWall(page);
    await expect(page.locator(".wall-toggle")).toHaveText("Walk along the wall");
    expect(await page.evaluate(() => document.documentElement.classList.contains("art-hall"))).toBe(false);
    await expect(page.locator(".hall-controls")).toBeHidden();
    await expect(page.locator(".work-link").nth(10)).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("hallway", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("keyboard only: walk the wall, open a painting, Tab stays in the dialog, Esc returns", async ({ page }) => {
    await openWall(page);
    await expect(page.locator(".wall-toggle")).toHaveText("See every painting at once");
    await page.locator(".wall-toggle").focus();
    await page.keyboard.press("Tab");
    const links = page.locator(".work-link");
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(links.nth(1)).toBeFocused();
    await expect(page.locator(".hall-count")).toHaveText(`2 of ${artworks.length}`);
    // Only the current painting is in the Tab order: Tab leaves the wall.
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Previous painting" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Next painting" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator(".hall-count")).toHaveText(`3 of ${artworks.length}`);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(links.nth(2)).toBeFocused();

    const art = artworks[2];
    await page.keyboard.press("Enter");
    const dialog = page.locator("dialog.painting-dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(`${OTHER}/anns-art/${art.id}`);
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(art.title);
    await expect(dialog.locator("a", { hasText: /Buy this painting|Enquire about this painting/ })).toHaveCount(1);
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => {
        const a = document.activeElement;
        return !a || a === document.body || !!a.closest("dialog");
      });
      expect(inside).toBe(true);
    }
    const results = await new AxeBuilder({ page }).include("dialog").withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(`${OTHER}/anns-art`);
    await expect(links.nth(2)).toBeFocused();
  });

  test("the back button closes the dialog", async ({ page }) => {
    await openWall(page);
    await page.locator(".work-link").first().click();
    await expect(page.locator("dialog.painting-dialog")).toBeVisible();
    await expect(page).toHaveURL(`${OTHER}/anns-art/${artworks[0].id}`);
    await page.goBack();
    await expect(page.locator("dialog.painting-dialog")).toBeHidden();
    await expect(page).toHaveURL(`${OTHER}/anns-art`);
    await expect(page.locator(".wall-toggle")).toHaveText("See every painting at once");
  });

  test("the vertical wheel never moves the hallway; the arrows do", async ({ page }) => {
    await openWall(page);
    const track = page.locator(".artgrid");
    await track.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + 100);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
    await page.getByRole("button", { name: "Next painting" }).click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test("rooms are text filters with aria-pressed and a live count", async ({ page }) => {
    await openWall(page);
    const animals = page.getByRole("button", { name: "Animals" });
    await animals.click();
    await expect(animals).toHaveAttribute("aria-pressed", "true");
    const count = artworks.filter((a) => a.category === "Animals").length;
    await expect(page.getByRole("status").filter({ hasText: "in animals" })).toHaveText(`${count} paintings in animals`);
    await expect(page.locator(".work")).toHaveCount(count);
    await expect(page.locator(".hall-count")).toHaveText(`1 of ${count}`);
  });

  test("See every painting at once shows the index", async ({ page }) => {
    await openWall(page);
    await page.locator(".wall-toggle").click();
    await expect(page.locator(".wall-toggle")).toHaveText("Walk along the wall");
    await expect(page.locator(".hall-controls")).toBeHidden();
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("dialog views change by arrow keys and the overlaid arrows", async ({ page }) => {
    await openWall(page);
    await page.locator(`a[href="/anns-art/${macaws.id}"]`).click();
    const dialog = page.locator("dialog.painting-dialog");
    const n = macaws.images.length;
    await expect(dialog.locator(".views-count")).toHaveText(`View 1 of ${n}`);
    await page.keyboard.press("ArrowRight");
    await expect(dialog.locator(".views-count")).toHaveText(`View 2 of ${n}`);
    // On a mouse the arrows are hidden until hover; hovering the picture shows them.
    const next = dialog.getByRole("button", { name: "Next view" });
    await page.mouse.move(2, 2);
    await expect(next).toHaveCSS("opacity", "0");
    await dialog.locator(".views-stage").hover();
    await expect(next).toHaveCSS("opacity", "1");
    await next.click();
    await expect(dialog.locator(".views-count")).toHaveText(`View 3 of ${n}`);
    await dialog.getByRole("button", { name: "View 1", exact: true }).click();
    await expect(dialog.locator(".views-count")).toHaveText(`View 1 of ${n}`);
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test("view arrows are always visible and a swipe changes the view", async ({ page }) => {
    await page.goto(`${OTHER}/anns-art/${macaws.id}`);
    const stage = page.locator(".views-stage");
    await expect(page.getByRole("button", { name: "Next view" })).toHaveCSS("opacity", "1");
    await expect(page.locator(".views-count")).toHaveText(`View 1 of ${macaws.images.length}`);
    const box = await stage.boundingBox();
    const y = box.y + box.height / 2;
    // Retried until hydrated: a swipe from right to left shows the next view.
    await expect(async () => {
      await stage.dispatchEvent("pointerdown", { pointerType: "touch", clientX: box.x + box.width - 40, clientY: y, isPrimary: true });
      await stage.dispatchEvent("pointerup", { pointerType: "touch", clientX: box.x + 40, clientY: y, isPrimary: true });
      await expect(page.locator(".views-count")).toHaveText(`View 2 of ${macaws.images.length}`, { timeout: 1000 });
    }).toPass();
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("the hallway fits a phone and shows the next painting peeking in", async ({ page }) => {
    await openWall(page);
    const second = await page.locator(".work").nth(1).boundingBox();
    expect(second.x).toBeLessThan(375);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
