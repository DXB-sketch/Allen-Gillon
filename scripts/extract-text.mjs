// extract-text.mjs
// Writes content/book-text/<slug>.pages.json: the words on each page, used by
// the reader's "Show the words on this page" toggle and by /read/[slug]/text.
//
// - PDFs with a text layer (textbooks, plays) are read with pdfjs-dist. Text
//   items are rebuilt into lines by position, so words keep their spaces.
// - Books without a text layer (the Chinese Chimes stories are scans) are
//   OCR'd from their page images by scripts/ocr-pages.py (RapidOCR). The
//   story transcript in content/story-transcripts/ is passed as a vocabulary
//   so run-on OCR words can be split.
// - OCR noise (word-search grids, scattered letters, running footers, page
//   numbers) is removed by lib/book-text.mjs.
// - Plays: only pages 1 to previewPages are written. The rest of a script is
//   paid content and never goes into content/ or public/.
//
// Usage: node scripts/extract-text.mjs [slug ...]
//   Run after npm run build:books (the OCR step reads the page images).
//   PYTHON overrides the Python used for OCR (default: python).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { normaliseBook, pageFile } from "../lib/books.mjs";
import { cleanPages } from "../lib/book-text.mjs";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const OUT = path.join(ROOT, "content", "book-text");
const exists = (p) => access(p).then(() => true, () => false);

const SOURCE_DIRS = ["scripts/incoming/processed", "scripts/incoming", "private/plays", "private/books"].map((d) => path.join(ROOT, d));

// Stories: the transcript file name differs from the slug for Hi-Doh.
const TRANSCRIPTS = {
  "little-hi-doh": "hi-doh.txt",
};

async function findSource(book) {
  for (const dir of SOURCE_DIRS) {
    for (const name of [book.file, `${book.slug}.pdf`]) {
      if (await exists(path.join(dir, name))) return path.join(dir, name);
    }
  }
  const published = path.join(ROOT, "public", "books", book.slug, `${book.slug}.pdf`);
  return (await exists(published)) ? published : null;
}

// Rebuilds lines from pdfjs text items.
// - Items on the same baseline (within half the font size) form a row.
// - A row splits into segments at gaps wider than two font sizes: those are
//   side-by-side columns or boxes, not one line.
// - A run of split rows is a multi-column band. Each column of the band is
//   read top to bottom before the next, so two-column worksheets read in order.
// - Inside a segment, a gap wider than a fifth of the font size is a space.
function linesFromItems(items, pageWidth) {
  const parts = items
    .filter((i) => i.str && i.str.trim())
    .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, size: Math.abs(i.transform[3]) || 10 }));
  const rows = [];
  for (const p of parts.sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.find((r) => Math.abs(r.y - p.y) < 0.5 * Math.max(r.size, p.size));
    if (row) row.parts.push(p);
    else rows.push({ y: p.y, size: p.size, parts: [p] });
  }
  const segmentsOf = (row) => {
    const segs = [];
    let cur = null;
    for (const p of row.parts.sort((a, b) => a.x - b.x)) {
      if (cur && p.x - cur.end > 2 * Math.max(p.size, 6)) cur = null;
      if (!cur) {
        cur = { x: p.x, end: p.x + p.w, text: p.str };
        segs.push(cur);
        continue;
      }
      if (p.x - cur.end > 0.2 * p.size && !cur.text.endsWith(" ")) cur.text += " ";
      cur.text += p.str;
      cur.end = Math.max(cur.end, p.x + p.w);
    }
    return segs;
  };
  const out = [];
  let band = [];
  const flush = () => {
    if (!band.length) return;
    const cols = [];
    for (const seg of band.flat().sort((a, b) => a.x - b.x)) {
      const col = cols.find((c) => Math.abs(c.x - seg.x) < 0.12 * pageWidth);
      if (col) col.segs.push(seg);
      else cols.push({ x: seg.x, segs: [seg] });
    }
    for (const col of cols.sort((a, b) => a.x - b.x)) {
      for (const seg of col.segs.sort((a, b) => a.order - b.order)) out.push(seg.text);
    }
    band = [];
  };
  let order = 0;
  for (const row of rows.sort((a, b) => b.y - a.y)) {
    const segs = segmentsOf(row);
    segs.forEach((s) => (s.order = order++));
    if (segs.length === 1) {
      flush();
      out.push(segs[0].text);
    } else {
      band.push(segs);
    }
  }
  flush();
  return out;
}

async function pdfLines(pdfPath, lastPage) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await getDocument({ data: new Uint8Array(await readFile(pdfPath)), disableWorker: true, verbosity: 0 }).promise;
  const pages = [];
  for (let i = 1; i <= Math.min(lastPage, doc.numPages); i++) {
    const page = await doc.getPage(i);
    pages.push(linesFromItems((await page.getTextContent()).items, page.getViewport({ scale: 1 }).width));
    page.cleanup();
  }
  await doc.destroy();
  return pages;
}

async function ocrLines(book, count) {
  const images = Array.from({ length: count }, (_, i) => path.join(ROOT, "public", "books", book.slug, pageFile(i + 1)));
  const args = [path.join(ROOT, "scripts", "ocr-pages.py")];
  const transcript = path.join(ROOT, "content", "story-transcripts", TRANSCRIPTS[book.slug] || `${book.slug}.txt`);
  if (await exists(transcript)) args.push("--vocab", transcript);
  const { stdout } = await execFileP(process.env.PYTHON || "python", [...args, ...images], { maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(stdout).map((page) => page.split("\n"));
}

async function main() {
  const only = process.argv.slice(2);
  const config = JSON.parse(await readFile(path.join(ROOT, "content", "books.config.json"), "utf8"));
  await mkdir(OUT, { recursive: true });

  for (const raw of config) {
    if (only.length && !only.includes(raw.slug)) continue;
    const manifestPath = path.join(ROOT, "public", "books", raw.slug, "manifest.json");
    if (!(await exists(manifestPath))) {
      console.log(`${raw.slug}: not built yet, skipped. Run npm run build:books first.`);
      continue;
    }
    const built = JSON.parse(await readFile(manifestPath, "utf8"));
    const book = normaliseBook(raw, { pageCount: built.pageCount, aspect: built.aspect });
    const count = book.shownPages;

    let source = "pdf-text";
    let lines = [];
    const src = await findSource(raw);
    if (src) lines = await pdfLines(src, count);
    const chars = lines.flat().join("").replace(/\s/g, "").length;
    if (!src || chars < 20 * count) {
      source = "ocr";
      console.log(`${raw.slug}: no usable text layer, running OCR on ${count} page images ...`);
      lines = await ocrLines(raw, count);
    }

    const pages = cleanPages(lines, { source });
    while (pages.length < count) pages.push("");
    const out = { slug: raw.slug, source, pages: pages.slice(0, count) };
    await writeFile(path.join(OUT, `${raw.slug}.pages.json`), JSON.stringify(out, null, 1) + "\n");
    const words = pages.join(" ").split(/\s+/).filter(Boolean).length;
    console.log(`${raw.slug}: ${count} pages, ${words} words (${source}).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
