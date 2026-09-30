// build-books.mjs
// Turns the source PDFs into the static reader assets in public/books/<slug>/
// (WebP pages and their smaller copies, manifest.json, and the PDF only when download is "public") for
// every title in content/books.config.json, then writes public/books/index.json.
//
// Paid content never reaches public/:
// - Plays (section "plays") emit page images for pages 1 to previewPages only.
//   The full renders are not kept at all.
// - The PDF is copied to public/ only when download === "public". Play PDFs
//   stay in private/plays/.
// - Anything else found in public/books/<slug>/ (stale page images, old PDFs,
//   thumbs, text.txt) is deleted, so a rebuild also cleans up older builds.
//
// Sources are looked up in this order: scripts/incoming/processed/,
// scripts/incoming/, private/plays/, private/books/, and finally the PDF that
// is already published in public/books/<slug>/ (stories and textbooks).
// When no source exists the title keeps its existing page images, and its
// manifest is still rewritten from the config and pruned.
//
// Usage: npm run build:books [-- --force]
//   --force  re-render every page image even when a manifest already exists.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, rm, readFile, writeFile, copyFile, readdir, access, mkdtemp, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { playPrice } from "../lib/storefront.mjs";
import { normaliseBook, pageFile, pageVariantFile, keepFile, PAGE_VARIANT_WIDTHS } from "../lib/books.mjs";

const execFileP = promisify(execFile);
const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT_ROOT = path.join(ROOT, "public", "books");
const CONFIG = path.join(ROOT, "content", "books.config.json");
const SOURCE_DIRS = [
  path.join(ROOT, "scripts", "incoming", "processed"),
  path.join(ROOT, "scripts", "incoming"),
  path.join(ROOT, "private", "plays"),
  path.join(ROOT, "private", "books"),
];

const FORCE = process.argv.includes("--force");
const SCREEN_WIDTH = 1080;
const SCREEN_QUALITY = 72;
const DPI = 150;

const exists = (p) => access(p).then(() => true, () => false);

async function findSource(book) {
  for (const dir of SOURCE_DIRS) {
    for (const name of [book.file, `${book.slug}.pdf`]) {
      const candidate = path.join(dir, name);
      if (await exists(candidate)) return candidate;
    }
  }
  const published = path.join(OUT_ROOT, book.slug, `${book.slug}.pdf`);
  if (await exists(published)) return published;
  return null;
}

async function which(cmd, args) {
  try {
    await execFileP(cmd, args);
    return true;
  } catch (err) {
    // pdftoppm -v prints to stderr and may exit non-zero on some builds
    if (err && typeof err.stderr === "string" && err.stderr.length && err.code !== "ENOENT") return true;
    return false;
  }
}

async function findRasteriser() {
  if (await which("pdftoppm", ["-v"])) return { kind: "poppler" };
  const gsCandidates = [process.env.GS, "gswin64c", "gs", "C:\\Program Files\\gs\\gs10.05.1\\bin\\gswin64c.exe"].filter(Boolean);
  for (const gs of gsCandidates) {
    if (await which(gs, ["--version"])) return { kind: "ghostscript", bin: gs };
  }
  return { kind: "pdfjs" };
}

async function pdfPageCount(pdfPath) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, verbosity: 0 }).promise;
  const n = doc.numPages;
  await doc.destroy();
  return n;
}

const listPngs = async (dir) =>
  (await readdir(dir)).filter((f) => f.endsWith(".png")).sort().map((f) => path.join(dir, f));

// Each rasteriser renders pages 1..lastPage into tmpDir and returns sorted PNG paths.
async function rasterise(tool, pdfPath, lastPage, tmpDir) {
  if (tool.kind === "poppler") {
    await execFileP("pdftoppm", ["-png", "-r", String(DPI), "-f", "1", "-l", String(lastPage), pdfPath, path.join(tmpDir, "p")], {
      maxBuffer: 64 * 1024 * 1024,
    });
    return listPngs(tmpDir);
  }
  if (tool.kind === "ghostscript") {
    await execFileP(tool.bin, [
      "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sDEVICE=png16m", `-r${DPI}`,
      "-dTextAlphaBits=4", "-dGraphicsAlphaBits=4", "-dFirstPage=1", `-dLastPage=${lastPage}`,
      `-sOutputFile=${path.join(tmpDir, "p-%03d.png")}`, pdfPath,
    ], { maxBuffer: 64 * 1024 * 1024 });
    return listPngs(tmpDir);
  }
  // Pure-Node fallback: pdfjs-dist renders each page onto an @napi-rs/canvas.
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createCanvas } = await import("@napi-rs/canvas");
  const standardFontDataUrl = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts/");
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await getDocument({ data, standardFontDataUrl, disableWorker: true, verbosity: 0 }).promise;
  const scale = DPI / 72;
  for (let i = 1; i <= Math.min(lastPage, doc.numPages); i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    await writeFile(path.join(tmpDir, `p-${String(i).padStart(3, "0")}.png`), canvas.toBuffer("image/png"));
    page.cleanup();
  }
  await doc.destroy();
  return listPngs(tmpDir);
}

// Deletes every file in outDir that the manifest does not allow. This is what
// removes non-preview play pages, play PDFs, thumbs and old text.txt copies.
async function prune(outDir, manifest) {
  if (!(await exists(outDir))) return [];
  const removed = [];
  for (const entry of await readdir(outDir, { withFileTypes: true })) {
    if (keepFile(manifest, entry.name) && entry.isFile()) continue;
    await rm(path.join(outDir, entry.name), { recursive: true, force: true });
    removed.push(entry.name);
  }
  return removed;
}

// The smaller copies of each page image (lib/books.mjs PAGE_VARIANT_WIDTHS),
// made from the full pNNN.webp so titles without a source PDF get them too.
// A copy is (re)made when it is missing, older than the full image, or --force.
async function buildVariants(outDir, shownPages, fullWidth) {
  let made = 0;
  for (let n = 1; n <= shownPages; n++) {
    const full = path.join(outDir, pageFile(n));
    if (!(await exists(full))) continue;
    const fullTime = (await stat(full)).mtimeMs;
    for (const width of PAGE_VARIANT_WIDTHS) {
      if (width >= fullWidth) continue;
      const dest = path.join(outDir, pageVariantFile(n, width));
      if (!FORCE && (await exists(dest)) && (await stat(dest)).mtimeMs >= fullTime) continue;
      await sharp(full).resize({ width }).webp({ quality: SCREEN_QUALITY }).toFile(dest);
      made += 1;
    }
  }
  return made;
}

async function buildBook(raw, tool) {
  const outDir = path.join(OUT_ROOT, raw.slug);
  const manifestPath = path.join(outDir, "manifest.json");
  const old = (await exists(manifestPath)) ? JSON.parse(await readFile(manifestPath, "utf8")) : null;
  const src = await findSource(raw);

  if (!src && !old) {
    console.log(`  ${raw.slug}: no source PDF and no earlier build, listed only.`);
    return normaliseBook(raw, { pageCount: 0, aspect: null, price: playPrice });
  }

  const pageCount = src ? await pdfPageCount(src) : old.pageCount;
  const probe = normaliseBook(raw, { pageCount, aspect: old?.aspect ?? null, price: playPrice });
  const haveAll = old && (await Promise.all(
    Array.from({ length: probe.shownPages }, (_, i) => exists(path.join(outDir, pageFile(i + 1))))
  )).every(Boolean);

  let aspect = old?.aspect ?? null;
  if (src && (FORCE || !haveAll)) {
    console.log(`  ${raw.slug}: rendering pages 1-${probe.shownPages} of ${pageCount} (${tool.kind}) ...`);
    const tmpDir = await mkdtemp(path.join(tmpdir(), `book-${raw.slug}-`));
    try {
      const pngs = await rasterise(tool, src, probe.shownPages, tmpDir);
      if (pngs.length !== probe.shownPages) throw new Error(`${raw.slug}: rendered ${pngs.length} pages, expected ${probe.shownPages}`);
      await mkdir(outDir, { recursive: true });
      for (let i = 0; i < pngs.length; i++) {
        const img = sharp(pngs[i]);
        if (i === 0) {
          const meta = await img.metadata();
          const w = Math.min(meta.width, SCREEN_WIDTH);
          aspect = [w, Math.round((meta.height / meta.width) * w)];
        }
        await img
          .resize({ width: SCREEN_WIDTH, withoutEnlargement: true })
          .webp({ quality: SCREEN_QUALITY })
          .toFile(path.join(outDir, pageFile(i + 1)));
      }
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  } else if (!src) {
    console.log(`  ${raw.slug}: source PDF not found, keeping the existing page images.`);
  } else {
    console.log(`  ${raw.slug}: already built (${pageCount} pages), manifest refreshed. Use --force to re-render.`);
  }

  let manifest = normaliseBook(raw, { pageCount, aspect, price: playPrice });
  await mkdir(outDir, { recursive: true });
  if (aspect) {
    const made = await buildVariants(outDir, manifest.shownPages, aspect[0]);
    if (made) console.log(`  ${raw.slug}: made ${made} smaller page image(s).`);
  }

  if (manifest.download === "public") {
    const dest = path.join(outDir, `${manifest.slug}.pdf`);
    if (!src) {
      if (!(await exists(dest))) throw new Error(`${raw.slug}: download is public but no PDF exists`);
    } else if (path.resolve(src) !== path.resolve(dest)) {
      await copyFile(src, dest);
    }
    manifest = normaliseBook(raw, { pageCount, aspect, price: playPrice, pdfBytes: (await stat(dest)).size });
  }

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  const removed = await prune(outDir, manifest);
  if (removed.length) console.log(`  ${raw.slug}: removed ${removed.length} file(s) not allowed in public (${removed.slice(0, 4).join(", ")}${removed.length > 4 ? ", ..." : ""}).`);
  return manifest;
}

async function main() {
  const config = JSON.parse(await readFile(CONFIG, "utf8"));
  const tool = await findRasteriser();
  console.log(`Rasteriser: ${tool.kind}`);

  const index = [];
  for (const book of config) index.push(await buildBook(book, tool));

  await mkdir(OUT_ROOT, { recursive: true });
  // Folders in public/books/ that no longer match a configured title go too.
  for (const entry of await readdir(OUT_ROOT, { withFileTypes: true })) {
    if (entry.isDirectory() && !config.some((b) => b.slug === entry.name)) {
      await rm(path.join(OUT_ROOT, entry.name), { recursive: true, force: true });
      console.log(`  removed unconfigured public/books/${entry.name}/`);
    }
  }
  await writeFile(path.join(OUT_ROOT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`Wrote public/books/index.json (${index.length} books).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
