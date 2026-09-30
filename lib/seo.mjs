// Page metadata, robots.txt and sitemap.xml for both hosts (redesign plan W6).
//
// ROUTE_META holds the title and description of every static route on each
// host. Dynamic routes (/read/[slug], /read/[slug]/text, /anns-art/[id]) are
// built from the content data, so a new book or painting gets metadata and a
// sitemap entry without touching this file.
//
// Everything here is pure and imports JSON statically (the Worker has no
// filesystem), so tests/seo.test.mjs runs it in Node unchanged.
//
// Page wiring (see docs/SEO-WIRING.md):
//   export const metadata = pageMetadata("main", "/hire");
//   export const generateMetadata = generateReadMetadata;   // /read/[slug]
//
// Rules the tests enforce for every route on both hosts:
// - the full <title> is unique and at most 60 characters,
// - the description is unique and 150 to 160 characters,
// - the canonical is absolute and unique, and the legal pages exist on main only.

import booksConfig from "../content/books.config.json" with { type: "json" };
import legalConfig from "../content/legal.config.json" with { type: "json" };
// The catalogue with repeated photos removed (lib/art-catalog.mjs), so the
// "See all N views" count and the image sitemap match the painting page.
import { artworks } from "./art-catalog.mjs";
import { albums } from "../app/(main)/music/albums.mjs";
import { ogImages } from "./og.mjs";
import { SITES, LEGAL_PATHS } from "./sites.mjs";
import { playLinksCurrent, playPrice } from "./storefront.mjs";

export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 150;
export const DESCRIPTION_MAX = 160;
export const LOCALE = "en_AU";

/** Human TODO: whether /shows stays indexed. It is indexed until told otherwise. */
export const SHOWS_INDEXED = true;

const NOINDEX = { index: false, follow: true };

const aud = (cents) => `A$${Math.round(Number(cents) / 100)}`;

/* Plays cannot be bought until playLinksCurrent is true (lib/storefront.mjs),
   so the snippet must not promise a download the page cannot deliver yet. */
const PLAY_SCRIPT_LINE = playLinksCurrent
  ? `The full script is an ${aud(playPrice)} download.`
  : `The full script will soon be an ${aud(playPrice)} download.`;

/* Price range of the paintings that are for sale now (enquiry-only works excluded). */
const SALE_PRICE_RANGE = (() => {
  const prices = artworks
    .filter((a) => a.availability === "available" && Number(a.priceCents) > 0)
    .map((a) => Number(a.priceCents));
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? aud(lo) : `${aud(lo)} to ${aud(hi)}`;
})();

const siteKey = (site) => (site === "other" ? "other" : "main");
const originOf = (site) => SITES[siteKey(site)].origin;
const nameOf = (site) => SITES[siteKey(site)].name;

/**
 * Static routes. `title` is the full <title> (the page sets it with
 * `title.absolute`, so the group template never adds a second suffix).
 * `sitemap: false` keeps a route out of the sitemap; `noindex` also adds
 * robots noindex. `images` are extra image-sitemap entries (paths).
 */
export const ROUTE_META = {
  main: {
    "/": {
      title: "Allen Gillon, guitarist on Bribie Island",
      description:
        "Allen Gillon is a guitarist on Bribie Island, Queensland. Book light jazz guitar for your restaurant, club or party, or download his guitar albums for free.",
      priority: 1,
      images: ["/images/personal/current-portrait-allen-2026.jpg"],
    },
    "/hire": {
      title: "Book a guitarist on Bribie Island and Moreton Bay",
      description:
        "Book Allen Gillon for light jazz guitar at restaurants, weddings, clubs and parties around Bribie Island, Moreton Bay, Brisbane and the Sunshine Coast.",
      priority: 0.9,
    },
    "/music": {
      title: "Free jazz and easy-listening guitar albums · Allen Gillon",
      description:
        "Listen to Allen Gillon's jazz and easy-listening guitar albums, including Timeless duets with Ann, and download every track free. No sign-up and no charge.",
      priority: 0.9,
      // Only the sleeves shown on /music (hiddenAlbums stay out).
      images: albums.map((a) => a.cover),
    },
    "/reviews": {
      title: "Friendly reviews · Allen Gillon",
      description:
        "Friendly reviews from diners, venue managers and friends who have heard Allen Gillon play light jazz guitar around Bribie Island. Leave a comment of your own.",
      priority: 0.6,
    },
    "/shows": {
      title: "The Matthew Allen 5 at Chandler Theatre · Allen Gillon",
      description:
        "The Matthew Allen 5 on stage at Chandler Theatre in 1998, with Allen Gillon on guitar. Hear the show's setlist in 30-second previews, from Brazil to Masquerade.",
      priority: 0.4,
      sitemap: SHOWS_INDEXED,
      noindex: !SHOWS_INDEXED,
    },
    "/privacy": {
      title: "Privacy · Allen Gillon",
      description:
        "How allengillon.com and More on Allen handle your details: reviews, comments, Stripe payments, Cloudflare hosting and YouTube videos. Contact support any time.",
      legal: true,
      priority: 0.2,
    },
    "/terms": {
      title: "Terms of sale · Allen Gillon",
      description:
        "Terms for buying Ann Gillon's paintings and Allen Gillon's play scripts: sellers, delivery, digital files, refunds under the Australian Consumer Law, licences.",
      legal: true,
      priority: 0.2,
    },
    "/accessibility": {
      title: "Accessibility · Allen Gillon",
      description:
        "How Allen Gillon's websites are built for everyone: large type, strong contrast, keyboard access, no hover-only controls. Tell us if anything gets in the way.",
      legal: true,
      priority: 0.2,
    },
    "/comments": {
      title: "Write a comment · Allen Gillon",
      description:
        "Write a comment about Allen Gillon's guitar music, his free albums or a booking. Your message goes straight to Allen by text message, right from this page.",
      sitemap: false,
      noindex: true,
    },
  },
  other: {
    "/": {
      title: "More on Allen: stories, Timeless and Ann's art",
      description:
        "Allen Gillon's personal side: Chinese Chimes stories and school plays for young readers, the Timeless story of Allen and Ann, and Ann Gillon's paintings.",
      priority: 1,
      images: ["/images/chinese-chimes-together.webp"],
    },
    "/biography": {
      title: "Timeless, Allen and Ann's story · More on Allen",
      description:
        "Allen met Ann in 1967 while his band, The New Breed, played in Parramatta. The Timeless story of their life in music, from Sydney clubs to Bribie Island.",
      priority: 0.8,
      images: ["/images/personal/current-portrait-allen-2026.jpg"],
    },
    "/books": {
      title: "Stories, plays and textbooks by Allen Gillon · More on Allen",
      description:
        "Read Allen Gillon's Chinese Chimes stories with their audiobooks, preview his school plays for young performers, and open his published classroom textbooks.",
      priority: 0.9,
      images: ["/images/chinese-chimes-together.webp"],
    },
    "/anns-art": {
      title: "Ann Gillon's original paintings · More on Allen",
      description:
        `Original paintings by Ann Gillon of Bribie Island: animals, coast and country scenes. Prices from ${SALE_PRICE_RANGE}, with free delivery anywhere in Australia.`,
      priority: 0.9,
    },
    "/delivery": {
      title: "Delivery and payment for Ann's paintings · More on Allen",
      description:
        "How buying one of Ann Gillon's original paintings works: free delivery within Australia, secure Stripe checkout and help with framing and delivery dates.",
      priority: 0.3,
    },
    "/comments": {
      title: "Write a comment · More on Allen",
      description:
        "Write a comment about Allen Gillon's stories, school plays, the Timeless story or Ann Gillon's paintings. The message goes straight to Allen by text message.",
      sitemap: false,
      noindex: true,
    },
  },
};

// ---------------------------------------------------------------------------
// Content for the dynamic routes

/** Books by slug, from content/books.config.json (the reader's source list). */
export const BOOKS = booksConfig.map(({ slug, title, section }) => ({ slug, title, section }));

/** Sections whose words are published as a /read/<slug>/text route. Plays are preview only. */
export const TEXT_SECTIONS = ["childrens", "teaching"];

/** Plays with a school recording (a 60-second preview is public, the rest is private/). */
export const PLAY_RECORDINGS = ["melting-pot", "breakout"];

export const hasTextRoute =(bookEntry) => Boolean(bookEntry) && TEXT_SECTIONS.includes(bookEntry.section);

const bookBySlug = (slug) => BOOKS.find((b) => b.slug === slug) || null;
const artworkById = (id) => artworks.find((a) => a.id === id) || null;

// ---------------------------------------------------------------------------
// Text fitting for generated titles and descriptions

/**
 * Adds " · <site name>" when the whole title still fits in 60 characters.
 * `shorter` lists fallback stems, tried in order, so a long name keeps the
 * brand with a shorter stem before the brand is dropped from the full stem.
 */
export function fitTitle(title, site, ...shorter) {
  for (const stem of [title, ...shorter]) {
    const withSite = `${stem} · ${nameOf(site)}`;
    if (withSite.length <= TITLE_MAX) return withSite;
  }
  return title;
}

/**
 * Joins `base` with an ordered subset of `extras` so the result is 150-160
 * characters, preferring the result closest to 155. Throws when no subset
 * fits, so a new title that breaks the rule fails the unit test, not Google.
 */
export function fitDescription(base, extras = []) {
  let best = null;
  const n = extras.length;
  for (let mask = 0; mask < 1 << n; mask += 1) {
    const text = [base, ...extras.filter((_, i) => mask & (1 << i))].join(" ");
    if (text.length < DESCRIPTION_MIN || text.length > DESCRIPTION_MAX) continue;
    if (!best || Math.abs(text.length - 155) < Math.abs(best.length - 155)) best = text;
  }
  if (!best) throw new Error(`No description of ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters for: ${base}`);
  return best;
}


function readRouteMeta(bookEntry) {
  const { title, section } = bookEntry;
  if (section === "plays") {
    return {
      title: fitTitle(`${title}, a school play by Allen Gillon`, "other", `${title}, a school play`, `${title}, a play`),
      description: fitDescription(
        `${title}, a school play by Allen Gillon. Read the first pages free online. ${PLAY_SCRIPT_LINE}`,
        [
          ...(PLAY_RECORDINGS.includes(bookEntry.slug) ? ["Hear a preview of the school recording."] : []),
          "Written for primary school casts and their teachers.",
          "For young performers.",
          "From Bribie Island, Queensland.",
        ],
      ),
      priority: 0.7,
    };
  }
  if (section === "teaching") {
    return {
      title: fitTitle(`${title}, a classroom textbook`, "other", `${title}, a textbook`, title),
      description: fitDescription(`${title} is a published classroom textbook by Allen Gillon.`, [
        "Read it free online, page by page, or download the PDF for your class.",
        "Written for teachers and their students.",
        "Free to use.",
        "From Bribie Island, Queensland.",
      ]),
      priority: 0.7,
    };
  }
  return {
    title: fitTitle(`${title}, a Chinese Chimes story`, "other", `${title}, a story by Allen`, `${title}, a story`),
    description: fitDescription(`${title} is a Chinese Chimes story by Allen Gillon.`, [
      "Turn the illustrated pages online and listen to the audiobook as you read.",
      "Free for young readers, parents and teachers.",
      "No sign-up.",
      "From Bribie Island.",
    ]),
    priority: 0.8,
  };
}

function readTextRouteMeta(bookEntry) {
  const { title, section } = bookEntry;
  const kind = section === "teaching" ? "classroom textbook" : "Chinese Chimes story";
  return {
    title: fitTitle(`${title}, the full text`, "other", `${title}, full text`),
    description: fitDescription(`The full text of ${title}, a ${kind} by Allen Gillon, as plain words.`, [
      "Easy to read at any size, with a screen reader or in print.",
      "The page reader shows the original pages.",
      "Free to read.",
      "No sign-up.",
    ]),
    priority: 0.5,
  };
}

function artworkRouteMeta(art) {
  const forSale = art.availability === "available" && Number(art.priceCents) > 0;
  const views = (art.images || []).length;
  const base = forSale
    ? `${art.title}, an original painting by Ann Gillon of Bribie Island. ${aud(art.priceCents)} with free delivery in Australia.`
    : `${art.title}, an original painting by Ann Gillon of Bribie Island. Text Allen to ask about this work.`;
  const extras = [
    ...(art.medium ? [`Medium: ${art.medium.toLowerCase()}.`] : []),
    views > 1 ? `See all ${views} views at full size.` : "See it at full size.",
    "A one-off original.",
    forSale ? "Text Allen with any questions." : "Other paintings are for sale.",
    "Part of Ann's gallery on More on Allen.",
  ];
  return {
    title: fitTitle(`${art.title}, a painting by Ann Gillon`, "other", `${art.title}, by Ann Gillon`, `${art.title}, a painting`),
    description: fitDescription(base, extras),
    priority: 0.6,
    images: (art.images || []).map((img) => img.src),
  };
}

// ---------------------------------------------------------------------------
// Route lookup

/** Absolute canonical URL. The home page keeps its trailing slash. */
export function canonicalUrl(site, route) {
  return `${originOf(site)}${route === "/" ? "/" : route}`;
}

/**
 * Metadata entry for any route on a host, static or dynamic, or null.
 * Legal routes exist on main only.
 */
export function routeMeta(site, route) {
  const key = siteKey(site);
  const fixed = ROUTE_META[key][route];
  if (fixed) return fixed;
  if (key !== "other") return null;

  let match = route.match(/^\/read\/([a-z0-9-]+)$/);
  if (match) {
    const entry = bookBySlug(match[1]);
    return entry ? readRouteMeta(entry) : null;
  }
  match = route.match(/^\/read\/([a-z0-9-]+)\/text$/);
  if (match) {
    const entry = bookBySlug(match[1]);
    return hasTextRoute(entry) ? readTextRouteMeta(entry) : null;
  }
  match = route.match(/^\/anns-art\/([a-z0-9-]+)$/);
  if (match) {
    const art = artworkById(match[1]);
    return art ? artworkRouteMeta(art) : null;
  }
  return null;
}

/** Every route a host serves, static and dynamic, including noindex ones. */
export function allRoutes(site) {
  const key = siteKey(site);
  const routes = Object.keys(ROUTE_META[key]);
  if (key === "other") {
    for (const b of BOOKS) {
      routes.push(`/read/${b.slug}`);
      if (hasTextRoute(b)) routes.push(`/read/${b.slug}/text`);
    }
    for (const art of artworks) routes.push(`/anns-art/${art.id}`);
  }
  return routes;
}

// ---------------------------------------------------------------------------
// Next.js metadata

/** Paper, the manifests' theme and background colour (site.css --paper in sRGB). */
export const THEME_COLOR = "#f8f6ee";

/** Icon set and manifest paths for a host (files in public/icons/<site>/). */
export function iconSet(site) {
  const dir = `/icons/${siteKey(site)}`;
  return {
    icon: [
      { url: `${dir}/favicon.ico`, sizes: "16x16 32x32 48x48" },
      { url: `${dir}/icon.svg`, type: "image/svg+xml" },
      { url: `${dir}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: `${dir}/apple-icon-180.png`, sizes: "180x180", type: "image/png" }],
  };
}

/**
 * Group layout metadata for a host: metadataBase, title template, icons,
 * manifest, Open Graph defaults (site name, en_AU, home image) and a
 * summary_large_image twitter card. Pages override the rest.
 */
export function hostMetadata(site) {
  const key = siteKey(site);
  const home = ROUTE_META[key]["/"];
  const images = ogImages(key, "/");
  return {
    metadataBase: new URL(originOf(key)),
    title: { default: nameOf(key), template: `%s · ${nameOf(key)}` },
    applicationName: nameOf(key),
    icons: iconSet(key),
    manifest: `/icons/${key}/manifest.webmanifest`,
    openGraph: { siteName: nameOf(key), locale: LOCALE, type: "website", images },
    twitter: { card: "summary_large_image", images },
  };
}

/** Group layout viewport: the browser theme colour. */
export function hostViewport() {
  return { themeColor: THEME_COLOR };
}

function mergeMetadata(base, overrides = {}) {
  const out = { ...base, ...overrides };
  for (const k of ["openGraph", "twitter", "alternates"]) {
    if (overrides[k] && base[k]) out[k] = { ...base[k], ...overrides[k] };
  }
  return out;
}

/**
 * The full Next.js `metadata` object for a route: absolute title, description,
 * absolute canonical, Open Graph (site name, en_AU, 1200x630 image from
 * lib/og.mjs) and a summary_large_image Twitter card. `overrides` are merged
 * on top (openGraph, twitter and alternates one level deep).
 *
 * The home page of each host clears metadataBase, because Next prints a root
 * canonical as the bare origin without its trailing slash when one is set.
 * Canonical, Open Graph and twitter URLs are absolute and icon paths are
 * root-relative, so nothing depends on metadataBase.
 */
export function pageMetadata(site, route, overrides = {}) {
  const key = siteKey(site);
  const meta = routeMeta(key, route);
  if (!meta) throw new Error(`lib/seo.mjs has no metadata for ${key} ${route}`);
  const url = canonicalUrl(key, route);
  const images = ogImages(key, route);
  const base = {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: url },
    // Repeated from the group layout, because /comments (and any other
    // host-aware page) sits outside both group layouts.
    icons: iconSet(key),
    manifest: `/icons/${key}/manifest.webmanifest`,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: nameOf(key),
      locale: LOCALE,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images,
    },
  };
  if (route === "/") base.metadataBase = null;
  if (meta.noindex) base.robots = NOINDEX;
  return mergeMetadata(base, overrides);
}

/** robots noindex for pages that must never be indexed (app/dev, placeholders). */
export function noindexMetadata(extra = {}) {
  return { robots: NOINDEX, ...extra };
}

/**
 * /read/[slug]. `placeholder: true` (a book not yet digitised) adds noindex.
 * Returns {} for an unknown slug so the page's notFound() decides.
 */
export function readMetadata(slug, { placeholder = false } = {}) {
  if (!bookBySlug(slug)) return {};
  const meta = pageMetadata("other", `/read/${slug}`);
  return placeholder ? { ...meta, robots: NOINDEX } : meta;
}

/** /read/[slug]/text. Stories and textbooks only; {} otherwise. */
export function readTextMetadata(slug) {
  return hasTextRoute(bookBySlug(slug)) ? pageMetadata("other", `/read/${slug}/text`) : {};
}

/** /anns-art/[id]. {} for an unknown id. */
export function artworkMetadata(id) {
  return artworkById(id) ? pageMetadata("other", `/anns-art/${id}`) : {};
}

// Ready-made generateMetadata functions for the dynamic pages.
export async function generateReadMetadata({ params }) {
  return readMetadata((await params).slug);
}
export async function generateReadTextMetadata({ params }) {
  return readTextMetadata((await params).slug);
}
export async function generateArtworkMetadata({ params }) {
  return artworkMetadata((await params).id);
}

// ---------------------------------------------------------------------------
// robots.txt and sitemap.xml

/** robots.txt for a host: keep crawlers out of /api/ and point at the sitemap. */
export function robotsTxt(site) {
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${originOf(site)}/sitemap.xml\n`;
}

const isLegalRoute = (route) => LEGAL_PATHS.includes(route);

/**
 * Sitemap entries for a host: only the pages it owns and wants indexed.
 * Legal pages appear on main only, and only while legal.config.json is
 * published. The other host lists every /read slug, the story and textbook
 * text routes and every painting, with image entries.
 */
export function sitemapEntries(site, { legalPublished = legalConfig.published === true } = {}) {
  const key = siteKey(site);
  const origin = originOf(key);
  const entries = [];
  for (const route of allRoutes(key)) {
    const meta = routeMeta(key, route);
    if (!meta || meta.sitemap === false || meta.noindex) continue;
    if (meta.legal && !(key === "main" && legalPublished && isLegalRoute(route))) continue;
    entries.push({
      url: canonicalUrl(key, route),
      priority: meta.priority,
      images: (meta.images || []).map((src) => `${origin}${src}`),
    });
  }
  // Book pages show the cover (page one of the scan).
  for (const entry of entries) {
    const m = entry.url.match(/\/read\/([a-z0-9-]+)$/);
    if (m) entry.images = [`${origin}/books/${m[1]}/p001.webp`];
  }
  return entries;
}

const escapeXml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** sitemap.xml for a host, with Google image extensions. */
export function sitemapXml(site, options) {
  const entries = sitemapEntries(site, options);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ];
  for (const entry of entries) {
    lines.push("<url>", `<loc>${escapeXml(entry.url)}</loc>`);
    // sitemap 0.9 order: loc, lastmod, changefreq, priority, then extensions.
    if (typeof entry.priority === "number") lines.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
    for (const src of entry.images) lines.push(`<image:image><image:loc>${escapeXml(src)}</image:loc></image:image>`);
    lines.push("</url>");
  }
  lines.push("</urlset>", "");
  return lines.join("\n");
}

/** Response headers for robots.txt and sitemap.xml (cached for an hour at the edge). */
export const TEXT_ROUTE_HEADERS = {
  robots: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  sitemap: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
};
