import { test, expect } from "@playwright/test";

// Chromium resolves *.localhost to loopback, so other.localhost reaches the
// same dev server and proxy.ts treats it as the other host (no redirects).
const port = Number(process.env.SITE_DEV_PORT || 3001);
const OTHER = `http://other.localhost:${port}`;
const MAIN = `http://localhost:${port}`;

test.describe("other.localhost", () => {
  test("Home keeps aria-current after client-side navigation despite the /other-home rewrite", async ({ page }) => {
    // Warm up both routes first: on a cold dev server Vite may optimise new
    // dependencies during the first navigation and force a full reload.
    await page.goto(`${OTHER}/books`);
    await page.waitForLoadState("networkidle");
    await page.goto(`${OTHER}/`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/Allen Gillon/);
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
    // The whole page is marked as the other site, not only the chrome wrapper.
    await expect(page.locator("html")).toHaveAttribute("data-site", "other");
  });

  test("the sideboard canonical keeps its trailing slash", async ({ request }) => {
    const html = await (await request.get(`${OTHER}/`)).text();
    expect(html).toContain('<link rel="canonical" href="https://other.allengillon.com/"/>');
    expect(html).toContain('<meta property="og:url" content="https://other.allengillon.com/"/>');
  });

  test("server-rendered cross-site links never point at production locally", async ({ request }) => {
    // Before hydration (or with JS off) the HTML must already use local origins.
    const html = await (await request.get(`${OTHER}/books`)).text();
    const crossLinks = [...html.matchAll(/<a [^>]*data-cross-site="[a-z]+"[^>]*>/g)].map((m) => m[0]);
    expect(crossLinks.length).toBeGreaterThan(0);
    for (const tag of crossLinks) expect(tag).not.toContain("https://allengillon.com");
    expect(html).toContain(`href="${MAIN}/`);
  });
});

test.describe("POST /api/reviews", () => {
  // resolveRequest ignores the method, so this sends real POSTs through
  // proxy.ts and the route handler with each production Host header.
  test("the Host header reaches proxy.ts (control: GET /books on main is a 301)", async ({ request }) => {
    const response = await request.get(`${MAIN}/books`, {
      headers: { host: `allengillon.com:${port}` },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(301);
    expect(response.headers()["location"]).toBe("https://other.allengillon.com/books");
  });

  for (const host of ["allengillon.com", "other.allengillon.com", "localhost", "other.localhost"]) {
    test(`is not a redirect with Host: ${host}`, async ({ request }) => {
      const response = await request.post(`${MAIN}/api/reviews`, {
        headers: { host: `${host}:${port}` },
        data: {},
        maxRedirects: 0,
      });
      const status = response.status();
      expect(status < 300 || status >= 400, `status ${status}`).toBe(true);
      expect(response.headers()["location"]).toBeUndefined();
    });
  }
});

test.describe("localhost (main)", () => {
  test("main nav has no cross-site link (it lives at the bottom of the home page)", async ({ page }) => {
    await page.goto(`${MAIN}/`);
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.locator("a[data-cross-site]")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("data-site", "main");
  });
});
