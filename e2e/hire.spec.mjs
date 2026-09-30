import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W5 Bookings (/hire) checks. Screenshots: HIRE_SHOTS=<dir> also saves full
// page shots at 375, 1280 and 1920 for review.
const port = Number(process.env.SITE_DEV_PORT || 3001);
const URL = `http://localhost:${port}/hire`;
const WIDTHS = [320, 375, 768, 1024, 1280, 1440, 1920, 2560];

test("the text link is the largest text on the page at every width", async ({ page }) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const sms = document.querySelector(".book-band a.sms .sms-number");
      const smsSize = parseFloat(getComputedStyle(sms).fontSize);
      let biggest = { size: 0, text: "" };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const el = node.parentElement;
        if (!node.textContent.trim() || !el || sms.contains(el) || el.closest("a.sms")) continue;
        if (!el.getClientRects().length) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size > biggest.size) biggest = { size, text: node.textContent.trim().slice(0, 40) };
      }
      return { smsSize, biggest };
    });
    expect(result.smsSize, `${width}px: number ${result.smsSize}px vs "${result.biggest.text}" ${result.biggest.size}px`).toBeGreaterThan(result.biggest.size);
  }
});

test("contact links: sms, no tel, Facebook as a text link, paper focus on the ink band", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const band = page.locator("#booking");
  const sms = band.getByRole("link", { name: "Text 0438 747 882" });
  await expect(sms).toHaveAttribute("href", "sms:+61438747882");
  expect(await page.locator("main a[href^='tel:']").count()).toBe(0);
  const fb = band.getByRole("link", { name: "Allen on Facebook" });
  await expect(fb).toHaveAttribute("href", /facebook\.com/);
  const fbStyle = await fb.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { display: cs.display, border: cs.borderTopWidth, parent: el.parentElement.tagName };
  });
  expect(fbStyle).toEqual({ display: "inline", border: "0px", parent: "P" });

  await sms.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const outline = await sms.evaluate((el) => {
    const cs = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.color = "var(--paper)";
    document.body.appendChild(probe);
    const paper = getComputedStyle(probe).color;
    probe.remove();
    return { color: cs.outlineColor, width: cs.outlineWidth, paper };
  });
  expect(outline.width).toBe("3px");
  expect(outline.color).toBe(outline.paper);
});

test("the offers are headed columns without rules, and quotes appear once", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "load" });
  const heads = page.locator(".offer h2");
  await expect(heads).toHaveText(["Restaurant guitarist", "Functions and events"]);
  const boxes = await heads.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(Math.abs(boxes[0] - boxes[1])).toBeLessThan(2);
  const borders = await page.locator(".offer, .offer li, .offer h2, .offer p").evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return ["Top", "Right", "Bottom", "Left"].map((s) => parseFloat(cs[`border${s}Width`])).reduce((a, b) => a + b, 0);
    }),
  );
  expect(borders.every((b) => b === 0)).toBe(true);
  const html = await page.locator("main").innerHTML();
  for (const q of ["Unforgettable.", "Pour me another glass."]) {
    expect(html.split(q).length - 1, q).toBe(1);
  }
});

test("decorative SVG stays inside the budget and is hidden", async ({ page }) => {
  await page.goto(URL, { waitUntil: "load" });
  const svgs = await page.locator("main svg").evaluateAll((els) =>
    els.map((el) => ({ bytes: el.outerHTML.length, hidden: el.getAttribute("aria-hidden") })),
  );
  expect(svgs.reduce((a, s) => a + s.bytes, 0)).toBeLessThan(40 * 1024);
  expect(svgs.every((s) => s.hidden === "true")).toBe(true);
});

for (const motion of ["no-preference", "reduce"]) {
  test(`axe: 0 violations (${motion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(URL, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    }
  });
}

test("screenshots", async ({ page }) => {
  const dir = process.env.HIRE_SHOTS;
  test.skip(!dir, "set HIRE_SHOTS to save screenshots");
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(URL, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // Scroll through so lazy images load and entrance effects finish.
    for (let y = 0; y < 6000; y += 400) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${dir}/hire-${width}.png`, fullPage: true });
  }
});
