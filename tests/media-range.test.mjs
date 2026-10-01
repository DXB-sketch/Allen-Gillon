import test from "node:test";
import assert from "node:assert/strict";
import { parseRange, rangeResponse } from "../lib/media-range.mjs";

test("parseRange handles open, closed, suffix and bad ranges", () => {
  assert.deepEqual(parseRange("bytes=0-1", 10), { start: 0, end: 1 });
  assert.deepEqual(parseRange("bytes=4-", 10), { start: 4, end: 9 });
  assert.deepEqual(parseRange("bytes=-3", 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange("bytes=5-999", 10), { start: 5, end: 9 });
  assert.deepEqual(parseRange("bytes=-50", 10), { start: 0, end: 9 });
  assert.equal(parseRange("bytes=10-", 10), "unsatisfiable");
  assert.equal(parseRange("bytes=5-2", 10), "unsatisfiable");
  assert.equal(parseRange("bytes=-0", 10), "unsatisfiable");
  assert.equal(parseRange("bytes=0-1,4-5", 10), null);
  assert.equal(parseRange("items=0-1", 10), null);
  assert.equal(parseRange(null, 10), null);
});

const asset = () =>
  new Response(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), {
    headers: { "content-type": "audio/mpeg", etag: '"abc"', "content-length": "10", "cache-control": "public, max-age=31536000, immutable" },
  });

test("no Range: whole file, 200, advertises byte ranges and keeps caching headers", async () => {
  const res = await rangeResponse(new Request("https://x/audio/a.mp3"), asset());
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("accept-ranges"), "bytes");
  assert.equal(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal((await res.arrayBuffer()).byteLength, 10);
});

test("one range: 206 with the right bytes and headers", async () => {
  const res = await rangeResponse(new Request("https://x/audio/a.mp3", { headers: { range: "bytes=2-4" } }), asset());
  assert.equal(res.status, 206);
  assert.equal(res.headers.get("content-range"), "bytes 2-4/10");
  assert.equal(res.headers.get("content-length"), "3");
  assert.deepEqual([...new Uint8Array(await res.arrayBuffer())], [2, 3, 4]);
});

test("unsatisfiable range: 416 with the file size", async () => {
  const res = await rangeResponse(new Request("https://x/a.mp3", { headers: { range: "bytes=20-" } }), asset());
  assert.equal(res.status, 416);
  assert.equal(res.headers.get("content-range"), "bytes */10");
});

test("If-Range mismatch sends the whole file", async () => {
  const res = await rangeResponse(new Request("https://x/a.mp3", { headers: { range: "bytes=0-1", "if-range": '"old"' } }), asset());
  assert.equal(res.status, 200);
});

test("missing asset passes through", async () => {
  const res = await rangeResponse(new Request("https://x/a.mp3"), new Response("nope", { status: 404 }));
  assert.equal(res.status, 404);
});

import { mediaAssetPath } from "../lib/media-range.mjs";

test("mediaAssetPath accepts only /audio and /videos files", () => {
  assert.equal(mediaAssetPath("/audio/misty/a.mp3"), "/audio/misty/a.mp3");
  assert.equal(mediaAssetPath("/videos/x.mp4"), "/videos/x.mp4");
  assert.equal(mediaAssetPath("/books/x/x.pdf"), null);
  assert.equal(mediaAssetPath("/audio/../books/x.pdf"), null);
  assert.equal(mediaAssetPath("/audio/"), null);
  assert.equal(mediaAssetPath("/audio"), null);
});
