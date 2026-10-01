import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { JSDOM } from "jsdom";
import { artworks } from "../content/artworks.mjs";
import bookIndex from "../public/books/index.json" with { type: "json" };

// W6 SEO on both hosts of the dev server:
// - per-host icons, manifest, theme colour, site JSON-LD, robots.txt,
//   sitemap.xml and the root favicon;
// - every route (the /read pages and story and textbook text routes too): a unique title of 60 characters or fewer, a
//   150-160 character description, an absolute unique canonical, Open Graph
//   (siteName, en_AU, an absolute 1200x630 image) and a summary_large_image
//   twitter card, read from the server-rendered HTML head;
// - every JSON-LD block parses and holds no Review, AggregateRating, FAQPage
//   or Event.
// The legal pages join ROUTES.main once content/legal.config.json is
// published (until then they are 404s by design).
import legalConfig from "../content/legal.config.json" with { type: "json" };
const port = Number(process.env.SITE_DEV_PORT || 3001);
const HOSTS = {
  main: `http://localhost:${port}`,
  other: `http://other.localhost:${port}`,
};
const ORIGIN = { main: "https://allengillon.com", other: "https://other.allengillon.com" };
const SITE_NAME = { main: "Allen Gillon", other: "Allen Gillon" };
// axe runs on every page this wiring touched (one painting page stands for all).
const SAMPLE = {
  main: ["/", "/hire", "/music", "/reviews", "/shows", "/comments"],
  other: ["/", "/biography", "/books", "/anns-art", `/anns-art/${artworks[0].id}`, "/comments"],
};

const TEXT_SECTIONS = ["childrens", "teaching"];
const ROUTES = {
  main: [
    "/", "/hire", "/music", "/reviews", "/shows", "/comments",
    ...(legalConfig.published === true ? ["/privacy", "/terms", "/accessibility"] : []),
  ],
  other: [
    "/", "/biography", "/books", "/anns-art", ...artworks.map((a) => `/anns-art/${a.id}`), "/delivery", "/comments",
    ...bookIndex.map((b) => `/read/${b.slug}`),
    ...bookIndex.filter((b) => TEXT_SECTIONS.includes(b.section)).map((b) => `/read/${b.slug}/text`),
  ],
};
const NOINDEX = new Set(["/comments"]);
const FORBIDDEN = ["Review", "AggregateRating", "FAQPage", "Event"];

/** Every @type in a JSON-LD document, however deeply nested. */
function typesIn(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => typesIn(n, out));
  else if (node && typeof node === "object") {
    const t = node["@type"];
    if (t) out.push(...(Array.isArray(t) ? t : [t]));
    Object.values(node).forEach((v) => typesIn(v, out));
  }
  return out;
}

function headOf(html) {
  const { document } = new JSDOM(html).window;
  const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
  return {
    // The first HTML <title> (SVG titles are another namespace).
    title: document.title,
    description: meta('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    robots: meta('meta[name="robots"]'),
    themeColor: meta('meta[name="theme-color"]'),
    og: {
      title: meta('meta[property="og:title"]'),
      description: meta('meta[property="og:description"]'),
      url: meta('meta[property="og:url"]'),
      siteName: meta('meta[property="og:site_name"]'),
      locale: meta('meta[property="og:locale"]'),
      image: meta('meta[property="og:image"]'),
      width: meta('meta[property="og:image:width"]'),
      height: meta('meta[property="og:image:height"]'),
    },
    twitter: {
      card: meta('meta[name="twitter:card"]'),
      image: meta('meta[name="twitter:image"]'),
    },
    manifest: document.querySelector('link[rel="manifest"]')?.getAttribute("href") ?? null,
    icons: [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')].map((l) => l.getAttribute("href")),
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
  };
}

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

    test("page JSON-LD matches the wiring table", async ({ request }) => {
      const nodes = async (route) => {
        const h = headOf(await (await request.get(`${base}${route}`)).text());
        return h.jsonLd.map((t) => JSON.parse(t)).flatMap((d) => d["@graph"] || [d]);
      };
      const types = (list) => list.map((n) => [n["@type"]].flat().join("+"));
      if (site === "main") {
        const music = await nodes("/music");
        expect(types(music)).toContain("CollectionPage");
        const albums = music.filter((n) => n["@type"] === "MusicAlbum");
        expect(albums.length).toBeGreaterThanOrEqual(4);
        for (const a of albums) expect(a.offers.price).toBe("0.00");
        for (const route of ["/hire", "/reviews", "/shows"]) expect(types(await nodes(route))).toContain("BreadcrumbList");
        expect(types(await nodes("/"))).not.toContain("BreadcrumbList");
      } else {
        const books = await nodes("/books");
        expect(types(books)).toContain("CollectionPage");
        // A Book node for every title readable here: stories and textbooks
        // are free with their PDF, plays are A$1 from Allen with no PDF.
        const bookNodes = books.filter((n) => n["@type"] === "Book");
        expect(bookNodes.map((n) => n.url).sort()).toEqual(bookIndex.map((b) => `${ORIGIN.other}/read/${b.slug}`).sort());
        for (const b of bookIndex) {
          const node = bookNodes.find((n) => n.url.endsWith(`/read/${b.slug}`));
          expect(node.offers.seller.name).toBe("Allen Gillon");
          if (b.section === "plays") {
            expect(node.offers.price).toBe("1.00");
            expect(node.encoding).toBeUndefined();
          } else {
            expect(node.offers.price).toBe("0.00");
            expect(node.encoding?.contentUrl).toBe(`${ORIGIN.other}/books/${b.slug}/${b.slug}.pdf`);
          }
        }
        // Each /read page: Book and breadcrumbs; the recorded plays carry their preview.
        for (const b of bookIndex) {
          const read = await nodes(`/read/${b.slug}`);
          expect(types(read)).toEqual(expect.arrayContaining(["Book", "BreadcrumbList"]));
          const node = read.find((n) => n["@type"] === "Book");
          if (["melting-pot", "breakout"].includes(b.slug)) {
            expect(node.audio?.contentUrl).toBe(`${ORIGIN.other}/audio/school-play-previews/${b.slug}.mp3`);
          }
          if (TEXT_SECTIONS.includes(b.section)) {
            expect(types(await nodes(`/read/${b.slug}/text`))).toContain("BreadcrumbList");
          } else {
            expect((await request.get(`${base}/read/${b.slug}/text`)).status()).toBe(404);
          }
        }
        expect(types(await nodes("/delivery"))).toContain("BreadcrumbList");
        expect(types(await nodes("/anns-art"))).toContain("CollectionPage");
        expect(types(await nodes("/biography"))).toContain("BreadcrumbList");
        const forSale = artworks.find((a) => a.availability === "available");
        const art = await nodes(`/anns-art/${forSale.id}`);
        expect(types(art)).toContain("VisualArtwork+Product");
        expect(types(art)).toContain("BreadcrumbList");
        expect(types(await nodes("/"))).not.toContain("BreadcrumbList");
      }
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
      test.setTimeout(180_000);
      for (const path of SAMPLE[site]) {
        await page.goto(`${base}${path}`);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(results.violations.map((v) => `${path} ${v.id}`)).toEqual([]);
      }
    });
  });
}

// One test over both hosts, so titles, descriptions and canonicals must be
// unique across the two sites, not only within each.
test("every route on both hosts has complete, unique metadata and clean JSON-LD", async ({ request }) => {
  test.setTimeout(480_000);
  const seen = { title: new Map(), description: new Map(), canonical: new Map() };
  const problems = [];
  for (const [site, base] of Object.entries(HOSTS)) {
    const check = (route, ok, message) => {
      if (!ok) problems.push(`${site} ${route}: ${message}`);
    };
    for (const route of ROUTES[site]) {
      const res = await request.get(`${base}${route}`, { maxRedirects: 0 });
      check(route, res.status() === 200, `status ${res.status()}`);
      if (res.status() !== 200) continue;
      const h = headOf(await res.text());
      const expectedCanonical = `${ORIGIN[site]}${route}`;

      check(route, h.title.length > 0 && h.title.length <= 60, `title "${h.title}" (${h.title.length} chars)`);
      check(route, !/Al's music style/.test(h.title), `stale title "${h.title}"`);
      const d = h.description || "";
      check(route, d.length >= 150 && d.length <= 160, `description ${d.length} chars: "${d}"`);
      check(route, h.canonical === expectedCanonical, `canonical ${h.canonical}, expected ${expectedCanonical}`);
      for (const [key, value] of [["title", h.title], ["description", d], ["canonical", h.canonical]]) {
        if (seen[key].has(value)) problems.push(`${site} ${route}: ${key} repeats ${seen[key].get(value)}`);
        else seen[key].set(value, `${site} ${route}`);
      }

      check(route, h.og.title === h.title, `og:title "${h.og.title}"`);
      check(route, h.og.description === d, "og:description differs from the description");
      check(route, h.og.url === expectedCanonical, `og:url ${h.og.url}`);
      check(route, h.og.siteName === SITE_NAME[site], `og:site_name ${h.og.siteName}`);
      check(route, h.og.locale === "en_AU", `og:locale ${h.og.locale}`);
      check(route, (h.og.image || "").startsWith(`${ORIGIN[site]}/og/${site}/`) && h.og.image.endsWith(".jpg"), `og:image ${h.og.image}`);
      check(route, h.og.width === "1200" && h.og.height === "630", `og:image size ${h.og.width}x${h.og.height}`);
      check(route, h.twitter.card === "summary_large_image", `twitter:card ${h.twitter.card}`);
      check(route, h.twitter.image === h.og.image, `twitter:image ${h.twitter.image}`);

      check(route, h.manifest === `/icons/${site}/manifest.webmanifest`, `manifest ${h.manifest}`);
      check(route, h.icons.includes(`/icons/${site}/favicon.ico`) && h.icons.includes(`/icons/${site}/icon.svg`), `icons ${h.icons.join(" ")}`);
      check(route, h.themeColor === "#f8f6ee", `theme-color ${h.themeColor}`);
      if (NOINDEX.has(route)) check(route, h.robots === "noindex, follow", `robots ${h.robots}, expected "noindex, follow"`);
      else check(route, !/noindex/.test(h.robots || ""), `robots ${h.robots}`);

      // /comments is noindex and has no JSON-LD; every other page has at least the site graph.
      if (!NOINDEX.has(route)) check(route, h.jsonLd.length > 0, "no JSON-LD");
      for (const text of h.jsonLd) {
        let doc;
        try {
          doc = JSON.parse(text);
        } catch (err) {
          check(route, false, `JSON-LD does not parse: ${err.message}`);
          continue;
        }
        const bad = typesIn(doc).filter((t) => FORBIDDEN.includes(t));
        check(route, bad.length === 0, `forbidden JSON-LD types ${bad.join(", ")}`);
      }
    }
  }
  expect(problems).toEqual([]);
});
