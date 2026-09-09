// build-books.mjs
// Turns the source PDFs in scripts/incoming/ into the static reader assets in
// public/books/<slug>/ (WebP pages, thumbnails, manifest, copied PDF) for every
// book in content/books.config.json whose status is "free".
// Restricted books are skipped entirely: no page images, no copied PDF.
// Usage: npm run build:books [-- --force]

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, rm, readFile, writeFile, copyFile, readdir, access, mkdtemp } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const execFileP = promisify(execFile);
const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const INCOMING = path.join(ROOT, "scripts", "incoming");
const OUT_ROOT = path.join(ROOT, "public", "books");
const CONFIG = path.join(ROOT, "content", "books.config.json");
const TEXT_DIR = path.join(ROOT, "content", "book-text");

const FORCE = process.argv.includes("--force");
const SCREEN_WIDTH = 1080;
const SCREEN_QUALITY = 72;
const THUMB_WIDTH = 240;
const THUMB_QUALITY = 58;
const DPI = 150;

const exists = (p) => access(p).then(() => true, () => false);
const pad3 = (n) => String(n).padStart(3, "0");

async function hasPdftoppm() {
  try {
    await execFileP("pdftoppm", ["-v"]);
    return true;
  } catch (err) {
    // pdftoppm -v prints to stderr and may exit non-zero on some builds
    if (err && typeof err.stderr === "string" && /pdftoppm/i.test(err.stderr)) return true;
    return false;
  }
}

// Rasterise with poppler: writes p-001.png ... into tmpDir, returns sorted PNG paths.
async function rasteriseWithPoppler(pdfPath, tmpDir) {
  await execFileP("pdftoppm", ["-png", "-r", String(DPI), pdfPath, path.join(tmpDir, "p")], {
    maxBuffer: 64 * 1024 * 1024,
  });
  const files = (await readdir(tmpDir)).filter((f) => f.endsWith(".png")).sort();
  return files.map((f) => path.join(tmpDir, f));
}

// Pure-Node fallback: pdfjs-dist renders each page onto an @napi-rs/canvas.
async function rasteriseWithPdfjs(pdfPath, tmpDir) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createCanvas } = await import("@napi-rs/canvas");
  const standardFontDataUrl = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts/");
  const data = new Uint8Array(await readFile(pdfPath));
  const doc = await getDocument({ data, standardFontDataUrl, disableWorker: true }).promise;
  const scale = DPI / 72;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const file = path.join(tmpDir, `p-${pad3(i)}.png`);
    await writeFile(file, canvas.toBuffer("image/png"));
    out.push(file);
    page.cleanup();
  }
  await doc.destroy();
  return out;
}

async function buildBook(book, usePoppler) {
  const src = path.join(INCOMING, book.file);
  const outDir = path.join(OUT_ROOT, book.slug);
  const manifestPath = path.join(outDir, "manifest.json");

  if (!FORCE && (await exists(manifestPath))) {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    console.log(`  ${book.slug}: already built (${manifest.pageCount} pages), skipping. Use --force to rebuild.`);
    return manifest;
  }

  console.log(`  ${book.slug}: rasterising ${book.file} ...`);
  const tmpDir = await mkdtemp(path.join(tmpdir(), `book-${book.slug}-`));
  let manifest;
  try {
    const pngs = usePoppler
      ? await rasteriseWithPoppler(src, tmpDir)
      : await rasteriseWithPdfjs(src, tmpDir);
    if (pngs.length === 0) throw new Error(`no pages rendered from ${book.file}`);

    await rm(outDir, { recursive: true, force: true });
    await mkdir(path.join(outDir, "thumbs"), { recursive: true });

    let aspect = null;
    for (let i = 0; i < pngs.length; i++) {
      const n = pad3(i + 1);
      const img = sharp(pngs[i]);
      if (i === 0) {
        const meta = await img.metadata();
        const w = Math.min(meta.width, SCREEN_WIDTH);
        const h = Math.round((meta.height / meta.width) * w);
        aspect = [w, h];
      }
      await img
        .clone()
        .resize({ width: SCREEN_WIDTH, withoutEnlargement: true })
        .webp({ quality: SCREEN_QUALITY })
        .toFile(path.join(outDir, `p${n}.webp`));
      await img
        .clone()
        .resize({ width: THUMB_WIDTH })
        .webp({ quality: THUMB_QUALITY })
        .toFile(path.join(outDir, "thumbs", `p${n}.webp`));
    }

    await copyFile(src, path.join(outDir, `${book.slug}.pdf`));

    const textSrc = path.join(TEXT_DIR, `${book.slug}.txt`);
    if (await exists(textSrc)) {
      await copyFile(textSrc, path.join(outDir, "text.txt"));
      console.log(`  ${book.slug}: OCR text copied.`);
    }

    manifest = {
      slug: book.slug,
      title: book.title,
      author: book.author,
      section: book.section,
      status: book.status,
      blurb: book.blurb,
      pageCount: pngs.length,
      aspect,
      hasDownload: true,
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`  ${book.slug}: ${pngs.length} pages -> public/books/${book.slug}/`);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
  return manifest;
}

async function main() {
  const config = JSON.parse(await readFile(CONFIG, "utf8"));
  const usePoppler = await hasPdftoppm();
  if (usePoppler) {
    console.log("Rasteriser: poppler pdftoppm");
  } else {
    console.log("Rasteriser: pdfjs-dist + @napi-rs/canvas (pure Node fallback)");
    console.log("  For faster builds install poppler: macOS `brew install poppler`, Debian/Ubuntu `apt-get install poppler-utils`.");
  }

  const index = [];
  for (const book of config) {
    if (book.status === "restricted") {
      console.log(`  ${book.slug}: restricted, listed only. No pages or PDF generated.`);
      index.push({ slug: book.slug, title: book.title, section: book.section, status: book.status, pageCount: 0, blurb: book.blurb });
      continue;
    }
    const src = path.join(INCOMING, book.file);
    if (!(await exists(src))) {
      console.log(`  ${book.slug}: source ${book.file} not found in scripts/incoming/, skipping.`);
      const oldManifest = path.join(OUT_ROOT, book.slug, "manifest.json");
      if (await exists(oldManifest)) {
        const m = JSON.parse(await readFile(oldManifest, "utf8"));
        index.push({ slug: m.slug, title: m.title, section: m.section, status: m.status, pageCount: m.pageCount, blurb: m.blurb });
      }
      continue;
    }
    const m = await buildBook(book, usePoppler);
    index.push({ slug: m.slug, title: m.title, section: m.section, status: m.status, pageCount: m.pageCount, blurb: m.blurb });
  }

  await mkdir(OUT_ROOT, { recursive: true });
  await writeFile(path.join(OUT_ROOT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`Wrote public/books/index.json (${index.length} books).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
