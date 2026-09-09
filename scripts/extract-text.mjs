// extract-text.mjs
// One-off helper: pulls the embedded OCR text out of each free book's searchable
// PDF in scripts/incoming/ and writes content/book-text/<slug>.txt, which
// build-books.mjs then copies into public/books/<slug>/text.txt.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const INCOMING = path.join(ROOT, "scripts", "incoming");
const OUT = path.join(ROOT, "content", "book-text");
const exists = (p) => access(p).then(() => true, () => false);

const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
const standardFontDataUrl = path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts/");

const config = JSON.parse(await readFile(path.join(ROOT, "content", "books.config.json"), "utf8"));
await mkdir(OUT, { recursive: true });

for (const book of config) {
  if (book.status !== "free") continue;
  const src = path.join(INCOMING, book.file);
  if (!(await exists(src))) {
    console.log(`${book.slug}: source missing, skipped.`);
    continue;
  }
  const data = new Uint8Array(await readFile(src));
  const doc = await getDocument({ data, standardFontDataUrl, disableWorker: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let line = "";
    const lines = [];
    let lastY = null;
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
        if (line.trim()) lines.push(line.trim());
        line = "";
      }
      line += item.str + (item.hasEOL ? "" : " ");
      lastY = item.transform[5];
    }
    if (line.trim()) lines.push(line.trim());
    pages.push(lines.join("\n"));
    page.cleanup();
  }
  await doc.destroy();
  const text = pages.join("\n\n").replace(/[ \t]+/g, " ").trim();
  await writeFile(path.join(OUT, `${book.slug}.txt`), text + "\n");
  console.log(`${book.slug}: ${text.length} chars from ${pages.length} pages.`);
}
