import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { BLOCK_SELECTOR, SKIP_SELECTOR, pageText } from "../lib/page-text.mjs";
import { normaliseForSpeech } from "../lib/speech.mjs";

/* Fixtures are the server-rendered <main> of the real pages, captured with
   scripts/capture-reader-fixtures.mjs. */
async function fixture(name) {
  const html = await readFile(new URL(`./fixtures/page-reader/${name}.html`, import.meta.url), "utf8");
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
}

function main(doc) {
  return doc.querySelector("main");
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim();
}

/* Every heading the reader is allowed to reach (not inside a skipped region). */
function readableHeadings(doc) {
  return [...main(doc).querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .filter((heading) => !heading.closest(SKIP_SELECTOR))
    .map((heading) => clean(heading.textContent));
}

function assertEachHeadingOnce(doc, chunks) {
  const headings = readableHeadings(doc);
  assert.ok(headings.length > 0);
  for (const heading of headings) {
    const hits = chunks.filter((chunk) => chunk === heading).length;
    assert.equal(hits, 1, `"${heading}" is read ${hits} times`);
    const inside = chunks.filter((chunk) => chunk !== heading && chunk.includes(heading) && chunk.startsWith(heading));
    assert.equal(inside.length, 0, `"${heading}" is also read as part of: ${inside.join(" | ")}`);
  }
}

test("/books reads each title and heading exactly once", async () => {
  const doc = await fixture("books");
  const chunks = pageText(main(doc));
  assertEachHeadingOnce(doc, chunks);
  for (const title of ["Funny Fah Learns When to Stop", "Imaginative Little Mee", "Hi Doh", "Little Ray", "Melting Pot", "Breakout", "Riddled with Language"]) {
    assert.equal(chunks.filter((chunk) => chunk.includes(title)).length, 1, title);
  }
  /* Allen's paragraph beside the Chinese Chimes heading is read, once. */
  assert.equal(chunks.filter((chunk) => chunk.startsWith("The characters in these stories are named after the musical scale")).length, 1);
  /* Closed "more" menus, buttons and aria-hidden numerals are not read. */
  assert.ok(!chunks.some((chunk) => /Download PDF|Original YouTube narration|More options|Listen to audiobook|⋯/.test(chunk)));
  assert.ok(!chunks.some((chunk) => /^\d+$/.test(chunk)));
});

test("/read/<slug> reads the title once and skips the book controls", async () => {
  for (const name of ["read-little-hi-doh", "read-melting-pot"]) {
    const doc = await fixture(name);
    const chunks = pageText(main(doc));
    assertEachHeadingOnce(doc, chunks);
    assert.ok(!chunks.some((chunk) => /Page \d+ \/ \d+|Page number|Leave a comment|Listen to audiobook/.test(chunk)), name);
  }
  const story = pageText(main(await fixture("read-little-hi-doh")));
  assert.equal(story[0], "Hi-Doh");
});

test("/anns-art reads its headings once and leaves the painting grid to its own controls", async () => {
  const doc = await fixture("anns-art");
  const chunks = pageText(main(doc));
  assertEachHeadingOnce(doc, chunks);
  assert.equal(chunks[0], "Ann Gillon");
  /* The grid is marked data-reader-skip: no "View 1" buttons, no per-card text. */
  assert.ok(!chunks.some((chunk) => /View 1|Buy this painting|Blue Macaws/.test(chunk)));
  /* Its price line is spoken in words. */
  const priceLine = chunks.find((chunk) => chunk.startsWith("Originals"));
  assert.equal(normaliseForSpeech(priceLine), "Originals, 100 to 250 Australian dollars, free delivery in Australia");
});

test("only leaf blocks are read, and hidden or collapsed content is skipped", () => {
  const { document } = new JSDOM(`<main>
    <ol><li><div><h3>Little Ray</h3><p>A story.</p></div><button>Play</button></li></ol>
    <p>Visible <span aria-hidden="true">icon</span>text <button>Press</button></p>
    <p hidden>Hidden paragraph</p>
    <details><summary>More</summary><p>Collapsed</p></details>
    <details open><summary>Open</summary><p>Expanded</p></details>
    <div data-reader-skip><p>Skipped</p></div>
    <p>Same</p><p>Same</p>
    <ul><li>Plain item</li></ul>
  </main>`).window;
  assert.deepEqual(pageText(document.querySelector("main")), [
    "Little Ray",
    "A story.",
    "Visible text",
    "Expanded",
    "Same",
    "Plain item",
  ]);
  assert.equal(BLOCK_SELECTOR, "h1,h2,h3,h4,h5,h6,p,li");
});

test("words in children that CSS shows on their own line do not run together", () => {
  const { document } = new JSDOM(`<style>.what{display:block}</style><main>
    <ul class="offer">
      <li><span class="what">Restaurant guitarist</span><span class="how">Allen plays solo jazz guitar.</span></li>
      <li><span class="what">Functions and events:</span><span class="how">Allen plays weddings.</span></li>
      <li>Line one<br>Line two</li>
    </ul>
    <p>Inline <em>words</em> <a href="/">stay</a> joined.</p>
  </main>`).window;
  assert.deepEqual(pageText(document.querySelector("main")), [
    "Restaurant guitarist. Allen plays solo jazz guitar.",
    "Functions and events: Allen plays weddings.",
    "Line one. Line two",
    "Inline words stay joined.",
  ]);
});

/* W1b: Allen's exact paragraph beside the Chinese Chimes heading. */
const CHIMES_PARAGRAPH =
  "The characters in these stories are named after the musical scale: Doh, Ray, Mee, Fah, Soh, Lah, Tee, Doh, with an added Hi-Doh and Low-Doh. Here are four of Allen's stories for young readers. Each story contains an important moral, and the name of the Little Chime sometimes highlights it. A teacher or parent can read the eBook online, or watch and listen to the audiobook.";

test("/books renders Allen's Chinese Chimes paragraph exactly, once", async () => {
  const doc = await fixture("books");
  const text = clean(main(doc).textContent);
  assert.equal(text.split(CHIMES_PARAGRAPH).length - 1, 1);
  const heading = doc.getElementById("stories-title");
  assert.equal(clean(heading.textContent), "Chinese Chimes stories");
  const paragraph = [...heading.parentElement.querySelectorAll("p")].find((p) => clean(p.textContent) === CHIMES_PARAGRAPH);
  assert.ok(paragraph, "the paragraph sits beside the Chinese Chimes heading");
  /* The page source too, so a change to the page fails here even before the
     fixture is recaptured with scripts/capture-reader-fixtures.mjs. */
  const source = await readFile(new URL("../app/(other)/books/page.jsx", import.meta.url), "utf8");
  assert.equal(source.split(CHIMES_PARAGRAPH).length - 1, 1);
});

test("no main element gives nothing to read", () => {
  assert.deepEqual(pageText(null), []);
});
