// Paid content must never be publicly reachable (plan W4, DECISIONS: plays).
// This checks the files on disk, so run it after a build:
//   npm run build:books -- --force && npm run build:vinext && npm test
// Under public/ and dist/client (when a build exists) there must be:
// - no play PDF,
// - no play page image beyond that play's previewPages,
// - no full play recording (only the short previews),
// - no full play text (content/book-text holds only the preview pages).

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { normaliseBook, keepFile, DEFAULT_PREVIEW_PAGES } from "../lib/books.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const config = JSON.parse(readFileSync(join(root, "content", "books.config.json"), "utf8"));
const plays = config.filter((b) => b.section === "plays");
const PUBLIC_ROOTS = [join(root, "public"), join(root, "dist", "client")].filter((dir) => existsSync(dir));

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const publicFiles = PUBLIC_ROOTS.flatMap((dir) => walk(dir).map((file) => ({ dir, file, rel: relative(dir, file).replace(/\\/g, "/") })));
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

test("there are five plays, each with a preview length", () => {
  assert.equal(plays.length, 5);
  for (const play of plays) {
    const m = normaliseBook(play, { pageCount: 40 });
    assert.equal(m.download, "paid", `${play.slug} must not be a public download`);
    assert.equal(m.pdf, null);
    assert.equal(m.previewPages, play.previewPages ?? DEFAULT_PREVIEW_PAGES);
    assert.equal(m.textRoute, null, "plays have no full-text route");
  }
});

test("no play PDF under public/ or dist/client", () => {
  const playPdfs = new Set(plays.flatMap((p) => [p.file, `${p.slug}.pdf`]));
  const privateSizes = new Map(
    walk(join(root, "private", "plays")).filter((f) => f.endsWith(".pdf")).map((f) => [statSync(f).size, f])
  );
  for (const { rel, file } of publicFiles) {
    if (!/\.pdf$/i.test(rel)) continue;
    assert.ok(!playPdfs.has(basename(rel)), `play PDF published: ${rel}`);
    for (const play of plays) assert.ok(!rel.startsWith(`books/${play.slug}/`), `PDF in a play folder: ${rel}`);
    const twin = privateSizes.get(statSync(file).size);
    if (twin) assert.notEqual(sha(file), sha(twin), `${rel} is a copy of ${relative(root, twin)}`);
  }
});

test("no play page image beyond previewPages, and nothing else in a play folder", () => {
  for (const play of plays) {
    const manifestPath = join(root, "public", "books", play.slug, "manifest.json");
    assert.ok(existsSync(manifestPath), `missing ${relative(root, manifestPath)}`);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const limit = play.previewPages ?? DEFAULT_PREVIEW_PAGES;
    assert.ok(manifest.shownPages <= limit, `${play.slug}: shownPages ${manifest.shownPages} > previewPages ${limit}`);
    for (const dir of PUBLIC_ROOTS) {
      const folder = join(dir, "books", play.slug);
      for (const file of walk(folder)) {
        const rel = relative(folder, file).replace(/\\/g, "/");
        const m = /^p(\d{3})\.webp$/.exec(rel);
        if (m) assert.ok(Number(m[1]) <= limit, `${relative(root, file)} is beyond the ${limit}-page preview`);
        assert.ok(keepFile(manifest, rel), `${relative(root, file)} must not be public`);
      }
    }
  }
});

test("no full play recording under public/ or dist/client", () => {
  const full = walk(join(root, "private", "audio")).filter((f) => f.endsWith(".mp3"));
  assert.ok(full.length >= 2, "the full recordings live in private/audio/");
  const bySize = new Map(full.map((f) => [statSync(f).size, sha(f)]));
  for (const { rel, file } of publicFiles) {
    if (!/\.(mp3|m4a|ogg|wav)$/i.test(rel)) continue;
    assert.ok(!rel.includes("school-play-audiobooks"), `full play recording path published: ${rel}`);
    const size = statSync(file).size;
    if (bySize.has(size)) assert.notEqual(sha(file), bySize.get(size), `${rel} is a full play recording`);
  }
  for (const play of plays.filter((p) => p.audio)) {
    assert.equal(play.audio.kind, "preview");
    assert.ok(play.audio.from.startsWith("private/"), `${play.slug}: the full recording must stay in private/`);
    for (const dir of PUBLIC_ROOTS) {
      const clip = join(dir, play.audio.src.replace(/^\//, ""));
      if (dir.endsWith("public")) assert.ok(existsSync(clip), `missing preview clip ${relative(root, clip)}`);
      /* About a minute at 64 kb/s is under 600 KB; a full recording is many MB. */
      if (existsSync(clip)) assert.ok(statSync(clip).size < 1024 * 1024, `${relative(root, clip)} is too long for a preview`);
    }
  }
});

test("play text: only the preview pages, and no old text.txt copies", () => {
  for (const play of plays) {
    const limit = play.previewPages ?? DEFAULT_PREVIEW_PAGES;
    const textFile = join(root, "content", "book-text", `${play.slug}.pages.json`);
    if (existsSync(textFile)) {
      const { pages } = JSON.parse(readFileSync(textFile, "utf8"));
      assert.ok(pages.length <= limit, `${play.slug}: ${pages.length} pages of text, preview is ${limit}`);
    }
    assert.ok(!existsSync(join(root, "content", "book-text", `${play.slug}.txt`)), `${play.slug}: full text in content/`);
  }
  for (const { rel } of publicFiles) {
    assert.ok(!/(^|\/)text\.txt$/.test(rel), `${rel}: full book text must not be published`);
  }
});
