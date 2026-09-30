// The text alternative for the reader: OCR clean-up (lib/book-text.mjs) and
// the extracted content/book-text/<slug>.pages.json files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanLine, cleanPages, dropLeaderDebris, isNoise, paragraphs, splitRunOns, stripFooters } from "../lib/book-text.mjs";

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

test("textbook footers, dot leaders, bars and scraps are cleaned", () => {
  assert.equal(
    stripFooters("the end of the story. A. Gillon Published by Modern Teaching Alds Pty Limited May be reproduced In schools for non commercial use"),
    "the end of the story."
  );
  assert.equal(stripFooters("in schools for non commercial use"), "");
  assert.equal(stripFooters("Poge 9 RIDDLED WITH LANGUAGE"), "");
  assert.equal(dropLeaderDebris(cleanLine("one lady's hat.......cceeeeeeeseeerseeetes the five ladies hats.")), "one lady's hat... the five ladies hats.");
  assert.equal(cleanLine("What fruit am |?"), "What fruit am I?");
  assert.equal(cleanLine("|am a mammal, but I can fly."), "I am a mammal, but I can fly.");
  assert.ok(isNoise("Page"), "a lone Page");
  assert.ok(isNoise("iii)"), "a bare list marker");
  assert.ok(isNoise("Ss"), "a scrap");
  assert.ok(isNoise("Notice how Co t m he ple R t I e DDLE th R is"), "a rotated label read across a line");
});

test("run-together words are split into the book's own words, or dropped", () => {
  const [page] = splitRunOns([
    ["the dairy farmer was happy", "the dairy farmer was happy and rich", "Thedairyfarmerwashappy", "AidsLLPtyLimitedschoolsLack.", "extraordinarily"],
  ]);
  assert.equal(page[2], "The dairy farmer was happy");
  assert.equal(page.includes("AidsLLPtyLimitedschoolsLack."), false, "unsplittable debris with a case change is dropped");
  assert.equal(page[page.length - 1], "extraordinarily", "a long real word used once is kept");
});

// The text alternative must read as text: no garbled OCR in what is published.
const bookTexts = () =>
  readdirSync(join(root, "content", "book-text"))
    .filter((f) => f.endsWith(".pages.json"))
    .map((f) => JSON.parse(readFileSync(join(root, "content", "book-text", f), "utf8")));

test("no published page text has run-together words, lone page labels, footers or scraps", () => {
  for (const { slug, pages, source } of bookTexts()) {
    const byHand = source === "corrected by hand"; /* a shout like "OK!" is real */
    pages.forEach((text, i) => {
      for (const para of paragraphs(text)) {
        const where = `${slug} page ${i + 1}: «${para.slice(0, 80)}»`;
        assert.doesNotMatch(para, /[A-Za-z]{18,}/, `run-together word in ${where}`);
        assert.doesNotMatch(para, /^\W*p[aoe]ge\W*\w{0,3}\W*$/i, `lone page label in ${where}`);
        assert.doesNotMatch(para, /reproduced in schools|Modern Teaching Al?ds|non commerc/i, `running footer in ${where}`);
        assert.doesNotMatch(para, /\.{4,}/, `dot leader in ${where}`);
        if (!byHand) assert.ok((para.match(/[A-Za-z]/g) || []).length >= 3, `scrap of OCR in ${where}`);
      }
    });
  }
});

test("the four stories are corrected by hand against their page images", () => {
  const stories = ["funny-fah-learns-when-to-stop", "imaginative-little-mee", "little-hi-doh", "little-ray"];
  const texts = new Map(bookTexts().map((t) => [t.slug, t]));
  for (const slug of stories) {
    const t = texts.get(slug);
    assert.equal(t.source, "corrected by hand", `${slug} is not the hand-corrected text`);
    const fixes = JSON.parse(readFileSync(join(root, "content", "book-text", "corrections", `${slug}.json`), "utf8")).pages;
    assert.equal(Object.keys(fixes).length, t.pages.length, `${slug}: every page has a correction`);
  }
  assert.match(texts.get("little-ray").pages[4], /^"Ha! Ha! Missed me!"\n"OOPS!"\nWow!/, "speech bubbles first, in reading order");
});
