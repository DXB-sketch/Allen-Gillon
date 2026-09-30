// The text alternative for the reader: OCR clean-up (lib/book-text.mjs) and
// the extracted content/book-text/<slug>.pages.json files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanLine, cleanPages, isNoise, paragraphs } from "../lib/book-text.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("cleanLine fixes OCR bars, bullets, spacing and dashes", () => {
  assert.equal(cleanLine("SON: Yes, | made only"), "SON: Yes, I made only");
  assert.equal(cleanLine("¢ What sorts of accidents"), "What sorts of accidents");
  assert.equal(cleanLine("HEALTH — Write down"), "HEALTH - Write down");
  assert.equal(cleanLine("blow，the  colourful ."), "blow, the colourful.");
  assert.equal(cleanLine("when you ask? 8"), "when you ask?");
});

test("isNoise drops word-search grids, scattered letters and page numbers", () => {
  assert.ok(isNoise("BIJIAIWIS|S/S/E|IN/T]IIW{T/BIJE"));
  assert.ok(isNoise("M U R M W R O M S D I A"));
  assert.ok(isNoise("Page6"));
  assert.ok(isNoise("17"));
  assert.ok(!isNoise("Would you like to tell the class about an accident?"));
  assert.ok(!isNoise("NO-O-O-O!"), "a shout in a speech bubble is kept");
});

test("cleanPages removes running footers and joins broken lines", () => {
  const footer = "May be reproduced in schools for non commercial use";
  const pages = cleanPages([
    ["The Riddler's Story", "Being a farmer was", "hard work.", footer],
    ["Unit 2", footer],
    ["Unit 3", footer],
    ["Unit 4", footer],
  ], { source: "ocr" });
  assert.equal(pages[0], "The Riddler's Story\nBeing a farmer was hard work.");
  assert.ok(pages.every((p) => !p.includes("reproduced")));
  assert.deepEqual(paragraphs(pages[0]), ["The Riddler's Story", "Being a farmer was hard work."]);
});

test("short lines of one-off words (OCR debris) are dropped from printed books", () => {
  const [page] = cleanPages([["Ziel tae kes.", "The words of the story are here.", "The story words."]]);
  assert.equal(page, "The words of the story are here.\nThe story words.");
});

test("every readable title has one text entry per public page", () => {
  const index = JSON.parse(readFileSync(join(root, "public", "books", "index.json"), "utf8"));
  for (const book of index.filter((b) => b.shownPages > 0)) {
    const file = join(root, "content", "book-text", `${book.slug}.pages.json`);
    assert.ok(existsSync(file), `missing content/book-text/${book.slug}.pages.json (run node scripts/extract-text.mjs)`);
    const { pages } = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(pages.length, book.shownPages, `${book.slug}: ${pages.length} text pages for ${book.shownPages} page images`);
    const words = pages.join(" ").split(/\s+/).filter(Boolean).length;
    assert.ok(words > 50, `${book.slug}: only ${words} words extracted`);
  }
});
