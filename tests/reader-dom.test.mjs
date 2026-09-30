// The book reader: the auto-turn rules (lib/reader-follow.mjs), the page
// arithmetic (lib/reader-pages.mjs), and the rendered controls of
// components/reader/BookReader.jsx in jsdom.
//
// The DOM part bundles BookReader.jsx with esbuild (installed with wrangler
// and vinext) and swaps the shared player for tests/fixtures/reader/
// mock-player.mjs, so the test can say "this book is playing at 50 s" and
// watch what the reader does. react-pageflip is replaced by a stub, so the
// reader runs as its plain image reader, which follows the same rules.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import {
  followAvailable,
  followPrompt,
  followReducer,
  initialFollow,
  isFollowing,
  listenAction,
  pageForTime,
  turnTarget,
} from "../lib/reader-follow.mjs";
import { counterText, fitBook, numbering, openIndex, pageHeading, visiblePages } from "../lib/reader-pages.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const nodeRequire = createRequire(import.meta.url);
const CUES = [0, 10, 20, 30, 40, 50];

/* ---------------------------------------------------------------------------
   Auto-turn state machine */

describe("follow the narration: pure rules", () => {
  const on = initialFollow({ available: true, isThisBook: false });

  test("follow is available only for signed-off cues", () => {
    assert.equal(followAvailable({ cues: CUES, verified: true }), true);
    assert.equal(followAvailable({ cues: CUES, verified: false }), false);
    assert.equal(followAvailable({ cues: CUES, verified: "true" }), false);
    assert.equal(followAvailable({ cues: null, verified: true }), false);
    assert.equal(followAvailable({ cues: [], verified: true }), false);
  });

  test("pageForTime picks the last cue at or before the time", () => {
    assert.equal(pageForTime(CUES, 0), 0);
    assert.equal(pageForTime(CUES, 9.9), 0);
    assert.equal(pageForTime(CUES, 10), 1);
    assert.equal(pageForTime(CUES, 9.97), 1, "within the 0.05 s rounding slack");
    assert.equal(pageForTime(CUES, 999), 5);
    assert.equal(pageForTime(CUES, NaN), 0);
  });

  test("never turns without audio: another source or nothing loaded", () => {
    for (const status of ["idle", "playing", "paused"]) {
      assert.equal(turnTarget(on, { isThisBook: false, status, time: 35, cues: CUES, visible: [0] }), null);
    }
  });

  test("never turns on pause, loading, ended or error", () => {
    for (const status of ["paused", "loading", "ended", "error", "idle"]) {
      assert.equal(turnTarget(on, { isThisBook: true, status, time: 35, cues: CUES, visible: [0] }), null, status);
    }
  });

  test("turns to the narrated page while this book plays", () => {
    assert.equal(turnTarget(on, { isThisBook: true, status: "playing", time: 35, cues: CUES, visible: [0] }), 3);
    assert.equal(turnTarget(on, { isThisBook: true, status: "playing", time: 35, cues: CUES, visible: [3, 4] }), null, "already showing");
  });

  test("never on mount: opening while this book plays starts suspended", () => {
    const mounted = initialFollow({ available: true, isThisBook: true });
    assert.equal(mounted.suspended, true);
    assert.equal(turnTarget(mounted, { isThisBook: true, status: "playing", time: 45, cues: CUES, visible: [0] }), null);
    assert.deepEqual(followPrompt(mounted, { isThisBook: true, status: "playing" }), { kind: "mount" });
    const resumed = followReducer(mounted, { type: "resume" });
    assert.equal(turnTarget(resumed, { isThisBook: true, status: "playing", time: 45, cues: CUES, visible: [0] }), 4);
  });

  test("a manual flip during playback suspends; resume and Listen follow again", () => {
    const flipped = followReducer(on, { type: "manualFlip", isThisBook: true, status: "playing" });
    assert.equal(flipped.suspended, true);
    assert.equal(isFollowing(flipped, { isThisBook: true, status: "playing" }), false);
    assert.equal(turnTarget(flipped, { isThisBook: true, status: "playing", time: 25, cues: CUES, visible: [4] }), null);
    assert.deepEqual(followPrompt(flipped, { isThisBook: true, status: "playing" }), { kind: "flip" });
    assert.equal(followReducer(flipped, { type: "resume" }).suspended, false);
    assert.equal(followReducer(flipped, { type: "listen" }).suspended, false);
  });

  test("a flip while reading without this book's audio changes nothing", () => {
    assert.equal(followReducer(on, { type: "manualFlip", isThisBook: false, status: "playing" }), on);
    assert.equal(followReducer(on, { type: "manualFlip", isThisBook: true, status: "idle" }), on);
  });

  test("only when verified: unverified cues never turn a page", () => {
    const off = initialFollow({ available: false, isThisBook: false });
    assert.equal(turnTarget(off, { isThisBook: true, status: "playing", time: 35, cues: CUES, visible: [0] }), null);
    assert.equal(followPrompt(off, { isThisBook: true, status: "playing" }), null);
  });

  test("the toggle switches following off and on", () => {
    const off = followReducer(on, { type: "toggle", on: false });
    assert.equal(turnTarget(off, { isThisBook: true, status: "playing", time: 35, cues: CUES, visible: [0] }), null);
    const back = followReducer(off, { type: "toggle", on: true });
    assert.equal(turnTarget(back, { isThisBook: true, status: "playing", time: 35, cues: CUES, visible: [0] }), 3);
  });

  test("Listen seeks only this book, otherwise loads this book at the page's cue", () => {
    assert.deepEqual(listenAction({ isThisBook: true, page: 2, cues: CUES, available: true }), { type: "seek", time: 20 });
    assert.deepEqual(listenAction({ isThisBook: false, page: 2, cues: CUES, available: true }), { type: "load", time: 20 });
    assert.deepEqual(listenAction({ isThisBook: false, page: 2, cues: CUES, available: false }), { type: "load", time: 0 });
    assert.deepEqual(listenAction({ isThisBook: true, page: 2, cues: CUES, available: false }), { type: "toggle" });
  });
});

/* ---------------------------------------------------------------------------
   Page arithmetic */

describe("reader pages", () => {
  test("portrait pages make a spread on wide screens, one page on narrow ones", () => {
    assert.equal(fitBook({ aspect: [1080, 1526], width: 1200, height: 800 }).mode, "spread");
    assert.equal(fitBook({ aspect: [1080, 1526], width: 500, height: 800 }).mode, "single");
  });

  test("16:9 and square pages always turn one at a time", () => {
    assert.equal(fitBook({ aspect: [1080, 607], width: 1800, height: 900 }).mode, "single");
    assert.equal(fitBook({ aspect: [1000, 1000], width: 1800, height: 900, layout: "single" }).mode, "single");
    assert.equal(fitBook({ aspect: [1080, 1526], width: 1800, height: 900, layout: "single" }).mode, "single");
  });

  test("the book uses the width but never grows taller than the window", () => {
    const wide = fitBook({ aspect: [1080, 607], width: 1600, height: 700 });
    assert.ok(wide.pageHeight <= 700 && wide.pageWidth <= 1600);
    const spread = fitBook({ aspect: [1080, 1526], width: 1600, height: 700 });
    assert.ok(spread.pageHeight <= 700 && spread.pageWidth * 2 <= 1600);
  });

  test("spreads after the cover are [1,2], [3,4]", () => {
    assert.deepEqual(visiblePages(0, 7, "spread"), [0]);
    assert.deepEqual(visiblePages(2, 7, "spread"), [1, 2]);
    assert.deepEqual(visiblePages(5, 7, "spread"), [5, 6]);
    assert.deepEqual(visiblePages(3, 7, "single"), [3]);
  });

  test("play counter: Preview: page 3 of 6 (full script 47 pages)", () => {
    const play = { section: "plays", shownPages: 6, pageCount: 47 };
    assert.equal(counterText({ visible: [2], book: play }), "Preview: page 3 of 6 (full script 47 pages)");
    assert.equal(counterText({ visible: [6], book: play }), "End of the preview (full script 47 pages)");
  });

  test("textbook numbering matches the printed page numbers", () => {
    const book = { section: "teaching", shownPages: 99, contentStartPage: 7, firstPageNumber: 6 };
    const num = numbering(book);
    assert.equal(num.indexOf(6), 6);
    assert.equal(counterText({ visible: [6, 7], book }), "Pages 6 and 7 of 98");
    assert.equal(counterText({ visible: [1, 2], book }), "Introduction 2 and 3 of 6");
    assert.equal(counterText({ visible: [0], book: { section: "childrens", shownPages: 19 } }), "Page 1 of 19");
  });

  test("a story's cover is the introduction, so the counter matches the printed page numbers", () => {
    const story = { section: "childrens", shownPages: 19, contentStartPage: 2, firstPageNumber: 1 };
    assert.equal(counterText({ visible: [0], book: story }), "Cover");
    assert.equal(counterText({ visible: [2], book: story }), "Page 2 of 18", "the image printed Page 2");
    assert.equal(numbering(story).indexOf(4), 4);
    assert.equal(pageHeading(story, 0), "Cover");
    assert.equal(pageHeading(story, 2), "Page 2");
  });

  test("a play preview never opens on, or next to, the end of the preview", () => {
    for (const contentStartPage of [1, 3, 5, 6, 9]) {
      const play = { section: "plays", shownPages: 6, contentStartPage };
      const at = openIndex(play);
      const total = play.shownPages + 1; /* the end page */
      for (const mode of ["single", "spread"]) {
        const shown = visiblePages(at, total, mode);
        assert.ok(shown.every((p) => p < play.shownPages - 1), `contentStartPage ${contentStartPage}, ${mode}: opens on ${shown}`);
      }
    }
    assert.equal(openIndex({ section: "plays", shownPages: 6, contentStartPage: 6 }), 1, "script starts late: open on page 2");
    assert.equal(openIndex({ section: "plays", shownPages: 10, contentStartPage: 5 }), 4, "a longer preview opens where the script starts");
    assert.equal(openIndex({ section: "teaching", shownPages: 98, contentStartPage: 6 }), 5);
    assert.equal(openIndex({ section: "childrens", shownPages: 19, contentStartPage: 2 }), 1);
  });
});

/* ---------------------------------------------------------------------------
   Rendered reader (jsdom) */

let esbuild = null;
try {
  esbuild = await import("esbuild");
} catch {
  esbuild = null;
}

describe("BookReader in the DOM", { skip: esbuild ? false : "esbuild is not installed" }, () => {
  let dom, React, createRoot, act, BookReader, player, outDir, FlipReader, flipPlayer;

  before(async () => {
    dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://other.localhost/read/x" });
    const g = globalThis;
    g.window = dom.window;
    g.document = dom.window.document;
    g.navigator ??= dom.window.navigator;
    for (const key of ["HTMLElement", "Node", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "MutationObserver"]) {
      g[key] = dom.window[key];
    }
    dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    g.IS_REACT_ACT_ENVIRONMENT = true;

    outDir = await mkdtemp(path.join(tmpdir(), "reader-dom-"));
    const outfile = path.join(outDir, "bundle.cjs");
    const flipOutfile = path.join(outDir, "bundle-flip.cjs");
    const mock = path.join(root, "tests", "fixtures", "reader", "mock-player.mjs");
    const fakeFlip = path.join(root, "tests", "fixtures", "reader", "fake-pageflip.mjs");
    /* Two bundles: react-pageflip as null (the plain image reader) and as the
       timed fake in fixtures/reader/fake-pageflip.mjs. */
    const build = (file, flipSource) => esbuild.build({
      stdin: {
        contents: `
          export { default as BookReader } from "./components/reader/BookReader.jsx";
          export { player } from ${JSON.stringify(mock.replace(/\\/g, "/"))};
          export { default as React } from "react";
          export { createRoot } from "react-dom/client";
          export { act } from "react";
        `,
        resolveDir: root,
        loader: "js",
      },
      bundle: true,
      /* CommonJS with React external, so act() finds Node's setImmediate instead of
         opening MessageChannels that keep the process alive. */
      format: "cjs",
      platform: "browser",
      outfile: file,
      jsx: "automatic",
      loader: { ".jsx": "jsx", ".js": "jsx" },
      define: { "process.env.NODE_ENV": '"development"' },
      logLevel: "silent",
      plugins: [
        {
          name: "reader-test-doubles",
          setup(build) {
            build.onResolve({ filter: /(^|\/)Player(\.jsx)?$/ }, () => ({ path: mock }));
            /* React stays outside the bundle as Node's own CommonJS modules. */
            build.onResolve({ filter: /^(react|react-dom)(\/.*)?$/ }, (args) => ({ path: nodeRequire.resolve(args.path), external: true }));
            build.onResolve({ filter: /^react-pageflip$/ }, () => ({ path: "pageflip-stub", namespace: "stub" }));
            build.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: flipSource, loader: "js", resolveDir: root }));
          },
        },
      ],
    });
    await build(outfile, "export default null;");
    await build(flipOutfile, `export { default } from ${JSON.stringify(fakeFlip.replace(/\\/g, "/"))};`);
    await esbuild.stop?.(); /* the esbuild service would keep the test process alive */
    ({ BookReader, player, React, createRoot, act } = nodeRequire(outfile));
    ({ BookReader: FlipReader, player: flipPlayer } = nodeRequire(flipOutfile));
  });

  after(async () => {
    dom.window.close();
    await rm(outDir, { recursive: true, force: true });
  });

  const story = {
    slug: "little-ray", title: "Little Ray", section: "childrens", status: "free", download: "public",
    pdf: "/books/little-ray/little-ray.pdf", pdfBytes: 5000000, price: 0, pageCount: 6, shownPages: 6,
    previewPages: null, contentStartPage: 1, firstPageNumber: 1, layout: "single", aspect: [1000, 1000],
    audio: { src: "/audio/chinese-chimes-audiobooks/little-ray.mp3", kind: "audiobook", label: "Listen to the audiobook" },
    video: "cEuPWVPPN0o", textRoute: "/read/little-ray/text",
  };
  const play = {
    ...story, slug: "melting-pot", title: "Melting Pot", section: "plays", status: "preview", download: "paid", pdf: null,
    pdfBytes: null, price: 100, pageCount: 47, shownPages: 6, previewPages: 6, contentStartPage: 6, layout: "auto",
    aspect: [1080, 1526], audio: { src: "/audio/school-play-previews/melting-pot.mp3", kind: "preview", label: "Listen to a preview" },
    video: null, textRoute: null,
  };
  const textbook = {
    ...story, slug: "riddled-with-language", title: "Riddled with Language", section: "teaching", pdf: "/books/riddled-with-language/riddled-with-language.pdf",
    pdfBytes: 14000000, pageCount: 48, shownPages: 48, contentStartPage: 4, firstPageNumber: 2, layout: "auto", aspect: [1080, 1526],
    audio: null, video: null,
  };
  const words = ["Cover words", "Page two words", "Page three words", "", "Page five words", "Page six words"];

  async function mount(props, Reader = BookReader) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const r = createRoot(host);
    await act(async () => r.render(React.createElement(React.Fragment, null, ...[].concat(props).map((p, i) => React.createElement(Reader, { key: i, ...p })))));
    await act(async () => new Promise((res) => setTimeout(res, 30)));
    return {
      host,
      q: (sel) => host.querySelector(sel),
      qa: (sel) => [...host.querySelectorAll(sel)],
      counter: () => host.querySelector(".bkr-counter").textContent,
      button: (text) => [...host.querySelectorAll("button")].find((b) => b.textContent.replace(/[▶❚]/g, "").trim() === text),
      unmount: async () => {
        await act(async () => r.unmount());
        host.remove();
      },
    };
  }
  const click = async (el) => act(async () => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  const key = async (el, k) => act(async () => el.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true })));
  const time = async (s) => act(async () => player.timeTo(s));

  test("a story has Listen, Download and one region with the same controls", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: false });
    assert.equal(r.qa('[role="region"]').length, 1);
    assert.ok(r.button("Listen to the audiobook"));
    assert.equal(r.q("a.bkr-download").getAttribute("href"), story.pdf);
    assert.ok(r.q('button[aria-label="Previous page"]') && r.q('button[aria-label="Next page"]'));
    assert.equal(r.q(".bkr-counter").getAttribute("aria-live"), "polite");
    assert.equal(r.counter(), "Page 1 of 6");
    assert.equal(r.button("Introduction"), undefined, "no Introduction when content starts on page 1");
    assert.ok(r.q('[role="region"] a[href="https://www.youtube.com/watch?v=cEuPWVPPN0o"]'), "YouTube narration is a tertiary link inside the reader");
    assert.ok(r.q(".bkr-listen svg"), "the play icon is drawn, not a text glyph");
    assert.doesNotMatch(r.q(".bkr-listen").textContent, /[\u25B6\u275A]/, "no emoji-prone glyphs");
    await r.unmount();
  });

  test("a play shows Buy (coming soon), no Download, and a preview counter", async () => {
    player.reset();
    const r = await mount({ book: play, pagesText: words, buyHref: "" });
    assert.equal(r.q("a.bkr-download"), null);
    assert.equal(r.q('a[download]'), null);
    assert.match(r.q(".bkr-toolbar").textContent, /A\$1 download\. Online checkout coming soon/);
    assert.ok(r.button("Listen to a preview"));
    assert.equal(r.counter(), "Preview: page 1 of 6 (full script 47 pages)");
    assert.equal(r.button("Introduction"), undefined, "a play preview has no Introduction link: it opens on page 2");
    await key(r.q(".bkr-next"), "End");
    assert.equal(r.counter(), "End of the preview (full script 47 pages)");
    assert.match(r.q(".bkr-end").textContent, /That’s the preview\.Buy the full script \(A\$1\)/);
    assert.equal(r.q(".bkr-end a"), null, "no live checkout link while play links are off");
    await r.unmount();
  });

  test("a textbook has a Download PDF link and printed page numbers", async () => {
    player.reset();
    const r = await mount({ book: textbook, pagesText: [] });
    assert.ok(r.button("Introduction"), "front matter before the content gets an Introduction link");
    const dl = r.q("a.bkr-download");
    assert.equal(dl.getAttribute("href"), textbook.pdf);
    assert.ok(dl.hasAttribute("download"));
    assert.equal(r.q(".bkr-toolbar .bkr-listen"), null);
    await click(r.button("Go to page"));
    const input = r.q(".bkr-go-form input");
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(input, "17");
      input.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    await act(async () => r.q(".bkr-go-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.equal(r.counter(), "Page 17 of 46");
    await r.unmount();
  });

  test("Go to page is a disclosure with a unique id per reader", async () => {
    player.reset();
    const r = await mount([{ book: story, pagesText: words }, { book: textbook, pagesText: [] }]);
    const toggles = r.qa("button").filter((b) => b.textContent.trim() === "Go to page");
    assert.equal(toggles.length, 2);
    const ids = toggles.map((b) => b.getAttribute("aria-controls"));
    assert.notEqual(ids[0], ids[1]);
    ids.forEach((id) => assert.equal(document.querySelectorAll(`[id="${id}"]`).length, 1));
    assert.equal(toggles[0].getAttribute("aria-expanded"), "false");
    assert.equal(document.getElementById(ids[0]).hidden, true);
    await click(toggles[0]);
    assert.equal(toggles[0].getAttribute("aria-expanded"), "true");
    assert.equal(document.getElementById(ids[0]).hidden, false);
    const inputs = r.qa(".bkr-go-form input").map((i) => i.id);
    assert.notEqual(inputs[0], inputs[1]);
    await r.unmount();
  });

  test("keyboard shortcuts work only inside the reader's region", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words });
    await key(document.body, "ArrowRight");
    assert.equal(r.counter(), "Page 1 of 6", "arrow keys outside the region do nothing");
    await key(r.q(".bkr-next"), "ArrowRight");
    assert.equal(r.counter(), "Page 2 of 6");
    await key(r.q(".bkr-next"), "PageDown");
    assert.equal(r.counter(), "Page 3 of 6");
    await key(r.q(".bkr-next"), "Home");
    assert.equal(r.counter(), "Page 1 of 6");
    await key(r.q(".bkr-next"), "End");
    assert.equal(r.counter(), "Page 6 of 6");
    await key(r.q(".bkr-next"), "ArrowLeft");
    assert.equal(r.counter(), "Page 5 of 6");
    await r.unmount();
  });

  test("Show the words on this page reveals the page's text", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words });
    const toggle = r.button("Show the words on this page");
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(r.q(".bkr-words").hidden, true);
    await click(r.q(".bkr-next"));
    await click(toggle);
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.match(r.q(".bkr-words").textContent, /Page 2Page two words/);
    await click(r.q(".bkr-next"));
    assert.match(r.q(".bkr-words").textContent, /Page 3Page three words/);
    await click(r.q(".bkr-next"));
    assert.match(r.q(".bkr-words").textContent, /There are no words on this page/);
    await r.unmount();
  });

  test("unverified cues: the toggle is disabled with a reason, and pages never turn", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: false });
    const box = r.q('.bkr-check input[type="checkbox"]');
    assert.equal(box.disabled, true);
    assert.match(document.getElementById(box.getAttribute("aria-describedby")).textContent, /checked by ear/);
    await act(async () => player.set({ track: { src: story.audio.src }, status: "playing" }));
    await time(45);
    assert.equal(r.counter(), "Page 1 of 6");
    await r.unmount();
  });

  test("verified cues: pages follow only while this book plays", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: true });
    assert.equal(r.q('.bkr-check input').checked, true, "Turn pages with the narration is on by default");
    await time(35);
    assert.equal(r.counter(), "Page 1 of 6", "reading without audio never turns");
    await act(async () => player.set({ track: { src: "/audio/misty/08-misty.mp3" }, status: "playing" }));
    await time(35);
    assert.equal(r.counter(), "Page 1 of 6", "an album track never turns the book");
    await act(async () => player.set({ track: { src: story.audio.src }, status: "paused" }));
    await time(35);
    assert.equal(r.counter(), "Page 1 of 6", "paused never turns");
    await act(async () => player.set({ status: "playing" }));
    await time(35);
    assert.equal(r.counter(), "Page 4 of 6", "playing turns to the narrated page");
    await time(52);
    assert.equal(r.counter(), "Page 6 of 6", "a NowBar seek turns the page while following");
    await r.unmount();
  });

  test("opening while this book plays starts suspended, with Follow the narration", async () => {
    player.reset();
    player.set({ track: { src: story.audio.src }, status: "playing" });
    player.audio.currentTime = 45;
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: true });
    assert.equal(r.counter(), "Page 1 of 6", "no jump on mount");
    await time(46);
    assert.equal(r.counter(), "Page 1 of 6");
    await click(r.button("Follow the narration"));
    assert.equal(r.counter(), "Page 5 of 6");
    await r.unmount();
  });

  test("a manual flip during playback suspends, with Play from this page and Back to the narration", async () => {
    player.reset();
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: true });
    await act(async () => player.set({ track: { src: story.audio.src }, status: "playing" }));
    await time(12);
    assert.equal(r.counter(), "Page 2 of 6");
    await click(r.q(".bkr-next"));
    assert.equal(r.counter(), "Page 3 of 6");
    assert.ok(r.button("Play from this page") && r.button("Back to the narration"));
    await time(15);
    assert.equal(r.counter(), "Page 3 of 6", "suspended: the narration no longer turns pages");
    await click(r.button("Play from this page"));
    assert.deepEqual(player.calls.at(-1), { type: "seek", time: 20 }, "same source: seek to this page's cue");
    await click(r.q(".bkr-next"));
    await click(r.button("Back to the narration"));
    assert.equal(r.counter(), "Page 2 of 6");
    await r.unmount();
  });

  test("Listen never seeks an album track: it loads this book at the page's cue", async () => {
    player.reset();
    player.set({ track: { src: "/audio/misty/08-misty.mp3", name: "Misty" }, status: "playing" });
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: true });
    await click(r.q(".bkr-next"));
    await click(r.q(".bkr-next"));
    await click(r.button("Listen to the audiobook"));
    assert.deepEqual(player.calls.at(-1), { type: "playAt", src: story.audio.src, time: 20 });
    assert.equal(player.calls.some((c) => c.type === "seek"), false);
    await r.unmount();
  });

  test("a play preview's Listen plays the clip and never turns pages", async () => {
    player.reset();
    const r = await mount({ book: play, pagesText: words });
    await click(r.button("Listen to a preview"));
    assert.deepEqual(player.calls.at(-1), { type: "playAt", src: play.audio.src, time: 0 });
    await act(async () => player.set({ track: { src: play.audio.src }, status: "playing" }));
    await time(40);
    assert.equal(r.counter(), "Preview: page 1 of 6 (full script 47 pages)");
    assert.equal(r.q(".bkr-check"), null, "no follow toggle for a preview clip");
    await r.unmount();
  });

  test("with an animated page turn, a follow turn that interrupts another is not a manual flip", async () => {
    flipPlayer.reset();
    const r = await mount({ book: story, pagesText: words, cues: CUES, verified: true }, FlipReader);
    await act(async () => new Promise((res) => setTimeout(res, 60)));
    assert.ok(r.q("[data-fake-flip]"), "the animated flip book is in use");
    await act(async () => flipPlayer.set({ track: { src: story.audio.src }, status: "playing" }));
    /* Two narration turns inside one animation (a NowBar seek right after a turn). */
    await act(async () => flipPlayer.timeTo(12));
    await act(async () => flipPlayer.timeTo(22));
    await act(async () => new Promise((res) => setTimeout(res, 120)));
    assert.equal(r.counter(), "Page 3 of 6", "the book follows to the second target");
    assert.equal(r.button("Play from this page"), undefined, "following was not suspended");
    await act(async () => flipPlayer.timeTo(33));
    await act(async () => new Promise((res) => setTimeout(res, 120)));
    assert.equal(r.counter(), "Page 4 of 6", "and keeps following");
    await r.unmount();
  });
});
