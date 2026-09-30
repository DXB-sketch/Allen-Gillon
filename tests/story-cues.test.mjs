import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { followEnabled, cueStarts } from "../lib/story-cues.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cueDir = join(root, "content", "story-cues");
const files = existsSync(cueDir) ? readdirSync(cueDir).filter((f) => f.endsWith(".json")) : [];

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

test("there is a cue file for each Chinese Chimes story", () => {
  for (const slug of ["little-ray", "little-hi-doh", "funny-fah-learns-when-to-stop", "imaginative-little-mee"]) {
    assert.ok(files.includes(`${slug}.json`), `missing content/story-cues/${slug}.json`);
  }
});

for (const file of files) {
  const cueFile = readJson(join(cueDir, file));
  const slug = file.replace(/\.json$/, "");

  test(`${slug}: one cue per reader page`, () => {
    assert.equal(cueFile.slug, slug);
    const manifest = readJson(join(root, "public", "books", slug, "manifest.json"));
    assert.equal(cueFile.pageCount, manifest.pageCount);
    assert.equal(cueFile.cues.length, manifest.pageCount);
    cueFile.cues.forEach((cue, index) => assert.equal(cue.page, index + 1));
  });

  test(`${slug}: cues start at 0, strictly increase and end before the audio does`, () => {
    const starts = cueFile.cues.map((cue) => cue.start);
    assert.equal(starts[0], 0);
    for (let i = 1; i < starts.length; i += 1) {
      assert.ok(starts[i] > starts[i - 1], `cue ${i + 1} (${starts[i]}) is not after cue ${i} (${starts[i - 1]})`);
    }
    assert.ok(starts.at(-1) < cueFile.duration, `last cue ${starts.at(-1)} >= duration ${cueFile.duration}`);
    for (const cue of cueFile.cues) {
      assert.ok(cue.confidence >= 0 && cue.confidence <= 1, `page ${cue.page} confidence out of range`);
    }
  });

  test(`${slug}: audioSha256 matches the mp3`, () => {
    const mp3 = join(root, "public", cueFile.audio.replace(/^\//, ""));
    const sha = createHash("sha256").update(readFileSync(mp3)).digest("hex");
    assert.equal(sha, cueFile.audioSha256);
  });

  test(`${slug}: follow is on only when verified`, () => {
    assert.equal(followEnabled(cueFile), cueFile.verified === true);
    assert.equal(cueStarts(cueFile) === null, cueFile.verified !== true);
  });
}

test("followEnabled is true only for verified === true", () => {
  const base = { cues: [{ page: 1, start: 0 }] };
  assert.equal(followEnabled({ ...base, verified: true }), true);
  assert.equal(followEnabled({ ...base, verified: false }), false);
  assert.equal(followEnabled({ ...base, verified: "true" }), false);
  assert.equal(followEnabled({ ...base, verified: 1 }), false);
  assert.equal(followEnabled(base), false);
  assert.equal(followEnabled(null), false);
  assert.equal(followEnabled(undefined), false);
  assert.deepEqual(cueStarts({ ...base, verified: true }), [0]);
  assert.equal(cueStarts({ ...base, verified: false }), null);
});
