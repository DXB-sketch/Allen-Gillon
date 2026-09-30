import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The book reader (components/reader/BookReader.jsx) on the other host.
// Run: SITE_DEV_PORT=3812 npx playwright test e2e/reader.spec.mjs

const port = Number(process.env.SITE_DEV_PORT || 3001);
const OTHER = `http://other.localhost:${port}`;

async function openReader(page, slug) {
  await page.goto(`${OTHER}/read/${slug}`, { waitUntil: "load" });
  await expect(page.locator(".bkr[data-ready]")).toBeVisible({ timeout: 30_000 });
}

test.describe("reader, reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("keyboard shortcuts work only while focus is inside the reader", async ({ page }) => {
    await openReader(page, "little-ray");
    const counter = page.locator(".bkr-counter");
    /* The cover opens once to printed Page 1, so the counter matches the page. */
    await expect(counter).toHaveText("Page 1 of 18");
    await page.locator("h1").click();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    await expect(counter).toHaveText("Page 1 of 18");
    await page.locator(".bkr-next").focus();
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText("Page 2 of 18");
    await page.keyboard.press("End");
    await expect(counter).toHaveText("Page 18 of 18");
    await page.keyboard.press("Home");
    await expect(counter).toHaveText("Cover");
  });

  test("turns are instant under reduced motion", async ({ page }) => {
    await openReader(page, "practice-in-communication-book-1");
    await page.locator(".bkr-stage").scrollIntoViewIfNeeded();
    const counter = page.locator(".bkr-counter");
    await expect(counter).toHaveText(/Pages 6 and 7 of 98|Page 6 of 98/);
    const before = await counter.textContent();
    const took = await page.evaluate(async () => {
      const start = performance.now();
      const el = document.querySelector(".bkr-counter");
      const was = el.textContent;
      document.querySelector(".bkr-next").click();
      while (el.textContent === was && performance.now() - start < 2000) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      return performance.now() - start;
    });
    expect(await counter.textContent()).not.toBe(before);
    expect(took).toBeLessThan(250);
  });

  test("a play shows its preview, then an end page with the coming-soon Buy", async ({ page }) => {
    await openReader(page, "melting-pot");
    const counter = page.locator(".bkr-counter");
    await expect(counter).toContainText("(full script 47 pages)");
    /* It opens on page 2 of the preview, never on the end page. */
    await expect(counter).toHaveText(/^Preview: pages? 2( and 3)? of 6 \(full script 47 pages\)$/);
    await expect(page.locator(".bkr-next")).not.toHaveAttribute("aria-disabled", "true");
    await page.locator(".bkr-next").focus();
    await page.keyboard.press("End");
    await expect(counter).toContainText("End of the preview (full script 47 pages)");
    const end = page.locator(".bkr-end");
    await expect(end).toBeVisible();
    await expect(end).toContainText("That’s the preview.");
    await expect(end).toContainText("Buy the full script (A$1)");
    await expect(end).toContainText("A$1 download. Online checkout coming soon");
    await expect(page.locator('a[href*="buy.stripe.com"]')).toHaveCount(0);
    await expect(page.locator(".bkr a[download]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Listen to a preview" })).toBeVisible();
  });

  test("play page images stop at the preview", async ({ request }) => {
    expect((await request.get(`${OTHER}/books/melting-pot/p006.webp`)).status()).toBe(200);
    expect((await request.get(`${OTHER}/books/melting-pot/p007.webp`)).status()).toBe(404);
    expect((await request.get(`${OTHER}/books/melting-pot/melting-pot.pdf`)).status()).toBe(404);
    expect((await request.get(`${OTHER}/audio/school-play-audiobooks/melting-pot.mp3`)).status()).toBe(404);
    expect((await request.get(`${OTHER}/audio/school-play-previews/melting-pot.mp3`)).status()).toBe(200);
  });

  test("a textbook offers its PDF", async ({ page, request }) => {
    await openReader(page, "practice-in-communication-book-1");
    const link = page.locator(".bkr-toolbar a[download]");
    await expect(link).toHaveText(/Download the PDF/);
    const href = await link.getAttribute("href");
    expect(href).toBe("/books/practice-in-communication-book-1/practice-in-communication-book-1.pdf");
    const res = await request.head(`${OTHER}${href}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });

  test("Show the words on this page toggles the page's text", async ({ page }) => {
    await openReader(page, "little-ray");
    await expect(page.locator(".bkr-counter")).toHaveText("Page 1 of 18");
    const toggle = page.getByRole("button", { name: "Show the words on this page" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const words = page.locator(".bkr-words");
    await expect(words).toBeVisible();
    await expect(words).toContainText("Page 1");
    await expect(words).toContainText("awakening");
    await page.locator(".bkr-next").click();
    await expect(words).toContainText("Page 2");
    await expect(words).toContainText("Master Chi Lu is sweeping the floor");
    await page.getByRole("button", { name: "Hide the words" }).click();
    await expect(words).toBeHidden();
  });

  test("Go to page uses the printed page numbers", async ({ page }) => {
    await openReader(page, "practice-in-communication-book-2");
    const disclosure = page.getByRole("button", { name: "Go to page" });
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await disclosure.click();
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
    const form = page.locator(`#${await disclosure.getAttribute("aria-controls")}`.replace(/:/g, "\\:"));
    await expect(form).toBeVisible();
    await page.getByLabel(/Page number/).fill("20");
    await page.getByRole("button", { name: "Go", exact: true }).click();
    await expect(page.locator(".bkr-counter")).toContainText("20");
  });
});

test("text routes: stories and textbooks only", async ({ request }) => {
  const story = await request.get(`${OTHER}/read/little-ray/text`);
  expect(story.status()).toBe(200);
  const html = await story.text();
  expect(html).toContain("<h2>Cover</h2>");
  expect(html).toMatch(/<h2>Page 1<\/h2><p>As a new day dawns on the awakening Palace/);
  expect((await request.get(`${OTHER}/read/riddled-with-language/text`)).status()).toBe(200);
  expect((await request.get(`${OTHER}/read/melting-pot/text`)).status()).toBe(404);
});

test("the cover opens once, to the first content page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${OTHER}/read/practice-in-communication-book-1`, { waitUntil: "load" });
  await expect(page.locator(".bkr[data-ready]")).toBeVisible({ timeout: 30_000 });
  await page.locator(".bkr-stage").scrollIntoViewIfNeeded();
  await expect(page.locator(".bkr-counter")).toHaveText("Pages 6 and 7 of 98", { timeout: 5000 });
});

for (const [width, height] of [[1920, 1080], [1280, 800], [375, 812]]) {
  test(`a play opens on its preview, not the end page, at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openReader(page, "melting-pot");
    await page.locator(".bkr-stage").scrollIntoViewIfNeeded();
    await expect(page.locator(".bkr-counter")).toHaveText(/^Preview: pages? 2( and 3)? of 6 /, { timeout: 5000 });
  });
}

test("at 1280 by 800 the toolbar and the top of the book are above the fold", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const slug of ["little-ray", "melting-pot", "practice-in-communication-book-1"]) {
    await openReader(page, slug);
    /* Let the cover open (and the closed-book centring transition finish). */
    await expect(page.locator(".bkr-counter")).not.toHaveText(/^(Cover|Preview: page 1 )/, { timeout: 5000 });
    await page.waitForTimeout(800);
    const toolbar = await page.locator(".bkr-toolbar").boundingBox();
    const stage = await page.locator(".bkr-stage").boundingBox();
    expect(toolbar.y + toolbar.height, `${slug}: toolbar`).toBeLessThan(800);
    /* The L1 title keeps its DESIGN.md size, so a two-line title (the
       textbooks) leaves less of the book on the first screen than a short one. */
    expect(stage.y, `${slug}: at least 150px of the book shows`).toBeLessThan(800 - 150);
    /* The toolbar lines up with the book it controls. */
    const book = await page.locator(".bkr-book").boundingBox();
    expect(Math.abs(toolbar.x - book.x), `${slug}: toolbar and book left edges`).toBeLessThan(4);
  }
});

const AXE_ROUTES = ["/read/little-ray", "/read/melting-pot", "/read/practice-in-communication-book-1", "/read/little-ray/text", "/read/riddled-with-language/text"];
for (const width of [375, 1280]) {
  for (const path of AXE_ROUTES) {
    test(`axe at ${width}px: ${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${OTHER}${path}`, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      /* Open the words panel and the Go to page form too, so they are checked. */
      for (const name of ["Show the words on this page", "Go to page"]) {
        const button = page.getByRole("button", { name, exact: true });
        if (await button.count()) await button.click();
      }
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
}
