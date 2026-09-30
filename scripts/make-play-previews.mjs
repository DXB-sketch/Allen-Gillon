// make-play-previews.mjs
// Cuts the one-minute preview of each school-play recording.
//
// The full recordings are paid content and live in private/audio/ (never in
// public/). For every title in content/books.config.json whose audio has
// kind "preview", this reads audio.from (the private recording) and writes
// audio.src under public/: the first minute, ending in the pause nearest to
// 60 seconds (between 52 and 62 s) with a short fade, so the clip never stops
// mid-word.
//
// Usage: node scripts/make-play-previews.mjs
//   FFMPEG overrides the ffmpeg binary (default: ffmpeg on PATH, then the
//   WinGet Gyan build).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const execFileP = promisify(execFile);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const exists = (p) => access(p).then(() => true, () => false);

const TARGET = 60;
const EARLIEST = 52;
const LATEST = 62;
const FADE = 0.6;

async function findFfmpeg() {
  const candidates = [
    process.env.FFMPEG,
    "ffmpeg",
    path.join(process.env.LOCALAPPDATA || "", "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe"),
  ].filter(Boolean);
  for (const bin of candidates) {
    try {
      await execFileP(bin, ["-version"]);
      return bin;
    } catch {
      /* try the next */
    }
  }
  throw new Error("ffmpeg not found. Set FFMPEG to its path.");
}

/** The cut point: the middle of the silence nearest 60 s, else 60 s. */
async function cutPoint(ffmpeg, file) {
  const { stderr } = await execFileP(ffmpeg, [
    "-hide_banner", "-t", String(LATEST + 5), "-i", file, "-af", "silencedetect=n=-40dB:d=0.6", "-f", "null", "-",
  ], { maxBuffer: 16 * 1024 * 1024 });
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const mids = starts.map((s, i) => (ends[i] ? (s + ends[i]) / 2 : null)).filter((m) => m && m >= EARLIEST && m <= LATEST);
  if (!mids.length) return TARGET;
  return mids.sort((a, b) => Math.abs(a - TARGET) - Math.abs(b - TARGET))[0];
}

async function main() {
  const ffmpeg = await findFfmpeg();
  const config = JSON.parse(await readFile(path.join(ROOT, "content", "books.config.json"), "utf8"));
  for (const book of config) {
    if (book.audio?.kind !== "preview") continue;
    const from = path.join(ROOT, book.audio.from);
    const to = path.join(ROOT, "public", book.audio.src.replace(/^\//, ""));
    if (!book.audio.from.startsWith("private/")) throw new Error(`${book.slug}: the full recording must live under private/`);
    if (!(await exists(from))) {
      console.log(`${book.slug}: ${book.audio.from} not found, skipped.`);
      continue;
    }
    const end = await cutPoint(ffmpeg, from);
    await mkdir(path.dirname(to), { recursive: true });
    await execFileP(ffmpeg, [
      "-hide_banner", "-loglevel", "error", "-y", "-i", from, "-t", end.toFixed(2),
      "-af", `afade=t=out:st=${(end - FADE).toFixed(2)}:d=${FADE}`,
      "-map_metadata", "-1", "-ac", "1", "-b:a", "64k", to,
    ]);
    console.log(`${book.slug}: preview ${end.toFixed(1)} s -> ${path.relative(ROOT, to)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
