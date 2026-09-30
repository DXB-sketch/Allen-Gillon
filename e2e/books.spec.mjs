import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5 Stories page (/books on the other host): three drawn shelves.
const port = Number(process.env.SITE_DEV_PORT || 3001);
const BOOKS = `http://other.localhost:${port}/books`;

test.describe("/books shelves", () => {
  test("a visible H1, three shelf headings, and Allen's paragraph under the Chinese Chimes heading", async ({ page }) => {
    await page.goto(BOOKS);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h2")).toHaveText(["Chinese Chimes stories", "School plays", "Classroom textbooks"]);
    // The big shelf words read Stories, Plays, Textbooks on screen.
    for (const word of await page.locator(".shelf-word").all()) {
      expect(await word.evaluate((el) => getComputedStyle(el).textTransform)).toBe("capitalize");
    }
    const paragraph = page.locator("#stories-title + p");
    await expect(paragraph).toContainText("The characters in these stories are named after the musical scale");
  });

  test("one action per book: stories read and listen (with a text link), plays a preview and a price, textbooks read and download", async ({ page }) => {
    await page.goto(BOOKS);
    const stories = page.locator(".stories-shelf > li");
    await expect(stories).toHaveCount(4);
    for (const book of await stories.all()) {
      await expect(book.locator(".book-action")).toHaveCount(1);
      await expect(book.locator(".book-action")).toHaveText("Read and listen");
      const slug = (await book.locator(".book-action").getAttribute("href")).split("/").pop();
      await expect(book.locator(".book-text-link")).toHaveAttribute("href", `/read/${slug}/text`);
      await expect(book.locator("img")).toHaveAttribute("src", `/books/${slug}/p001.webp`);
    }

    const plays = page.locator(".plays-shelf > li");
    await expect(plays).toHaveCount(5);
    for (const book of await plays.all()) {
      await expect(book.locator(".book-action")).toHaveText(["Read a preview"]);
      await expect(book.locator(".book-price strong")).toHaveText("A$1");
      // The storefront gate: play links are off, so Buy says "coming soon".
      await expect(book.locator(".purchase-pending")).toHaveText("Online checkout coming soon");
      await expect(book.locator("a.btn")).toHaveCount(0);
    }

    const textbooks = page.locator(".texts-shelf > li");
    await expect(textbooks).toHaveCount(3);
    for (const book of await textbooks.all()) {
      await expect(book.locator(".book-action")).toHaveText(["Read online", "Download PDF"]);
    }
    await expect(page.locator("main")).not.toContainText("Contact Allen");
  });

  test("no numerals, menus or section-heading; one comment link for the page", async ({ page }) => {
    await page.goto(BOOKS);
    await expect(page.locator(".section-heading, .more-menu, .audiobook-number, .pno, .comment-link")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("⋯");
    await expect(page.locator(".section-comment")).toHaveCount(1);
  });

  test("covers are mouse-only duplicates of the book's link, hidden from keyboard and screen readers", async ({ page }) => {
    await page.goto(BOOKS);
    for (const cover of await page.locator(".book-cover").all()) {
      await expect(cover).toHaveAttribute("aria-hidden", "true");
      await expect(cover).toHaveAttribute("tabindex", "-1");
    }
  });

  test("decorative SVG stays inside the 40KB budget, all aria-hidden", async ({ page }) => {
    await page.goto(BOOKS);
    const { bytes, visible } = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("main svg")];
      return {
        bytes: svgs.reduce((n, s) => n + new Blob([s.outerHTML]).size, 0),
        visible: svgs.filter((s) => s.getAttribute("aria-hidden") !== "true").length,
      };
    });
    expect(bytes).toBeLessThanOrEqual(40 * 1024);
    expect(visible).toBe(0);
  });

  test("with reduced motion every drawing is in its final state", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BOOKS);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    const hidden = await page.evaluate(() => [...document.querySelectorAll(".two-ink")].filter((s) => getComputedStyle(s).opacity !== "1").length);
    expect(hidden).toBe(0);
    expect(await page.evaluate(() => document.documentElement.classList.contains("motion-ok"))).toBe(false);
    await context.close();
  });

  for (const width of [375, 1280, 1920]) {
    test(`axe: no WCAG 2.2 AA violations at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BOOKS, { waitUntil: "load" });
      // Let the shelves draw in so axe sees the final colours.
      const total = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < total; y += 300) {
        await page.evaluate((top) => scrollTo(0, top), y);
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(1800);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
});
