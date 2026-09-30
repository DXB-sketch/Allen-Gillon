import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

// VERIFICATION > Audio, in a real browser (the rules themselves are unit
// tested in tests/reader-dom.test.mjs against lib/reader-follow.mjs):
// - paused or unplayed audio turns nothing
// - with verified cues, narration turns land within 0.5 s of each cue
// - a manual flip suspends following
// - opening /read while the book is playing starts suspended
// - Listen never seeks another source (an album track or another book)
//
// No story's cues are signed off yet (content/story-cues/*.json all have
// verified:false), so the "verified" cases flip the flag in the page payload
// in memory only; the files are never touched.
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

/* In memory only: the page payload says this title's cues are signed off.
   The server HTML still says unverified, so React reports a hydration
   mismatch; on vinext dev its error overlay would cover the page, so it is
   hidden (the Worker preview has no overlay). */
function hideDevOverlay() {
  const style = document.createElement("style");
  style.textContent = "#__vinext_dev_error_overlay_root{display:none!important}";
  document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
}

async function pretendVerified(context) {
  await context.route(/\/read\/little-ray(\?.*)?$/, async (route) => {
    const res = await route.fetch();
    const body = (await res.text())
      .replace(/\\"verified\\":false/g, '\\"verified\\":true')
      .replace(/"verified":false/g, '"verified":true');
    await route.fulfill({ response: res, body, headers: { ...res.headers(), "content-length": String(Buffer.byteLength(body)) } });
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

test.beforeEach(async ({ context }) => {
  await context.addInitScript(instrument);
  await serveAudioWithRanges(context);
});

test("unverified cues: unplayed and playing audio turn nothing, and follow is off", async ({ page }) => {
  await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
  await ready(page);
  const follow = page.getByRole("checkbox", { name: "Turn pages with the narration" });
  await expect(follow).toBeDisabled();
  await expect(follow).not.toBeChecked();

  const start = await counter(page);
  await page.waitForTimeout(1500);
  expect(await counter(page), "unplayed audio turns no page").toBe(start);

  await page.locator(".bkr-listen").click();
  await playing(page);
  await page.waitForTimeout(500);
  const atPlay = await counter(page);
  await setTime(page, CUES[6] + 1);
  await page.waitForTimeout(2500);
  expect(await counter(page), "playing and seeking past cues turns no page without signed-off cues").toBe(atPlay);
});

test.describe("verified cues (flag flipped in memory)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(hideDevOverlay);
    await pretendVerified(context);
  });

  test("turns land within 0.5 s of each cue; paused audio turns nothing", async ({ page }) => {
    await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
    await ready(page);
    await expect(page.getByRole("checkbox", { name: "Turn pages with the narration" })).toBeChecked();

    const start = await counter(page);
    await page.waitForTimeout(1500);
    expect(await counter(page), "verified but unplayed: no turn").toBe(start);

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

  test("a manual flip suspends following until Back to the narration", async ({ page }) => {
    await page.goto(`${OTHER}${LITTLE_RAY}`, { waitUntil: "load" });
    await ready(page);
    await page.locator(".bkr-listen").click();
    await playing(page);
    await page.waitForTimeout(800);

    await page.getByRole("button", { name: "Next page" }).click();
    await page.waitForTimeout(1300);
    const flipped = await counter(page);
    const back = page.getByRole("button", { name: "Back to the narration" });
    await expect(back).toBeVisible();
    await expect(page.getByRole("button", { name: "Play from this page" })).toBeVisible();

    await page.evaluate(() => { window.__turns = []; });
    await setTime(page, CUES[12] - 1);
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => window.__turns), "suspended: crossing a cue turns nothing").toEqual([]);
    expect(await counter(page)).toBe(flipped);

    await back.click();
    await page.waitForTimeout(1500);
    expect(await counter(page)).not.toBe(flipped);
    await expect(page.getByText("Following the narration.")).toBeVisible();
  });

  test("opening /read while the book plays starts suspended, with no jump", async ({ page }) => {
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
    await expect(page.getByText("The narration is playing on another page.")).toBeVisible();
    await page.waitForTimeout(2500);
    expect(await counter(page), "no jump on mount while playing").toBe(mounted);

    await page.getByRole("button", { name: "Follow the narration" }).click();
    await page.waitForTimeout(1500);
    expect(await counter(page)).not.toBe(mounted);
  });
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
