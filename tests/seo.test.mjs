import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import {
  BOOKS,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  ROUTE_META,
  TITLE_MAX,
  allRoutes,
  artworkMetadata,
  canonicalUrl,
  fitDescription,
  fitTitle,
  generateArtworkMetadata,
  generateReadMetadata,
  generateReadTextMetadata,
  hasTextRoute,
  hostMetadata,
  hostViewport,
  noindexMetadata,
  pageMetadata,
  readMetadata,
  readTextMetadata,
  robotsTxt,
  routeMeta,
  sitemapEntries,
  sitemapXml,
} from "../lib/seo.mjs";
import { LEGAL_PATHS, SITES, faviconPath, resolveRequest } from "../lib/sites.mjs";
import { artworks } from "../content/artworks.mjs";

const SITE_KEYS = ["main", "other"];
const everyRoute = SITE_KEYS.flatMap((site) => allRoutes(site).map((route) => ({ site, route })));
const publicFile = (path) => new URL(`../public${path}`, import.meta.url);

test("every route on both hosts resolves to metadata", () => {
  assert.ok(everyRoute.length > 60, `expected the full route list, got ${everyRoute.length}`);
  for (const { site, route } of everyRoute) {
    assert.ok(routeMeta(site, route), `${site} ${route} has no metadata`);
    assert.doesNotThrow(() => pageMetadata(site, route), `${site} ${route}`);
  }
});

test("the route list covers every book, text route and painting", () => {
  const other = new Set(allRoutes("other"));
  for (const b of BOOKS) {
    assert.ok(other.has(`/read/${b.slug}`), b.slug);
    assert.equal(other.has(`/read/${b.slug}/text`), b.section !== "plays", `${b.slug} text route`);
  }
  for (const art of artworks) assert.ok(other.has(`/anns-art/${art.id}`), art.id);
  assert.ok(!other.has("/other-home"), "/other-home is a 301 and is not a route of its own");
});

test("titles are unique across both hosts and at most 60 characters", () => {
  const seen = new Map();
  for (const { site, route } of everyRoute) {
    const { title } = routeMeta(site, route);
    assert.ok(title.length <= TITLE_MAX, `${site} ${route} title is ${title.length} characters: ${title}`);
    assert.ok(!seen.has(title), `${site} ${route} repeats the title of ${seen.get(title)}: ${title}`);
    seen.set(title, `${site} ${route}`);
  }
});

test("descriptions are unique and 150 to 160 characters", () => {
  const seen = new Map();
  for (const { site, route } of everyRoute) {
    const { description } = routeMeta(site, route);
    assert.ok(
      description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX,
      `${site} ${route} description is ${description.length} characters: ${description}`,
    );
    assert.ok(!seen.has(description), `${site} ${route} repeats the description of ${seen.get(description)}`);
    seen.set(description, `${site} ${route}`);
  }
});

test("copy has no em dashes", () => {
  for (const { site, route } of everyRoute) {
    const { title, description } = routeMeta(site, route);
    assert.ok(!/—/.test(title + description), `${site} ${route}`);
  }
});

test("canonicals are absolute, on the right host and unique", () => {
  const seen = new Set();
  for (const { site, route } of everyRoute) {
    const meta = pageMetadata(site, route);
    const canonical = meta.alternates.canonical;
    assert.equal(canonical, canonicalUrl(site, route));
    assert.ok(canonical.startsWith(`${SITES[site].origin}/`), `${site} ${route}: ${canonical}`);
    assert.ok(!seen.has(canonical), `duplicate canonical ${canonical}`);
    seen.add(canonical);
  }
  assert.equal(canonicalUrl("main", "/"), "https://allengillon.com/");
  assert.equal(canonicalUrl("other", "/"), "https://other.allengillon.com/");
});

test("legal pages are canonical on main only", () => {
  for (const path of LEGAL_PATHS) {
    assert.ok(ROUTE_META.main[path]?.legal, `main has ${path}`);
    assert.equal(routeMeta("other", path), null, `other has no ${path}`);
    assert.equal(pageMetadata("main", path).alternates.canonical, `https://allengillon.com${path}`);
  }
  for (const route of allRoutes("other")) {
    assert.ok(!LEGAL_PATHS.includes(route), route);
  }
});

test("pageMetadata carries Open Graph, the twitter card and absolute titles", () => {
  const meta = pageMetadata("main", "/hire");
  assert.deepEqual(meta.title, { absolute: "Book a guitarist on Bribie Island and Moreton Bay" });
  assert.equal(meta.openGraph.siteName, "Allen Gillon");
  assert.equal(meta.openGraph.locale, "en_AU");
  assert.equal(meta.openGraph.url, "https://allengillon.com/hire");
  assert.equal(meta.openGraph.images[0].url, "https://allengillon.com/og/main/hire.jpg");
  assert.equal(meta.openGraph.images[0].width, 1200);
  assert.equal(meta.twitter.card, "summary_large_image");
  assert.equal(meta.twitter.images[0].url, meta.openGraph.images[0].url);
  assert.equal(meta.robots, undefined);
  assert.equal("metadataBase" in meta, false);

  const home = pageMetadata("other", "/");
  assert.equal(home.metadataBase, null, "the home page keeps its trailing-slash canonical");
  assert.equal(home.openGraph.siteName, "More on Allen");
  assert.equal(home.openGraph.images[0].url, "https://other.allengillon.com/og/other/home.jpg");

  const art = pageMetadata("other", `/anns-art/${artworks[0].id}`);
  assert.match(art.openGraph.images[0].url, new RegExp(`/og/other/anns-art/${artworks[0].id}\\.jpg$`));
});

test("every OG image a page uses exists in public/", () => {
  for (const { site, route } of everyRoute) {
    for (const img of pageMetadata(site, route).openGraph.images) {
      const path = new URL(img.url).pathname;
      assert.ok(existsSync(publicFile(path)), `${site} ${route}: ${path}`);
    }
  }
});

test("pageMetadata overrides merge one level deep", () => {
  const meta = pageMetadata("main", "/music", { openGraph: { type: "music.album" }, other: 1 });
  assert.equal(meta.openGraph.type, "music.album");
  assert.equal(meta.openGraph.siteName, "Allen Gillon");
  assert.equal(meta.other, 1);
  assert.throws(() => pageMetadata("main", "/books"), /no metadata/);
  assert.throws(() => pageMetadata("other", "/hire"), /no metadata/);
});

test("comments and placeholders are noindex, and dev pages can opt out", () => {
  for (const site of SITE_KEYS) {
    assert.deepEqual(pageMetadata(site, "/comments").robots, { index: false, follow: true });
  }
  assert.deepEqual(readMetadata(BOOKS[0].slug, { placeholder: true }).robots, { index: false, follow: true });
  assert.equal(readMetadata(BOOKS[0].slug).robots, undefined);
  assert.deepEqual(noindexMetadata({ title: "Dev" }), { robots: { index: false, follow: true }, title: "Dev" });
});

test("dynamic route helpers", async () => {
  const play = BOOKS.find((b) => b.section === "plays");
  const story = BOOKS.find((b) => b.section === "childrens");
  const textbook = BOOKS.find((b) => b.section === "teaching");
  assert.equal(readMetadata(play.slug).alternates.canonical, `https://other.allengillon.com/read/${play.slug}`);
  assert.match(readMetadata(play.slug).description, /A\$1/);
  assert.deepEqual(readTextMetadata(play.slug), {}, "plays have no text route");
  assert.ok(hasTextRoute(story) && hasTextRoute(textbook));
  assert.equal(readTextMetadata(story.slug).alternates.canonical, `https://other.allengillon.com/read/${story.slug}/text`);
  assert.deepEqual(readMetadata("no-such-book"), {});
  assert.deepEqual(artworkMetadata("no-such-art"), {});

  const params = (value) => Promise.resolve(value);
  assert.deepEqual(await generateReadMetadata({ params: params({ slug: story.slug }) }), readMetadata(story.slug));
  assert.deepEqual(await generateReadTextMetadata({ params: params({ slug: textbook.slug }) }), readTextMetadata(textbook.slug));
  assert.deepEqual(await generateArtworkMetadata({ params: params({ id: artworks[1].id }) }), artworkMetadata(artworks[1].id));
});

test("painting descriptions give the price only for works that are for sale", () => {
  for (const art of artworks) {
    const { description } = routeMeta("other", `/anns-art/${art.id}`);
    const forSale = art.availability === "available" && art.priceCents > 0;
    assert.equal(/A\$\d+ with free delivery/.test(description), forSale, `${art.id}: ${description}`);
    assert.ok(description.startsWith(art.title), art.id);
  }
});

test("fitTitle and fitDescription", () => {
  assert.equal(fitTitle("Short", "other"), "Short · More on Allen");
  const long = "A".repeat(50);
  assert.equal(fitTitle(long, "main"), long);
  const text = fitDescription("x".repeat(140), ["one two three.", "four five six seven eight."]);
  assert.ok(text.length >= 150 && text.length <= 160);
  assert.throws(() => fitDescription("too short", ["a."]), /No description/);
});

test("host metadata: template, icons, manifest, Open Graph, twitter and theme colour", () => {
  for (const site of SITE_KEYS) {
    const meta = hostMetadata(site);
    const name = SITES[site].name;
    assert.equal(meta.metadataBase.href, `${SITES[site].origin}/`);
    assert.equal(meta.title.template, `%s · ${name}`);
    assert.equal(meta.openGraph.siteName, name);
    assert.equal(meta.openGraph.locale, "en_AU");
    assert.equal(meta.twitter.card, "summary_large_image");
    assert.equal(meta.manifest, `/icons/${site}/manifest.webmanifest`);
    const files = [meta.manifest, ...meta.icons.icon.map((i) => i.url), ...meta.icons.apple.map((i) => i.url)];
    for (const file of files) {
      assert.ok(file.startsWith(`/icons/${site}/`), file);
      assert.ok(existsSync(publicFile(file)), file);
    }
    const manifest = JSON.parse(readFileSync(publicFile(meta.manifest), "utf8"));
    assert.equal(manifest.name, name);
    assert.equal(hostViewport(site).themeColor, manifest.theme_color);
  }
});

test("robots.txt: Disallow /api/ and the host's own sitemap, nothing else", () => {
  assert.equal(robotsTxt("main"), "User-agent: *\nDisallow: /api/\n\nSitemap: https://allengillon.com/sitemap.xml\n");
  assert.equal(robotsTxt("other"), "User-agent: *\nDisallow: /api/\n\nSitemap: https://other.allengillon.com/sitemap.xml\n");
  for (const site of SITE_KEYS) {
    const directives = robotsTxt(site).split("\n").filter((l) => /^(dis)?allow:/i.test(l));
    assert.deepEqual(directives, ["Disallow: /api/"]);
  }
});

test("sitemaps list only each host's own indexable pages", () => {
  const main = sitemapEntries("main", { legalPublished: false }).map((e) => e.url);
  const other = sitemapEntries("other", { legalPublished: false }).map((e) => e.url);
  assert.deepEqual(main, [
    "https://allengillon.com/",
    "https://allengillon.com/hire",
    "https://allengillon.com/music",
    "https://allengillon.com/reviews",
    "https://allengillon.com/shows",
  ]);
  for (const url of main) assert.ok(url.startsWith("https://allengillon.com/"));
  for (const url of other) assert.ok(url.startsWith("https://other.allengillon.com/"));
  for (const url of [...main, ...other]) {
    assert.ok(!/\/comments|\/other-home|\/api\//.test(url), url);
  }
  // Every entry is a route this host owns (not redirected by host routing).
  for (const url of [...main, ...other]) {
    const { host, pathname } = new URL(url);
    assert.equal(resolveRequest(host, pathname, { env: { NODE_ENV: "production" } }).action, pathname === "/" && host.startsWith("other.") ? "rewrite" : "next", url);
  }
});

test("the other sitemap has every book, story and textbook text route and painting", () => {
  const urls = new Set(sitemapEntries("other").map((e) => e.url));
  for (const path of ["/", "/biography", "/books", "/anns-art", "/delivery"]) {
    assert.ok(urls.has(`https://other.allengillon.com${path}`), path);
  }
  for (const b of BOOKS) {
    assert.ok(urls.has(`https://other.allengillon.com/read/${b.slug}`), b.slug);
    assert.equal(urls.has(`https://other.allengillon.com/read/${b.slug}/text`), b.section !== "plays", `${b.slug}/text`);
  }
  for (const art of artworks) assert.ok(urls.has(`https://other.allengillon.com/anns-art/${art.id}`), art.id);
  assert.equal(urls.size, 5 + BOOKS.length + BOOKS.filter((b) => b.section !== "plays").length + artworks.length);
});

test("legal pages join the main sitemap only once published", () => {
  const published = sitemapEntries("main", { legalPublished: true }).map((e) => e.url);
  for (const path of LEGAL_PATHS) assert.ok(published.includes(`https://allengillon.com${path}`), path);
  const other = sitemapEntries("other", { legalPublished: true }).map((e) => e.url);
  for (const path of LEGAL_PATHS) assert.ok(!other.some((u) => u.endsWith(path)), path);
  const legal = JSON.parse(readFileSync(new URL("../content/legal.config.json", import.meta.url), "utf8"));
  const current = sitemapEntries("main").map((e) => e.url);
  assert.equal(current.includes("https://allengillon.com/privacy"), legal.published === true);
});

test("sitemap image entries point at real files", () => {
  const entries = [...sitemapEntries("main"), ...sitemapEntries("other")];
  const art = sitemapEntries("other").find((e) => e.url.endsWith(`/anns-art/${artworks[0].id}`));
  assert.equal(art.images.length, artworks[0].images.length);
  for (const entry of entries) {
    for (const src of entry.images) {
      const { pathname, origin } = new URL(src);
      assert.equal(origin, new URL(entry.url).origin, src);
      // Textbook page scans are built by W4; skip those until they exist.
      if (/^\/books\/(practice-in-communication|riddled-with-language)/.test(pathname)) continue;
      assert.ok(existsSync(publicFile(decodeURI(pathname))), `${entry.url}: ${pathname}`);
    }
  }
});

test("sitemap.xml is well formed and differs per host", () => {
  const main = sitemapXml("main");
  const other = sitemapXml("other");
  assert.notEqual(main, other);
  for (const xml of [main, other]) {
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
    assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'));
    assert.equal((xml.match(/<url>/g) || []).length, (xml.match(/<\/url>/g) || []).length);
    assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml), "unescaped ampersand");
  }
  assert.ok(other.includes("<image:loc>https://other.allengillon.com/images/art/gallery/"));
  assert.ok(!main.includes("other.allengillon.com"));
});

test("the root favicon is rewritten to the host's own icon", () => {
  assert.deepEqual(resolveRequest("allengillon.com", "/favicon.ico", { env: { NODE_ENV: "production" } }), {
    site: "main",
    action: "rewrite",
    pathname: "/icons/main/favicon.ico",
  });
  assert.equal(resolveRequest("other.allengillon.com", "/favicon.ico").pathname, "/icons/other/favicon.ico");
  assert.equal(resolveRequest("other.localhost:3820", "/favicon.ico").pathname, "/icons/other/favicon.ico");
  assert.equal(faviconPath("main"), "/icons/main/favicon.ico");
  for (const site of SITE_KEYS) assert.ok(existsSync(publicFile(faviconPath(site))));
});

test("public/_headers caches static assets and revalidates books", () => {
  const headers = readFileSync(publicFile("/_headers"), "utf8");
  const rule = (path) => {
    const m = headers.match(new RegExp(`^${path.replace(/[*/]/g, "\\$&")}\\n\\s+Cache-Control: (.+)$`, "m"));
    return m && m[1];
  };
  for (const path of ["/audio/*", "/fonts/*", "/images/*", "/videos/*", "/icons/*", "/og/*"]) {
    assert.equal(rule(path), "public, max-age=31536000, immutable", path);
  }
  assert.equal(rule("/books/*"), "public, max-age=86400, must-revalidate");
});
