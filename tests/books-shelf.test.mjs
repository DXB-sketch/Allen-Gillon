import assert from "node:assert/strict";
import test from "node:test";
import { readFile, access } from "node:fs/promises";
import { buildShelves, priceLabel, coverFor, textbookPdf, STORY_ORDER, PLAY_ORDER, TEXTBOOK_ORDER } from "../app/(other)/books/shelf-data.mjs";

const root = new URL("../", import.meta.url);
const index = JSON.parse(await readFile(new URL("public/books/index.json", root), "utf8"));
const page = await readFile(new URL("app/(other)/books/page.jsx", root), "utf8");

async function exists(publicPath) {
  try {
    await access(new URL(`public${publicPath}`, root));
    return true;
  } catch {
    return false;
  }
}

test("three shelves in order, from the real index", () => {
  const { stories, plays, textbooks } = buildShelves(index);
  assert.deepEqual(stories.map((b) => b.slug), STORY_ORDER);
  assert.deepEqual(plays.map((b) => b.slug), PLAY_ORDER);
  assert.deepEqual(textbooks.map((b) => b.slug), TEXTBOOK_ORDER);
});

test("every book's cover exists under public/", async () => {
  const { stories, plays, textbooks } = buildShelves(index);
  for (const book of [...stories, ...plays, ...textbooks]) {
    assert.ok(await exists(book.cover), `${book.slug}: ${book.cover}`);
    assert.equal(book.aspect.length, 2);
  }
});

test("covers: p001.webp once the book is built, the scan until then", () => {
  assert.equal(coverFor({ slug: "little-ray", pageCount: 19 }), "/books/little-ray/p001.webp");
  assert.equal(coverFor({ slug: "riddled-with-language", pageCount: 0 }), "/images/books/riddled-with-language.webp");
  assert.equal(coverFor({ slug: "riddled-with-language", pageCount: 88 }), "/books/riddled-with-language/p001.webp");
  assert.equal(coverFor({ slug: "x", cover: "/custom.webp" }), "/custom.webp");
});

test("plays show the A$1 price; the new manifest's price and page fields win", () => {
  assert.equal(priceLabel(100), "A$1");
  assert.equal(priceLabel(250), "A$2.50");
  const { plays } = buildShelves(index);
  for (const play of plays) {
    assert.equal(play.price, 100);
    assert.equal(play.previewPages, 6);
    assert.ok(play.fullPages > 0);
  }
  const [play] = buildShelves([{ slug: "breakout", section: "plays", pageCount: 6, fullPageCount: 26, previewPages: 4, price: 100 }]).plays;
  assert.equal(play.fullPages, 26);
  assert.equal(play.previewPages, 4);
});

test("textbooks: Download PDF only when the manifest says the PDF is public, old and new shapes", () => {
  const old = { slug: "riddled-with-language", section: "teaching", status: "restricted", pageCount: 0 };
  assert.equal(textbookPdf(old), "");
  assert.equal(textbookPdf({ slug: "riddled-with-language" }), "");
  assert.equal(textbookPdf({ ...old, status: "free", hasDownload: true }), "/books/riddled-with-language/riddled-with-language.pdf");
  assert.equal(textbookPdf({ ...old, status: "free", hasDownload: false }), "");
  assert.equal(textbookPdf({ ...old, download: "public" }), "/books/riddled-with-language/riddled-with-language.pdf");
  assert.equal(textbookPdf({ ...old, download: "public", pdf: "rwl.pdf" }), "/books/riddled-with-language/rwl.pdf");
  assert.equal(textbookPdf({ ...old, download: "public", pdf: "/books/riddled-with-language/x.pdf" }), "/books/riddled-with-language/x.pdf");
  assert.equal(textbookPdf({ ...old, download: "none" }), "");
  assert.equal(textbookPdf({ ...old, download: "paid" }), "");
});

test("manifest fields merge over the index entry; junk entries are ignored", () => {
  const shelves = buildShelves([null, { title: "no slug" }, { slug: "little-ray", section: "childrens", pageCount: 19, blurb: "A Chinese Chimes story about anger." }], { "little-ray": { aspect: [1000, 1000] } });
  assert.equal(shelves.stories.length, 1);
  assert.deepEqual(shelves.stories[0].aspect, [1000, 1000]);
  // Allen's blurb is shown as written.
  assert.equal(shelves.stories[0].blurb, "A Chinese Chimes story about anger.");
});
test("the page: no numerals, menus, restricted branch or section-heading", () => {
  for (const banned of ["section-heading", "Contact Allen", "restricted", "more-menu", "⋯", "audiobook-number", "pno"]) {
    assert.ok(!page.includes(banned), banned);
  }
  for (const action of ["Read and listen", "Read a preview", "Read online"]) {
    assert.ok(page.includes(action), action);
  }
  /* One action per book: text-only and the PDF download are in the reader. */
  for (const second of ["Text only", "Download PDF", "/text`"]) {
    assert.ok(!page.includes(second), second);
  }
  /* Every Buy goes through PurchaseLink with a link from the storefront. */
  assert.match(page, /const buyHref = stripePaymentLink\(`play-\$\{book\.slug\}`\);/);
  assert.match(page, /<PurchaseLink href=\{buyHref\}>/);
  /* The price is on each play, and not repeated in the lede or the Buy label. */
  assert.ok(!/Buy the script, /.test(page));
});
