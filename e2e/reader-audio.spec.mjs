import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

// VERIFICATION > Audio, in a real browser (the rules themselves are unit
// tested in tests/reader-dom.test.mjs against lib/reader-follow.mjs):
// - paused or unplayed audio turns nothing
// - narration turns land within 0.5 s of each cue, with no switch to turn on
// - after a manual flip, the narration's next page turns the book back
// - opening /read while the book is playing does not jump; the narration's
//   next page turns the book to it
// - Listen never seeks another source (an album track or another book)
//
// The mp3s are served by a Range-aware route, so seeking works the same on
// vinext dev and on the local Worker preview (wrangler dev answers Range
// requests with a full 200, which Chromium cannot seek in).

const port = Number(process.env.SITE_DEV_PORT || 3001);
const OTHER = `http://other.localhost:${port}`;
const PUBLIC = path.resolve("public");
const LITTLE_RAY = "/read/little-ray";
const cueFile = JSON.parse(readFileSync(path.resolve("content/story-cues/little-ray.json"), "utf8"));
const CUES = cueFile.cues.map((c) => c.start);

test.use({ viewport: { width: 1280, height: 900 } });

/* Records every currentTime assignment and every change of the page counter. */
function instrument() {
  window.__sets = [];
  window.__turns = [];
  const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "currentTime");
  Object.defineProperty(HTMLMediaElement.prototype, "currentTime", {
    configurable: true,
    get() {
      return desc.get.call(this);
    },
    set(v) {
      window.__sets.push({ src: this.currentSrc || this.getAttribute("src") || "", v });
      desc.set.call(this, v);
    },
  });
  const watch = () => {
    const c = document.querySelector(".bkr-counter");
    if (!c || c.__watched) return;
    c.__watched = true;
    new MutationObserver(() => {
      const a = document.querySelector("audio[data-shared-player]");
      window.__turns.push({ text: c.textContent, t: a ? a.currentTime : null });
    }).observe(c, { childList: true, characterData: true, subtree: true });
  };
  setInterval(watch, 100);
}

async function serveAudioWithRanges(context) {
  await context.route(/\/audio\/.*\.mp3(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    let buf;
    try {
      buf = readFileSync(path.join(PUBLIC, decodeURIComponent(url.pathname)));
    } catch {
      return route.continue();
    }
    const range = /bytes=(\d*)-(\d*)/.exec(route.request().headers().range || "");
    const base = { "content-type": "audio/mpeg", "accept-ranges": "bytes" };
    if (!range) return route.fulfill({ status: 200, body: buf, headers: { ...base, "content-length": String(buf.length) } });
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), buf.length - 1) : buf.length - 1;
    const part = buf.subarray(start, end + 1);
    return route.fulfill({
      status: 206,
      body: part,
      headers: { ...base, "content-range": `bytes ${start}-${end}/${buf.length}`, "content-length": String(part.length) },
    });
  });
}

const counter = (page) => page.locator(".bkr-counter").textContent();
const audio = (page) =>
  page.evaluate(() => {
    const a = document.querySelector("audio[data-shared-player]");
    return { src: a.currentSrc || a.getAttribute("src") || "", t: a.currentTime, paused: a.paused };
  });
const setTime = (page, t) => page.evaluate((v) => { document.querySelector("audio[data-shared-player]").currentTime = v; }, t);
const ready = async (page) => {
  await page.waitForSelector(".bkr[data-ready]", { timeout: 30_000 });
  await page.waitForTimeout(1500); /* the cover opens once, when in view */
};
const playing = (page) =>
  page.waitForFunction(() => document.querySelector("#nowname")?.textContent.startsWith("Playing"), null, { timeout: 30_000 });
/* Index of the page narrated at time t. */
const pageAt = (t) => CUES.reduce((page, cue, i) => (t + 0.05 >= cue ? i : page), 0);

test.beforeEach(async ({ context }) => {
  await context.addInitScript(instrument);
  await serveAudioWithRanges(context);
});

test("turns land within 0.5 s of each cue; paused audio turns nothing", async ({ page }) => {
  await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
  await ready(page);
  await expect(page.getByRole("checkbox")).toHaveCount(0); /* always on: no switch */

  const start = await counter(page);
  await page.waitForTimeout(1500);
  expect(await counter(page), "unplayed: no turn").toBe(start);

  await page.locator(".bkr-listen").click();
  await playing(page);
  await expect(page.getByText("Following the narration.")).toBeVisible();

  // Single-page cues well apart, so each lands on its own page in a spread.
  for (const k of [4, 7, 10]) {
    await setTime(page, CUES[k] - 2.5);
    await page.waitForTimeout(1200);
    await page.evaluate(() => { window.__turns = []; });
    await page.waitForTimeout(3000);
    const first = (await page.evaluate(() => window.__turns))[0];
    expect(first, `page ${k + 1}: no turn near its cue ${CUES[k]}`).toBeTruthy();
    const delta = first.t - CUES[k];
    expect(Math.abs(delta), `page ${k + 1}: landed ${delta.toFixed(3)} s from its cue`).toBeLessThanOrEqual(0.5);
  }

  await page.locator("#nowplay").click(); /* pause */
  await page.waitForTimeout(400);
  const paused = await counter(page);
  await setTime(page, CUES[15] + 1);
  await page.waitForTimeout(2000);
  expect(await counter(page), "paused audio: seeking past a cue turns no page").toBe(paused);
});

test("after a manual flip, the narration's next page turns the book back", async ({ page }) => {
  await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
  await ready(page);
  await page.locator(".bkr-listen").click();
  await playing(page);
  await setTime(page, CUES[12] - 4);
  await page.waitForTimeout(1300);

  await page.getByRole("button", { name: "Previous page" }).click();
  await page.getByRole("button", { name: "Previous page" }).click();
  await page.waitForTimeout(1300);
  const flipped = await counter(page);
  await expect(page.getByRole("button", { name: "Back to the narration" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play from this page" })).toBeVisible();

  await page.evaluate(() => { window.__turns = []; });
  await page.waitForTimeout(3500); /* past cue 12 */
  const turns = await page.evaluate(() => window.__turns);
  expect(turns.length, "the next cue turned the book").toBeGreaterThan(0);
  expect(await counter(page)).not.toBe(flipped);
  await expect(page.getByText("Following the narration.")).toBeVisible();
});

test("opening /read while the book plays: no jump, then the next page catches up", async ({ page }) => {
  await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
  await ready(page);
  await page.locator(".bkr-listen").click();
  await playing(page);
  await setTime(page, CUES[8] + 1);

  // Client-side navigation keeps the shared player playing.
  await page.getByRole("link", { name: "Back to the stories" }).click();
  await page.waitForURL(/\/books/);
  await page.getByRole("link", { name: "Read and listen to Little Ray" }).click();
  await page.waitForURL(/\/read\/little-ray/);
  await ready(page);
  expect((await audio(page)).paused).toBe(false);

  const mounted = await counter(page);
  await expect(page.getByRole("button", { name: "Back to the narration" })).toBeVisible();
  // Move within the narrated page only (not a page change), 2.5 s before the next cue.
  const k = pageAt((await audio(page)).t);
  await setTime(page, CUES[k + 1] - 2.5);
  await page.waitForTimeout(1200);
  expect(await counter(page), "no jump on mount while playing").toBe(mounted);

  await page.waitForTimeout(2500); /* past the next cue */
  expect(await counter(page)).not.toBe(mounted);
  await expect(page.getByText("Following the narration.")).toBeVisible();
});

test("Listen never seeks another source", async ({ page }) => {
  await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
  await ready(page);
  await page.locator(".bkr-listen").click();
  await playing(page);
  await setTime(page, 60);

  await page.getByRole("link", { name: "Back to the stories" }).click();
  await page.waitForURL(/\/books/);
  await page.getByRole("link", { name: "Read and listen to Hi-Doh" }).click();
  await page.waitForURL(/\/read\/little-hi-doh/);
  await ready(page);
  expect((await audio(page)).src).toContain("little-ray");
  await expect(page.locator(".bkr-listen")).not.toContainText("Pause");

  await page.getByRole("button", { name: "Next page" }).click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => { window.__sets = []; });
  await page.locator(".bkr-listen").click();
  // This book's own audiobook is now the source (its file is not named after the slug).
  await page.waitForFunction(
    () => {
      const a = document.querySelector("audio[data-shared-player]");
      return a && a.currentSrc && !a.currentSrc.includes("little-ray") && document.querySelector("#nowname")?.textContent.startsWith("Playing");
    },
    null,
    { timeout: 30_000 },
  );
  const sets = await page.evaluate(() => window.__sets);
  expect(sets.filter((s) => s.src.includes("little-ray")), "Listen seeked the other book's audio").toEqual([]);
});
