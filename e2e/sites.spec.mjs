import { test, expect } from "@playwright/test";

// Chromium resolves *.localhost to loopback, so other.localhost reaches the
// same dev server and proxy.ts treats it as the other host (no redirects).
const port = Number(process.env.SITE_DEV_PORT || 3001);
const OTHER = `http://other.localhost:${port}`;
const MAIN = `http://localhost:${port}`;

test.describe("other.localhost", () => {
  test("Home keeps aria-current after client-side navigation despite the /other-home rewrite", async ({ page }) => {
    await page.goto(`${OTHER}/`);
    await expect(page).toHaveTitle(/More on Allen/);
    const nav = page.getByRole("navigation", { name: "Site" });
    const home = nav.getByRole("link", { name: "Home", exact: true });
    await expect(home).toHaveAttribute("aria-current", "page");

    // Client-side navigation away and back. The marker survives only if the
    // page is not reloaded.
    await page.evaluate(() => { window.__noReload = true; });
    await nav.getByRole("link", { name: "Stories", exact: true }).click();
    await expect(page).toHaveURL(`${OTHER}/books`);
    await expect(nav.getByRole("link", { name: "Stories", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(home).not.toHaveAttribute("aria-current", "page");

    await home.click();
    await expect(page).toHaveURL(`${OTHER}/`);
    await expect(home).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".sideboard")).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    expect(await page.evaluate(() => window.__noReload)).toBe(true);
  });

  test("the sideboard has three doorways and a link back to the main site", async ({ page }) => {
    await page.goto(`${OTHER}/`);
    const doorways = page.locator(".doorways > a");
    await expect(doorways).toHaveCount(3);
    await expect(doorways.nth(0)).toHaveAttribute("href", "/books");
    await expect(doorways.nth(1)).toHaveAttribute("href", "/anns-art");
    await expect(doorways.nth(2)).toHaveAttribute("href", "/biography");
    // Cross-site links point at the local counterpart after hydration.
    await expect(page.locator(".sideboard-back a")).toHaveAttribute("href", `${MAIN}/`);
  });
});

test.describe("localhost (main)", () => {
  test("main nav has the cross-site link with an absolute URL", async ({ page }) => {
    await page.goto(`${MAIN}/`);
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    const cross = nav.getByRole("link", { name: "More on Allen: stories, Timeless and Ann's art" });
    await expect(cross).toHaveAttribute("href", `${OTHER}/`);
  });
});
