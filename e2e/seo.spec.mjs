import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// W6 SEO infrastructure: per-host icons, manifest, theme colour, site JSON-LD,
// robots.txt, sitemap.xml and the root favicon, on both hosts of the dev server.
const port = Number(process.env.SITE_DEV_PORT || 3001);
const HOSTS = {
  main: `http://localhost:${port}`,
  other: `http://other.localhost:${port}`,
};
const ORIGIN = { main: "https://allengillon.com", other: "https://other.allengillon.com" };
const SAMPLE = { main: ["/", "/hire", "/reviews"], other: ["/", "/books", "/anns-art"] };

for (const [site, base] of Object.entries(HOSTS)) {
  test.describe(site, () => {
    test("head carries the host's icons, manifest, theme colour and site graph", async ({ page }) => {
      await page.goto(`${base}/`);
      await expect(page.locator(`head link[rel="manifest"]`)).toHaveAttribute("href", `/icons/${site}/manifest.webmanifest`);
      await expect(page.locator(`link[rel="icon"][href="/icons/${site}/icon.svg"]`)).toHaveCount(1);
      await expect(page.locator(`link[rel="apple-touch-icon"][href="/icons/${site}/apple-icon-180.png"]`)).toHaveCount(1);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#f8f6ee");
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_AU");
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
      const website = graphs.map((t) => JSON.parse(t)).flatMap((d) => d["@graph"] || [d]).find((n) => n["@type"] === "WebSite");
      expect(website["@id"]).toBe(`${ORIGIN[site]}/#website`);
    });

    test("robots.txt and sitemap.xml belong to this host", async ({ request }) => {
      const robots = await request.get(`${base}/robots.txt`);
      expect(robots.status()).toBe(200);
      expect(await robots.text()).toBe(`User-agent: *\nDisallow: /api/\n\nSitemap: ${ORIGIN[site]}/sitemap.xml\n`);
      const sitemap = await request.get(`${base}/sitemap.xml`);
      expect(sitemap.status()).toBe(200);
      expect(sitemap.headers()["content-type"]).toContain("xml");
      const locs = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      expect(locs.length).toBeGreaterThan(3);
      for (const loc of locs) expect(loc.startsWith(`${ORIGIN[site]}/`)).toBe(true);
    });

    test("the root favicon is the host's own", async ({ request }) => {
      const [root, own] = await Promise.all([
        request.get(`${base}/favicon.ico`),
        request.get(`${base}/icons/${site}/favicon.ico`),
      ]);
      expect(root.status()).toBe(200);
      expect(Buffer.compare(await root.body(), await own.body())).toBe(0);
    });

    test("axe: no WCAG 2.2 AA violations on sample pages", async ({ page }) => {
      for (const path of SAMPLE[site]) {
        await page.goto(`${base}${path}`);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${path} ${v.id}`)).toEqual([]);
      }
    });
  });
}
