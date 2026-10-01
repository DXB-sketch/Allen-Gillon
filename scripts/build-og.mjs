// Builds the 1200x630 Open Graph images for both hosts, plus a manifest.
//
//   node scripts/build-og.mjs
//
// Output:
//   public/og/main/<route-slug>.jpg          one per main page (home, hire, music, ...)
//   public/og/main/music/<album>.jpg         one per album, from its own cover
//   public/og/other/<route-slug>.jpg         one per other page (home, biography, books, ...)
//   public/og/other/anns-art/<id>.jpg        one per painting, from its own photograph
//   public/og/other/read/<slug>.jpg          one per story, play and textbook, from its cover page
//   content/og-images.json                   { main: { route: {url,width,height,alt} }, other: {...} }
//
// The Workers runtime has no filesystem, so pages import content/og-images.json
// statically (see lib/og.mjs). Titles are set in Times New Roman through
// librsvg/pango; the monogram is drawn as paths. Re-run after adding a painting,
// album or book, or after changing a title below.

import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { artworks } from "../content/artworks.mjs";
import { PALETTE, ROOT, escapeXml, inksFor, monogramGroup, wrapText } from "./brand-art.mjs";

const W = 1200;
const H = 630;
const QUALITY = 80;
const FONT = "'Times New Roman', Times, 'Liberation Serif', serif";
const HOST_LABEL = { main: "allengillon.com", other: "other.allengillon.com" };

// Albums shown on /music (app/(main)/music/page.jsx). The hidden Tim Hughes
// album is left out on purpose, like on the page.
export const ALBUMS = [
  { id: "thats-the-time", title: "That's The Time", by: "Allen Gillon", cover: "/images/albums/album-thats-the-time.jpg" },
  { id: "wonderful-world", title: "Wonderful World", by: "Allen Gillon", cover: "/images/albums/album-wonderful-world-PHOTO-of-allen.png" },
  { id: "misty", title: "Misty", by: "Ann and Allen Gillon", cover: "/images/personal/album-misty-PHOTO-of-ann.jpg" },
  { id: "i-just-called", title: "I Just Called", by: "Allen Gillon", cover: "/images/albums/album-i-just-called.jpg" },
];

const MAIN_PAGES = [
  { route: "/", slug: "home", title: "Allen Gillon", subtitle: "Guitarist on Bribie Island" },
  { route: "/hire", slug: "hire", title: "Book a guitarist", subtitle: "Bribie Island, Moreton Bay, Brisbane and the Sunshine Coast" },
  { route: "/music", slug: "music", title: "Albums", subtitle: "Play/download plus original songs" },
  { route: "/reviews", slug: "reviews", title: "Reviews", subtitle: "What listeners say about Allen Gillon" },
  { route: "/shows", slug: "shows", title: "Shows", subtitle: "Allen Gillon on stage, then and now" },
  { route: "/privacy", slug: "privacy", title: "Privacy", subtitle: "How allengillon.com handles your details" },
  { route: "/terms", slug: "terms", title: "Terms", subtitle: "Buying from Allen Gillon and Ann Gillon" },
  { route: "/accessibility", slug: "accessibility", title: "Accessibility", subtitle: "Large type, strong contrast, no hover-only controls" },
];

const OTHER_PAGES = [
  { route: "/", slug: "home", title: "Allen Gillon", subtitle: "Stories, Timeless Duo and Ann's Art Room" },
  { route: "/biography", slug: "biography", title: "Timeless Duo", subtitle: "Ann and Allen Gillon, a life in music since 1967" },
  { route: "/books", slug: "books", title: "Stories", subtitle: "Stories, plays and textbooks by Allen Gillon" },
  { route: "/anns-art", slug: "anns-art", title: "Ann's Art Room", subtitle: "Original paintings. Free delivery in Australia" },
  { route: "/delivery", slug: "delivery", title: "Delivery and payment", subtitle: "Ann Gillon's original paintings" },
];

const SECTION_LABEL = { plays: "School play by Allen Gillon", childrens: "Chinese Chimes story by Allen Gillon", teaching: "Classroom textbook by A. R. Gillon" };

function books() {
  const config = JSON.parse(readFileSync(path.join(ROOT, "content", "books.config.json"), "utf8"));
  return config.map((book) => {
    const pageOne = `/books/${book.slug}/p001.webp`;
    const fallback = `/images/books/${book.slug}.webp`;
    const cover = existsSync(path.join(ROOT, "public", pageOne)) ? pageOne : existsSync(path.join(ROOT, "public", fallback)) ? fallback : null;
    return { ...book, cover };
  });
}

// ---------------------------------------------------------------------------
// Drawing

function rules(site, y) {
  const { lead, second } = inksFor(site);
  return [
    `<line x1="80" y1="${y}" x2="${W - 80}" y2="${y}" stroke="${PALETTE.ink}" stroke-width="3"/>`,
    `<line x1="83" y1="${y + 7}" x2="${W - 77}" y2="${y + 7}" stroke="${lead}" stroke-width="3"/>`,
    `<line x1="86" y1="${y + 10}" x2="${W - 74}" y2="${y + 10}" stroke="${second}" stroke-opacity="0.3" stroke-width="3"/>`,
  ].join("");
}

function titleBlock({ title, subtitle, x, width, top, bottom, maxSize = 96, site }) {
  const { second } = inksFor(site);
  const subSize = 36;
  const subLh = Math.round(subSize * 1.3);
  // Keep names together ("Ann Gillon", "Allen Gillon") so a surname never sits alone.
  const subLines = subtitle ? wrapText(subtitle.replace(/(Ann|Allen) Gillon/g, "$1 Gillon"), subSize, width, 3) : [];
  const subHeight = subLines.length ? 24 + subSize + (subLines.length - 1) * subLh : 0;
  const layout = (size) => {
    const lines = wrapText(title, size, width, 3);
    const lh = Math.round(size * 1.08);
    return { size, lines, lh, height: size + (lines.length - 1) * lh + subHeight };
  };
  let fit = layout(maxSize);
  while (fit.size > 40 && (fit.height > bottom - top || fit.lines.length > 2)) fit = layout(fit.size - 4);
  const { size, lines, lh } = fit;
  // Centre the block vertically in the band between top and bottom.
  let y = top + Math.max(0, Math.round((bottom - top - fit.height) / 2)) + size;
  const out = [];
  lines.forEach((line, i) => {
    if (i) y += lh;
    // A faint second-ink copy under the title: the overprint, printed not shadowed.
    out.push(`<text x="${x + 3}" y="${y + 2}" font-family="${FONT}" font-size="${size}" fill="${second}" fill-opacity="0.3">${escapeXml(line)}</text>`);
    out.push(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${PALETTE.ink}">${escapeXml(line)}</text>`);
  });
  y += 24;
  subLines.forEach((line, i) => {
    y += i ? subLh : subSize;
    out.push(`<text x="${x}" y="${y}" font-family="${FONT}" font-size="${subSize}" fill="${PALETTE.soft}">${escapeXml(line)}</text>`);
  });
  return out.join("");
}

function footer(site, x) {
  const { lead } = inksFor(site);
  return [
    rules(site, 540),
    `<text x="${x}" y="596" font-family="${FONT}" font-size="30" fill="${lead}">${escapeXml(HOST_LABEL[site])}</text>`,
  ].join("");
}

function textCard({ site, title, subtitle }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="${PALETTE.paper}"/>`,
    monogramGroup({ site, x: 800, y: 90, size: 330, stroke: 4.2, offset: 14 }),
    monogramGroup({ site, x: 80, y: 70, size: 88, stroke: 5.2, offset: 4 }),
    titleBlock({ title, subtitle, x: 80, width: 700, top: 180, bottom: 515, maxSize: 104, site }),
    footer(site, 80),
    `</svg>`,
  ].join("");
}

function imageCardOverlay({ site, title, subtitle, frame }) {
  const { lead, second } = inksFor(site);
  const tx = frame.left + frame.width + 56;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    // 3px ink border on the photograph, with a second-ink misregistered copy at 30%.
    `<rect x="${frame.left + 3}" y="${frame.top + 0.5}" width="${frame.width + 3}" height="${frame.height + 3}" fill="none" stroke="${second}" stroke-opacity="0.3" stroke-width="3"/>`,
    `<rect x="${frame.left - 1.5}" y="${frame.top - 1.5}" width="${frame.width + 3}" height="${frame.height + 3}" fill="none" stroke="${PALETTE.ink}" stroke-width="3"/>`,
    monogramGroup({ site, x: tx, y: 60, size: 72, stroke: 5.2, offset: 3.5 }),
    titleBlock({ title, subtitle, x: tx, width: W - tx - 60, top: 150, bottom: 540, maxSize: 72, site }),
    `<text x="${tx}" y="596" font-family="${FONT}" font-size="28" fill="${lead}">${escapeXml(HOST_LABEL[site])}</text>`,
    `</svg>`,
  ].join("");
}

async function imageCard({ site, title, subtitle, source }) {
  const file = path.join(ROOT, "public", source);
  // The artwork is shown whole ("contain") inside an ink frame, so a tall
  // painting is never cropped to a strip. Max box 600 x 510.
  const boxW = 600;
  const boxH = 510;
  const resized = await sharp(file).rotate().resize(boxW, boxH, { fit: "inside", withoutEnlargement: false }).toBuffer({ resolveWithObject: true });
  const { width, height } = resized.info;
  const frame = { left: 60 + Math.round((boxW - width) / 2), top: Math.round((H - height) / 2) - 6, width, height };
  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${PALETTE.paper}"/></svg>`);
  return sharp(background)
    .composite([
      { input: resized.data, left: frame.left, top: frame.top },
      { input: Buffer.from(imageCardOverlay({ site, title, subtitle, frame })), left: 0, top: 0 },
    ])
    .flatten({ background: PALETTE.paper })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
}

async function textJpeg(card) {
  return sharp(Buffer.from(textCard(card))).flatten({ background: PALETTE.paper }).jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
}

// ---------------------------------------------------------------------------

const manifest = { main: {}, other: {} };
let bytes = 0;
let count = 0;

async function emit(site, route, relFile, buffer, alt, alsoRoutes = []) {
  const target = path.join(ROOT, "public", "og", site, relFile);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  bytes += buffer.length;
  count += 1;
  const entry = { url: `/og/${site}/${relFile}`, width: W, height: H, alt };
  for (const r of [route, ...alsoRoutes]) manifest[site][r] = entry;
}

await rm(path.join(ROOT, "public", "og"), { recursive: true, force: true });

for (const page of MAIN_PAGES) {
  await emit("main", page.route, `${page.slug}.jpg`, await textJpeg({ site: "main", ...page }), `${page.title}. ${page.subtitle}`);
}
for (const album of ALBUMS) {
  const buf = await imageCard({ site: "main", title: album.title, subtitle: `Album by ${album.by}`, source: album.cover });
  await emit("main", `/music#${album.id}`, `music/${album.id}.jpg`, buf, `${album.title} album cover`);
}

for (const page of OTHER_PAGES) {
  await emit("other", page.route, `${page.slug}.jpg`, await textJpeg({ site: "other", ...page }), `${page.title}. ${page.subtitle}`);
}
for (const art of artworks) {
  const image = art.images?.[0];
  if (!image) continue;
  const note = art.availability === "available" ? "Original painting by Ann Gillon" : "Painting by Ann Gillon";
  const buf = await imageCard({ site: "other", title: art.title, subtitle: note, source: image.src });
  await emit("other", `/anns-art/${art.id}`, `anns-art/${art.id}.jpg`, buf, `${art.title}, a painting by Ann Gillon`);
}
for (const book of books()) {
  const subtitle = SECTION_LABEL[book.section] || "By Allen Gillon";
  const buf = book.cover
    ? await imageCard({ site: "other", title: book.title, subtitle, source: book.cover })
    : await textJpeg({ site: "other", title: book.title, subtitle });
  await emit("other", `/read/${book.slug}`, `read/${book.slug}.jpg`, buf, `Cover of ${book.title}`, [`/read/${book.slug}/text`]);
}

await writeFile(path.join(ROOT, "content", "og-images.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${count} OG images, ${(bytes / 1024).toFixed(0)} KiB total; manifest at content/og-images.json`);
