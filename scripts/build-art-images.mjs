// Responsive AVIF and WebP copies of Ann's paintings for /anns-art.
//
// Usage: node scripts/build-art-images.mjs [--force]
//
// Reads each image listed in content/artworks.mjs (public/images/art/gallery/*.webp)
// and writes public/images/art-responsive/<name>-<width>.avif and .webp at
// the widths from artImageWidths() in lib/art-catalog.mjs: 480, 960 and 1600,
// capped at the photograph's own width (the Facebook sources are 1400px at
// most, so the largest copy is the source width, never an upscale).
// Existing files are kept unless --force is given.
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { artworks, artImageName, artImageWidths, ART_RESPONSIVE_DIR } from "../lib/art-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", ART_RESPONSIVE_DIR);
const force = process.argv.includes("--force");

await fs.mkdir(outDir, { recursive: true });

// A painting's views must be different photographs. lib/art-catalog.mjs drops
// the known byte-for-byte repeats (DUPLICATE_VIEWS); stop here if a new one
// has crept into content/artworks.mjs, so it is listed before it ships.
const repeats = [];
for (const art of artworks) {
  const seen = new Map();
  for (const image of art.images) {
    const hash = createHash("sha256").update(await fs.readFile(path.join(root, "public", image.src))).digest("hex");
    if (seen.has(hash)) repeats.push(`${art.title}: ${artImageName(image)} repeats ${seen.get(hash)}`);
    else seen.set(hash, artImageName(image));
  }
}
if (repeats.length) {
  console.error(`Repeated views (add them to DUPLICATE_VIEWS in lib/art-catalog.mjs):\n  ${repeats.join("\n  ")}`);
  process.exit(1);
}

const exists = (file) => fs.access(file).then(() => true, () => false);
let written = 0;
let kept = 0;
let bytes = 0;

for (const art of artworks) {
  for (const image of art.images) {
    const source = path.join(root, "public", image.src);
    const name = artImageName(image);
    for (const width of artImageWidths(image)) {
      for (const format of ["avif", "webp"]) {
        const file = path.join(outDir, `${name}-${width}.${format}`);
        if (!force && (await exists(file))) {
          kept += 1;
          bytes += (await fs.stat(file)).size;
          continue;
        }
        const pipeline = sharp(source).resize({ width, withoutEnlargement: true });
        const buffer = format === "avif"
          ? await pipeline.avif({ quality: 52, effort: 6 }).toBuffer()
          : await pipeline.webp({ quality: 76, effort: 6 }).toBuffer();
        await fs.writeFile(file, buffer);
        written += 1;
        bytes += buffer.length;
      }
    }
  }
}

// Remove copies no painting uses any more (a dropped repeat, a removed view).
const expected = new Set(artworks.flatMap((art) => art.images.flatMap((image) =>
  artImageWidths(image).flatMap((w) => [`${artImageName(image)}-${w}.avif`, `${artImageName(image)}-${w}.webp`]))));
let removed = 0;
for (const file of await fs.readdir(outDir)) {
  if (!expected.has(file)) { await fs.rm(path.join(outDir, file)); removed += 1; }
}

console.log(`art images: ${written} written, ${kept} kept, ${removed} removed, ${(bytes / 1048576).toFixed(1)} MB in public/${ART_RESPONSIVE_DIR}`);
