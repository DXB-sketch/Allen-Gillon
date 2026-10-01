// Builds the "AG" monogram icon set for both hosts.
//
//   node scripts/build-icons.mjs
//
// Writes, per host, into public/icons/main/ (red-led) and public/icons/other/
// (blue-led):
//   icon.svg, favicon.ico (16/32/48), icon-192.png, icon-512.png,
//   icon-maskable-512.png, apple-icon-180.png, manifest.webmanifest
//
// The monogram is drawn as SVG paths (scripts/brand-art.mjs), never as text,
// so the output does not depend on installed fonts.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PALETTE, ROOT, monogramSvg } from "./brand-art.mjs";

const HOSTS = {
  main: { name: "Allen Gillon", shortName: "Allen Gillon", description: "Allen Gillon, guitarist on Bribie Island: bookings, albums and original songs." },
  other: { name: "Allen Gillon", shortName: "Allen Gillon", description: "Allen Gillon's personal side: Stories, Timeless Duo and Ann's Art Room." },
};

async function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 72 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

/**
 * A real multi-image ICO container with PNG-compressed entries
 * (supported by every browser and by Windows since Vista).
 */
export function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function buildHost(site) {
  const dir = path.join(ROOT, "public", "icons", site);
  await mkdir(dir, { recursive: true });
  const meta = HOSTS[site];
  const written = [];
  const put = async (name, data) => {
    await writeFile(path.join(dir, name), data);
    written.push(`public/icons/${site}/${name} (${data.length} B)`);
  };

  // Scalable icon for <link rel="icon" type="image/svg+xml">.
  await put("icon.svg", `${monogramSvg({ site, size: 64, pad: 0.1 })}\n`);

  // favicon.ico: each size is drawn at its own size so the strokes are tuned for it.
  const ico = [];
  for (const size of [16, 32, 48]) {
    ico.push({ size, data: await png(monogramSvg({ site, size, pad: size <= 16 ? 0.04 : 0.08 }), size) });
  }
  await put("favicon.ico", buildIco(ico));

  await put("icon-192.png", await png(monogramSvg({ site, size: 192, pad: 0.12 }), 192));
  await put("icon-512.png", await png(monogramSvg({ site, size: 512, pad: 0.12 }), 512));
  // Maskable: the monogram sits inside the central 80% safe zone (a circle of
  // radius 40%), on a solid paper background that fills the whole square.
  await put("icon-maskable-512.png", await png(monogramSvg({ site, size: 512, pad: 0.25 }), 512));
  // Apple touch icon: iOS adds its own corner mask and ignores transparency.
  await put("apple-icon-180.png", await png(monogramSvg({ site, size: 180, pad: 0.14 }), 180));

  const manifest = {
    name: meta.name,
    short_name: meta.shortName,
    description: meta.description,
    lang: "en-AU",
    start_url: "/",
    scope: "/",
    display: "browser",
    theme_color: PALETTE.paper,
    background_color: PALETTE.paper,
    icons: [
      { src: `/icons/${site}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `/icons/${site}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `/icons/${site}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `/icons/${site}/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  await put("manifest.webmanifest", `${JSON.stringify(manifest, null, 2)}\n`);
  return written;
}

const all = [];
for (const site of Object.keys(HOSTS)) all.push(...(await buildHost(site)));
console.log(all.join("\n"));
