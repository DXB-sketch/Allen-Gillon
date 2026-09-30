#!/usr/bin/env python3
"""Align Chinese Chimes audiobook narration to book pages.

Writes content/story-cues/<slug>.json (one cue per reader page) and a review
report in docs/cue-review/<slug>/ (index.html, cues.csv, clips/p###.mp3).

Method, per the W4 "Audiobook sync" spec:
  1. Per-page reference text: OCR of the page images (RapidOCR), with run-on
     words ("InaPalacefaraway") split against the narration's vocabulary.
  2. Word-level transcript of the narration mp3 with stable-ts (falls back to
     faster-whisper word timestamps if stable-ts fails).
  3. Dynamic programming splits the transcript into one run of words per
     page, maximising IDF-weighted word and bigram overlap with each page's
     text, with a prior that favours sentence starts and pauses (silence
     snapping). Each boundary is then refined to where the page's own first
     printed words are heard.
  4. Picture-only pages (no text) are placed where the original YouTube video
     turned to them (auto-caption timing + ffmpeg scene changes, mapped into
     the mp3 by aligning captions with the transcript); funny-fah and
     imaginative-little-mee only. Otherwise they are shown briefly before
     the next page, with low confidence.
  5. A repeated tail in the mp3 (a render that reads part of the story twice)
     is detected and ignored; cues follow the first reading.
  6. Self-check: an independent faster-whisper pass over a window at every
     cue measures where the page's first word actually starts.

Cue files are always written with "verified": false. A human flips it to true
after listening to the clips in the review report.

Usage:
  python scripts/align-story-cues.py [--slug SLUG ...] [--model small]
         [--check-model small] [--cache DIR] [--skip-check]

Requires: ffmpeg/ffprobe (on PATH, FFMPEG/FFPROBE env, or the WinGet Gyan
build), stable-ts, faster-whisper, rapidocr_onnxruntime, yt-dlp and node (for
the YouTube step).
"""

from __future__ import annotations

import argparse
import csv
import difflib
import hashlib
import html
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

STORIES = {
    "little-ray": "/audio/chinese-chimes-audiobooks/little-ray.mp3",
    "little-hi-doh": "/audio/chinese-chimes-audiobooks/hi-doh.mp3",
    "funny-fah-learns-when-to-stop": "/audio/chinese-chimes-audiobooks/funny-fah-learns-when-to-stop.mp3",
    "imaginative-little-mee": "/audio/chinese-chimes-audiobooks/imaginative-little-mee.mp3",
}

TOLERANCE = 0.5  # seconds, from the spec
LEAD = 0.15  # turn the page this far before the first word, if the pause allows
CLIP_SECONDS = 4.0


# --------------------------------------------------------------------------
# helpers


def find_tool(name: str) -> str:
    env = os.environ.get(name.upper())
    if env and Path(env).exists():
        return env
    found = shutil.which(name)
    if found:
        return found
    ff = os.environ.get("FFMPEG")
    if ff:
        cand = Path(ff).with_name(name + (".exe" if os.name == "nt" else ""))
        if cand.exists():
            return str(cand)
    winget = Path.home() / "AppData/Local/Microsoft/WinGet/Packages"
    if winget.exists():
        for cand in winget.glob(f"Gyan.FFmpeg*/**/bin/{name}.exe"):
            return str(cand)
    sys.exit(f"{name} not found; put it on PATH or set {name.upper()}")


def load_audio(path: Path):
    """16 kHz mono float32 samples, decoded by ffmpeg (avoids PyAV version issues)."""
    import numpy as np

    raw = subprocess.run(
        [find_tool("ffmpeg"), "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def duration_of(path: Path) -> float:
    out = subprocess.run(
        [find_tool("ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


NUMBERS = {
    "0": "zero", "1": "i", "2": "two", "3": "three", "4": "four", "5": "five",
    "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
}


def tokens(text: str) -> list[str]:
    text = text.lower().replace("’", "'").replace("’", "'")
    out = []
    for raw in re.findall(r"[a-z0-9']+", text):
        raw = raw.strip("'")
        if raw.endswith("'s"):
            raw = raw[:-2]
        raw = raw.replace("'", "")
        if not raw:
            continue
        out.append(NUMBERS.get(raw, raw))
    return out


# --------------------------------------------------------------------------
# stage 1: OCR


def ocr_pages(slug: str, page_count: int, cache: Path) -> list[str]:
    path = cache / slug / "ocr.json"
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        if len(data) == page_count:
            return data
    from rapidocr_onnxruntime import RapidOCR

    engine = RapidOCR()
    pages = []
    for i in range(1, page_count + 1):
        img = ROOT / "public" / "books" / slug / f"p{i:03d}.webp"
        png = cache / slug / f"p{i:03d}.png"
        png.parent.mkdir(parents=True, exist_ok=True)
        if not png.exists():
            subprocess.run([find_tool("ffmpeg"), "-v", "error", "-y", "-i", str(img), str(png)], check=True)
        result, _ = engine(str(png))
        lines = []
        for box, text, score in result or []:
            if score < 0.5:
                continue
            ys = [p[1] for p in box]
            xs = [p[0] for p in box]
            lines.append({"text": text, "y": min(ys), "x": min(xs), "h": max(ys) - min(ys)})
        pages.append(lines)
        print(f"  ocr {slug} p{i:03d}: {len(lines)} lines", flush=True)
    path.write_text(json.dumps(pages, indent=1), encoding="utf-8")
    return pages


def page_texts(ocr: list[list[dict]]) -> list[str]:
    """Reading-order text per page with repeated headers and page numbers removed."""
    counts: dict[str, int] = {}
    for lines in ocr:
        for key in {" ".join(tokens(l["text"])) for l in lines}:
            counts[key] = counts.get(key, 0) + 1
    repeated = {k for k, n in counts.items() if n >= max(3, len(ocr) // 3) and k}
    out = []
    for lines in ocr:
        rows: list[list[dict]] = []
        for l in sorted(lines, key=lambda l: l["y"] + l["h"] / 2):
            yc = l["y"] + l["h"] / 2
            if rows and abs(yc - (rows[-1][0]["y"] + rows[-1][0]["h"] / 2)) < 0.5 * max(l["h"], rows[-1][0]["h"]):
                rows[-1].append(l)
            else:
                rows.append([l])
        keep = []
        for l in [l for row in rows for l in sorted(row, key=lambda l: l["x"])]:
            key = " ".join(tokens(l["text"]))
            if not key or key in repeated or re.fullmatch(r"[\d ]+", l["text"].strip()):
                continue
            keep.append(l["text"])
        out.append(" ".join(keep))
    return out


# --------------------------------------------------------------------------
# stage 2: transcript with word timestamps


def transcribe(slug: str, audio: Path, model_name: str, cache: Path) -> tuple[list[dict], str]:
    path = cache / slug / f"words-{model_name}.json"
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        return data["words"], data["engine"]
    path.parent.mkdir(parents=True, exist_ok=True)
    words: list[dict] = []
    samples = load_audio(audio)
    # stable-ts shells out to ffmpeg in places; make sure it can find it.
    os.environ["PATH"] = str(Path(find_tool("ffmpeg")).parent) + os.pathsep + os.environ.get("PATH", "")
    try:
        import stable_whisper

        model = stable_whisper.load_model(model_name, device="cpu")
        result = model.transcribe(samples, language="en", word_timestamps=True, vad=False, regroup=False)
        for seg in result.segments:
            for w in seg.words:
                words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability or 0, 3)})
        engine = f"stable-ts {stable_whisper.__version__} ({model_name})"
    except Exception as exc:  # fall back to plain faster-whisper word timestamps
        print(f"  stable-ts failed ({exc}); falling back to faster-whisper", flush=True)
        from faster_whisper import WhisperModel

        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(samples, language="en", word_timestamps=True)
        for seg in segments:
            for w in seg.words:
                words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
        engine = f"faster-whisper ({model_name})"
    path.write_text(json.dumps({"engine": engine, "words": words}, indent=0), encoding="utf-8")
    return words, engine


# --------------------------------------------------------------------------
# stage 3: alignment


def split_runons(toks: list[str], vocab: set[str]) -> list[str]:
    """Split OCR run-ons such as "inapalacefarawaylives" into known words.

    RapidOCR drops the spaces in some tightly set bold text. Unknown tokens of
    6+ letters are segmented into words heard in the narration (longest-word
    dynamic programming); the split is kept only if it covers 80% of the
    letters.
    """
    out = []
    for tok in toks:
        if len(tok) < 6 or tok in vocab:
            out.append(tok)
            continue
        L = len(tok)
        best: list[tuple[float, list[str]]] = [(0.0, [])] + [(-1.0, [])] * L
        for i in range(1, L + 1):
            cand = (best[i - 1][0], best[i - 1][1])  # skip a letter
            for j in range(max(0, i - 15), i):
                piece = tok[j:i]
                if best[j][0] >= 0 and piece in vocab and (len(piece) > 1 or piece in ("a", "i")):
                    score = best[j][0] + len(piece) ** 2
                    if score > cand[0]:
                        cand = (score, best[j][1] + [piece])
            best[i] = cand
        pieces = best[L][1]
        out.extend(pieces if sum(map(len, pieces)) >= 0.8 * L else [tok])
    return out


def align(page_text: list[str], words: list[dict], duration: float) -> list[dict]:
    """Segment the transcript into one contiguous run of words per page.

    Dynamic programming picks page boundaries (at phrase starts) that maximise
    how well each run of transcript words matches its page's OCR text: an
    IDF-weighted unigram hit plus a bigram bonus. The score is insensitive to
    the OCR's reading order inside a page (speech bubbles, two columns).
    """
    import math

    n, W = len(page_text), len(words)
    word_toks = [tokens(w["w"]) for w in words]
    heard = {tok for toks in word_toks for tok in toks}
    page_tok = [split_runons(tokens(t), heard) for t in page_text]
    vocab = [set(t) for t in page_tok]
    bigrams = [set(zip(t, t[1:])) for t in page_tok]
    df: dict[str, int] = {}
    for v in vocab:
        for tok in v:
            df[tok] = df.get(tok, 0) + 1
    idf = {tok: math.log(1 + n / d) for tok, d in df.items()}

    # Per page prefix sums of match weight over transcript words.
    prefix = []
    for p in range(n):
        acc, prev_tok, row = 0.0, None, [0.0]
        for toks in word_toks:
            for tok in toks:
                if tok in vocab[p]:
                    acc += idf[tok]
                    if prev_tok is not None and (prev_tok, tok) in bigrams[p]:
                        acc += 1.0
                prev_tok = tok
            row.append(acc)
        prefix.append(row)

    def pause(i: int) -> float:
        return words[i]["s"] - (words[i - 1]["e"] if i > 0 else 0.0)

    # Every word is a candidate page start; whisper's punctuation is not
    # reliable enough to restrict boundaries to sentence starts.
    cand = list(range(W)) + [W]
    m = len(cand)
    # Prior on where a page may start: sentence starts and clear pauses are
    # favoured, a start mid-phrase with no pause is penalised. The text score
    # must beat this prior to put a boundary somewhere unusual.
    sentence_end = re.compile(r"[.!?\"\u201d]$")
    abbreviation = re.compile(r"^(mr|mrs|ms|dr|st)\.$", re.I)

    def prior(i: int) -> float:
        prev = words[i - 1]["w"]
        sent = bool(sentence_end.search(prev)) and not abbreviation.match(prev)
        gap = pause(i)
        return 1.2 * sent + 0.8 * min(gap, 1.0) - (0.8 if not sent and gap < 0.35 else 0.0)

    bonus = [0.0] + [prior(cand[j]) for j in range(1, m - 1)] + [0.0]

    def seg(p: int, a: int, b: int) -> float:
        return prefix[p][cand[b]] - prefix[p][cand[a]]

    NEG = float("-inf")
    # dp[p][j]: best score with page p starting at cand[j] (pages 0..p-1 placed).
    dp = [[NEG] * m for _ in range(n)]
    back = [[0] * m for _ in range(n)]
    dp[0][0] = 0.0
    for p in range(1, n):
        prev_row, row, brow = dp[p - 1], dp[p], back[p]
        pre = prefix[p - 1]
        # seg(p-1, k, j) = pre[j] - pre[k], so keep a running max of dp - pre.
        run_best, run_arg = NEG, 0
        for j in range(m - 1):
            if prev_row[j] != NEG and prev_row[j] - pre[cand[j]] > run_best:
                run_best, run_arg = prev_row[j] - pre[cand[j]], j
            if run_best != NEG:
                row[j], brow[j] = run_best + pre[cand[j]] + bonus[j], run_arg
    last = max(range(m - 1), key=lambda j: dp[n - 1][j] + seg(n - 1, j, m - 1))
    b = [0] * n
    b[n - 1] = last
    for p in range(n - 1, 0, -1):
        b[p - 1] = back[p][b[p]]

    def word_time(j: int) -> float:
        return words[cand[j]]["s"] if cand[j] < W else duration

    # Refine each boundary to the page's first printed words. The narration
    # sometimes adds lines that are not printed on any page; the DP may give
    # them to the next page, but that page should turn when its own text starts.
    t_tok, t_word = [], []
    for wi, toks in enumerate(word_toks):
        for tok in toks:
            t_tok.append(tok)
            t_word.append(wi)
    first_tok = {}
    for ti, wi in enumerate(t_word):
        first_tok.setdefault(wi, ti)

    def tok_at(wi: int) -> int:
        while wi < W and wi not in first_tok:
            wi += 1
        return first_tok.get(wi, len(t_tok))

    rare = max(2, n // 8)

    def grams_of(toks: list[str]) -> set[tuple]:
        # Only 3-grams with at least one word found on few pages count as
        # evidence; "the little chimes" is on nearly every page.
        return {g for g in (tuple(toks[k:k + 3]) for k in range(len(toks) - 2))
                if any(df.get(t, 0) <= rare for t in g)}

    anchored: dict[int, int] = {}  # page -> offset of the printed 3-gram found at the cue
    for p in range(1, n):
        head = page_tok[p][:12]
        if len(head) < 3:
            continue
        # Window starts after the previous page that has text of its own;
        # picture-only pages may sit on any word, so they do not bound it.
        q = max((k for k in range(1, p) if len(page_tok[k]) >= 3), default=0)
        lo_w = b[q] + 1 if q > 0 else 0
        hi_w = b[p + 1] if p + 1 < n else W
        lo_t, hi_t = tok_at(lo_w), tok_at(hi_w)
        anchor_ti = None
        # The earliest printed 3-gram of the page (by position on the page)
        # that is heard inside the window between the neighbouring pages.
        for offset in range(len(head) - 2):
            g = tuple(head[offset:offset + 3])
            if all(df.get(t, 0) > n / 4 for t in g):
                continue  # e.g. "the little chimes": on most pages, not an anchor
            ti = next((i for i in range(lo_t, hi_t - 2) if tuple(t_tok[i:i + 3]) == g), None)
            if ti is not None:
                anchor_ti = ti
                break
        if anchor_ti is None:
            continue
        aw = t_word[anchor_ti]
        # Step back over the page's first words that were misheard (names such
        # as "Chi Lu" / "Chai Lu"), preferring the first sentence start in that
        # span; failing that, look up to three words further back for one.
        back_to = t_word[max(lo_t, anchor_ti - offset)]
        starts = [w for w in range(back_to, aw + 1) if w == 0 or prior(w) > 0.5]
        if not starts:
            starts = [w for w in range(back_to - 1, max(lo_w, back_to - 3) - 1, -1) if w == 0 or prior(w) > 0.5]
        aw = starts[0] if starts else back_to
        if aw == b[p]:
            anchored[p] = offset
            continue
        if aw < b[p]:
            gap, owner, other = t_tok[tok_at(aw):tok_at(b[p])], q, p
        else:
            gap, owner, other = t_tok[tok_at(b[p]):tok_at(aw)], p, q
        # Move unless the words skipped over look like printed text of the
        # page that currently owns them: at least two shared distinctive
        # 3-grams (one can be chance, e.g. "in front of"), and more than they
        # share with the other page.
        g = grams_of(gap)
        own_hits = len(g & grams_of(page_tok[owner]))
        other_hits = len(g & grams_of(page_tok[other]))
        # When the page's very first printed words were found (offset 0), the
        # skipped words are more likely a phrase repeated later on the page, so
        # demand stronger evidence before refusing to move.
        need = 4 if offset == 0 else 2
        if gap and (own_hits < need or other_hits >= own_hits):
            b[p] = aw
            anchored[p] = offset
        elif abs(tok_at(aw) - tok_at(b[p])) <= 1:
            anchored[p] = offset

    cues: list[dict] = []
    for p in range(n):
        c = {"page": p + 1, "wordIndex": cand[b[p]] if cand[b[p]] < W else None, "note": ""}
        if p == 0:
            c.update(start=0.0, confidence=1.0, note="cover / start of audio")
            cues.append(c)
            continue
        nxt = b[p + 1] if p + 1 < n else m - 1
        own = seg(p, b[p], nxt)
        if b[p] == nxt or own < 1.0 or len(page_tok[p]) < 3:
            c.update(start=None, confidence=0.2, wordIndex=None, note="no narration matched this page's text")
            cues.append(c)
            continue
        # Margin: how much worse the best boundary more than TOLERANCE away is.
        lo, hi = b[p - 1], nxt
        best_v = seg(p - 1, lo, b[p]) + seg(p, b[p], hi) + bonus[b[p]]
        t0 = word_time(b[p])
        alts = [seg(p - 1, lo, j) + seg(p, j, hi) + bonus[j] for j in range(lo, hi + 1) if abs(word_time(j) - t0) > TOLERANCE]
        margin = best_v - max(alts) if alts else 6.0
        conf = 1 - math.exp(-max(margin, 0) / 3)
        conf *= min(1.0, 0.6 + words[cand[b[p]]]["p"])
        note = f"boundary margin {margin:.1f}"
        if p in anchored:
            # The page's own printed words were heard starting at this word.
            conf = max(conf, 0.9 if anchored[p] == 0 else 0.7)
            note += f"; printed text found at cue (word offset {anchored[p]})"
        wi = cand[b[p]]
        prev_end = words[wi - 1]["e"] if wi > 0 else 0.0
        lead = min(LEAD, max(0.0, (words[wi]["s"] - prev_end) / 2))
        c.update(start=round(max(0.01, words[wi]["s"] - lead), 2), confidence=round(conf, 2),
                 wordIndex=wi, note=note)
        cues.append(c)

    # Pages with no narrated text of their own (pictures, a lone speech
    # bubble). If the narration carries on past the previous page's printed
    # text (lines describing the picture), start the page at the first
    # sentence after that text. Otherwise show it briefly just before the
    # next narrated page.
    for i in range(len(cues) - 1, 0, -1):
        c = cues[i]
        if c["start"] is not None:
            continue
        nxt_t = next((x["start"] for x in cues[i + 1:] if x["start"] is not None), duration)
        prv = next(k for k in range(i - 1, -1, -1) if cues[k]["start"] is not None)
        prv_t = cues[prv]["start"]
        placed = None
        if prv > 0 and cues[prv].get("wordIndex") is not None:
            own = grams_of(page_tok[prv])
            lo_t = tok_at(cues[prv]["wordIndex"])
            hi_w = next((w for w in range(W) if words[w]["s"] >= nxt_t), W)
            last = None
            for ti in range(lo_t, tok_at(hi_w) - 2):
                if tuple(t_tok[ti:ti + 3]) in own:
                    last = ti + 2
            if last is not None:
                after = [w for w in range(t_word[last] + 1, hi_w)
                         if prior(w) >= 1.2 and words[w]["s"] < nxt_t - 1.0]
                if after:
                    placed = after[0]
        if placed is not None:
            c.update(start=round(max(prv_t + 0.01, words[placed]["s"] - LEAD), 2), confidence=0.3, wordIndex=placed,
                     note=c["note"] + "; placed at the narration that follows the previous page's printed text")
        else:
            c["start"] = round(nxt_t - min(0.5, (nxt_t - prv_t) / 2), 2)
            c["note"] += "; shown briefly before the next page"
    for a, bb in zip(cues, cues[1:]):
        if bb["start"] <= a["start"]:
            bb["start"] = round(a["start"] + 0.01, 2)
            bb["confidence"] = min(bb["confidence"], 0.2)
            bb["note"] += "; nudged to keep cues increasing"
    for c in cues:
        if c["wordIndex"] is not None:
            c["firstWords"] = " ".join(w["w"] for w in words[c["wordIndex"]: c["wordIndex"] + 6])
        else:
            k = next((i for i, w in enumerate(words) if w["s"] >= c["start"] - 0.05), None)
            c["firstWords"] = " ".join(w["w"] for w in words[k: k + 6]) if k is not None else ""
    return cues


# --------------------------------------------------------------------------
# stage 4: clips, self-check and report


def make_clip(audio: Path, start: float, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [find_tool("ffmpeg"), "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{CLIP_SECONDS}", "-i", str(audio),
         "-ac", "1", "-b:a", "64k", "-map_metadata", "-1", str(out)],
        check=True,
    )


class Onsets(list):
    """Onset times (a list of floats) plus the silence length before each."""

    def __init__(self, items: list[tuple[float, float]]):
        super().__init__(t for t, _ in items)
        self.gap = dict(items)


def speech_onsets(samples, silence_db: float = -35.0, min_silence: float = 0.1) -> Onsets:
    """Times (s) where speech resumes after at least `min_silence` of quiet.

    The same idea as ffmpeg's silencedetect (silence_end), computed on 10 ms
    RMS frames of the 16 kHz samples.
    """
    import numpy as np

    frame = 160
    n = len(samples) // frame
    rms = np.sqrt(np.mean(samples[: n * frame].reshape(n, frame) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < silence_db
    onsets, run = [], 0
    for i, q in enumerate(quiet):
        if q:
            run += 1
        else:
            if run * 0.01 >= min_silence:
                onsets.append((round(i * 0.01, 2), round(run * 0.01, 2)))
            run = 0
    return Onsets(onsets)


def snap_to_onset(t: float, onsets: list[float], before: float, after: float) -> float | None:
    near = [o for o in onsets if t - before <= o <= t + after]
    return min(near, key=lambda o: abs(o - t)) if near else None


def self_check(audio: Path, cues: list[dict], clip_dir: Path, model_name: str, onsets: list[float]) -> None:
    """Independent faster-whisper pass per cue.

    * Transcribes the 4-second review clip and records its text.
    * Transcribes a window from 5 s before to 5 s after the cue and finds the
      page's first heard words there (allowing the first one or two words, often
      a name, to be misheard), then snaps that word's start to the nearest
      speech onset in the audio. The error is that onset minus the cue time
      (positive: the page turns just before the word, as intended).
    """
    from faster_whisper import WhisperModel

    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    samples = load_audio(audio)
    for c in cues:
        clip = clip_dir / f"p{c['page']:03d}.mp3"
        segs, _ = model.transcribe(load_audio(clip), language="en", word_timestamps=False, vad_filter=False)
        c["clipText"] = " ".join(s.text.strip() for s in segs)
        c["checkWord"] = None
        c["error"] = None
        w0 = max(0.0, c["start"] - 5.0)
        window = samples[int(w0 * 16000): int((c["start"] + 5.0) * 16000)]
        segs, _ = model.transcribe(window, language="en", word_timestamps=True, vad_filter=False)
        heard = [(tokens(w.word), float(w0 + w.start)) for s in segs for w in s.words]
        flat = [(tok, t, i) for i, (toks, t) in enumerate(heard) for tok in toks]
        # The page's first heard words (from the alignment transcript) with
        # each token's offset from the first word's start.
        target = [tok for tok, _ in c.get("firstTokens", [])][:6]
        rel = [dt for _, dt in c.get("firstTokens", [])][:6]
        found = None
        # Match two consecutive words starting at target word k (the first
        # word or two, often a name, may be misheard), then step back by that
        # pair's offset from the first word.
        for k in range(0, max(1, len(target) - 1)):
            pair = target[k:k + 2]
            hits = [j for j in range(len(flat) - len(pair) + 1) if [f[0] for f in flat[j:j + len(pair)]] == pair]
            if hits:
                j = min(hits, key=lambda j: abs(flat[j][1] - rel[k] - c["start"]))
                found = (flat[j][0], flat[j][1] - rel[k])
                break
        if found:
            t = found[1]
            # Whisper word starts tend to fall early, at the end of the previous
            # word; take the first speech onset from just before that point.
            later = [o for o in onsets if t - 0.2 <= o <= t + 1.0]
            onset = later[0] if later else snap_to_onset(t, onsets, 0.5, 0.5)
            c["checkWord"] = found[0]
            c["error"] = round(float((onset if onset is not None else t) - c["start"]), 2)
            c["rawError"] = round(float(t - c["start"]), 2)
        print(f"  check p{c['page']:03d} cue={c['start']:.2f} err={c['error']} clip='{c['clipText'][:50]}'", flush=True)


def write_report(slug: str, data: dict, cues: list[dict], page_text: list[str], out_dir: Path, check_model: str) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    errors = [abs(c["error"]) for c in cues[1:] if c.get("error") is not None]
    raw = [abs(c["rawError"]) for c in cues[1:] if c.get("rawError") is not None]
    summary = {
        "checked": len(errors),
        "median": round(statistics.median(errors), 2) if errors else None,
        "max": round(max(errors), 2) if errors else None,
        "withinTolerance": int(sum(e <= TOLERANCE for e in errors)),
        "rawMedian": round(statistics.median(raw), 2) if raw else None,
        "rawMax": round(max(raw), 2) if raw else None,
        "lowConfidence": [c["page"] for c in cues if c["confidence"] < 0.5],
        "outOfTolerance": [c["page"] for c in cues[1:] if c.get("error") is None or abs(c["error"]) > TOLERANCE],
    }
    summary["flaggedButAtPauseOnset"] = [p for p in summary["outOfTolerance"] if cues[p - 1].get("pauseConfirmed")]
    summary["unresolved"] = [p for p in summary["outOfTolerance"] if not cues[p - 1].get("pauseConfirmed")]
    summary["listenFirst"] = sorted(set(summary["lowConfidence"]) | set(summary["outOfTolerance"]))
    with open(out_dir / "cues.csv", "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["page", "start", "confidence", "check_error_s", "within_0_5s", "whisper_only_error_s", "cue_before_pause_onset", "first_words_heard", "clip_transcript", "page_text_start", "note", "clip"])
        for c, text in zip(cues, page_text):
            err = c.get("error")
            wr.writerow([c["page"], f"{c['start']:.2f}", c["confidence"], "" if err is None else err,
                         "" if err is None else ("yes" if abs(err) <= TOLERANCE else "NO"),
                         c.get("rawError", ""), {True: "yes", False: "no"}.get(c.get("pauseConfirmed"), ""),
                         c.get("firstWords", ""), c.get("clipText", ""), " ".join(text.split()[:12]), c.get("note", ""),
                         f"clips/p{c['page']:03d}.mp3"])
    rows = []
    for c, text in zip(cues, page_text):
        err = c.get("error")
        bad = c["page"] > 1 and (err is None or abs(err) > TOLERANCE)
        low = c["confidence"] < 0.5
        cls = " class=\"flag\"" if bad or low else ""
        err_txt = "n/a" if err is None else f"{err:+.2f}"
        rows.append(
            f"<tr{cls}><td><a href=\"../../../public/books/{slug}/p{c['page']:03d}.webp\">{c['page']}</a></td>"
            f"<td>{c['start']:.2f}</td><td>{c['confidence']:.2f}</td><td>{err_txt}{' &#9888;' if bad and c['page'] > 1 else ''}</td><td>{'' if c.get('rawError') is None else f"{c['rawError']:+.2f}"}</td><td>{ {True: 'yes', False: 'no'}.get(c.get('pauseConfirmed'), '') }</td>"
            f"<td><audio controls preload=\"none\" src=\"clips/p{c['page']:03d}.mp3\"></audio></td>"
            f"<td>{html.escape(c.get('firstWords', ''))}</td><td>{html.escape(c.get('clipText', ''))}</td>"
            f"<td>{html.escape(' '.join(text.split()[:14]))}</td><td>{html.escape(c.get('note', ''))}</td></tr>"
        )
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cue review: {html.escape(slug)}</title>
<style>
:root {{ --bg:#fff; --fg:#1b1b1b; --muted:#666; --line:#ddd; --flag:#fff3cd; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#141414; --fg:#eee; --muted:#aaa; --line:#333; --flag:#4a3b00; }} }}
body {{ background:var(--bg); color:var(--fg); font:15px/1.45 system-ui, sans-serif; margin:0; padding:16px; }}
table {{ border-collapse:collapse; width:100%; }} th, td {{ border-bottom:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top; }}
tr.flag {{ background:var(--flag); }} .muted {{ color:var(--muted); }} audio {{ width:180px; height:32px; }}
.wrap {{ overflow-x:auto; }}
</style></head><body>
<h1>Cue review: {html.escape(slug)}</h1>
<p>Audio <code>{html.escape(data['audio'])}</code>, {data['duration']:.2f} s, {data['pageCount']} pages. Method: {html.escape(data['method'])}.</p>
{''.join(f'<p><strong>Warning:</strong> {html.escape(w)}</p>' for w in data.get('warnings', []))}
<p><strong>verified: {str(data['verified']).lower()}</strong>. Listen to each clip: it starts exactly at the cue, so the page's first word should begin within half a second. When every page sounds right, set <code>"verified": true</code> in <code>content/story-cues/{html.escape(slug)}.json</code>.</p>
<p>Self-check (independent faster-whisper {html.escape(check_model)} pass, first heard word vs cue, pages 2 to {data['pageCount']}):
median |error| {summary['median']} s, max {summary['max']} s, {summary['withinTolerance']} of {summary['checked']} checked cues within &plusmn;{TOLERANCE} s.
The check finds the page's first words with the {html.escape(check_model)} model in a 10-second window around the cue and snaps the word start to the first speech onset in the audio (energy, as ffmpeg silencedetect); the whisper word start alone gives median {summary['rawMedian']} s, max {summary['rawMax']} s.
Positive error means the page turns just before the word. "At pause onset" is a whisper-free check: the cue sits at most 0.3 s before speech that resumes after a pause of 0.3 s or more.
Highlighted rows: confidence below 0.5, or check error unknown or beyond &plusmn;{TOLERANCE} s.</p>
<p><strong>Listen to these first:</strong> {', '.join(map(str, summary['listenFirst'])) or 'none'}.
Low confidence: {', '.join(map(str, summary['lowConfidence'])) or 'none'}.
Check error beyond &plusmn;{TOLERANCE} s but the cue is at a pause onset (most likely a whisper timing slip in the check): {', '.join(map(str, summary['flaggedButAtPauseOnset'])) or 'none'}.
Not confirmed within &plusmn;{TOLERANCE} s by either check: {', '.join(map(str, summary['unresolved'])) or 'none'}.</p>
<p class="muted">Confidence comes from the alignment: 0.9 when the page's first printed words were heard exactly at the cue, lower when the boundary rests on weaker text evidence, 0.4 for picture-only pages placed from the YouTube page turn, 0.2 or less for pages placed by fallback. Page 1 (the cover) always starts at 0; where the narration begins with page 2's words, page 2's cue is a few hundredths of a second in.</p>
<div class="wrap"><table><thead><tr><th>Page</th><th>Cue (s)</th><th>Confidence</th><th>Check error (s)</th><th>Whisper-only (s)</th><th>At pause onset</th><th>Clip</th><th>First words (transcript)</th><th>Clip transcript</th><th>Page text (OCR)</th><th>Note</th></tr></thead>
<tbody>
{chr(10).join(rows)}
</tbody></table></div>
<p class="muted">Generated by scripts/align-story-cues.py. CSV: <a href="cues.csv">cues.csv</a>.</p>
</body></html>
"""
    (out_dir / "index.html").write_text(page, encoding="utf-8")
    return summary


# --------------------------------------------------------------------------
# repeated narration and YouTube page timing


def detect_repeat(words: list[dict], run: int = 12, min_len: int = 60) -> int | None:
    """Index of the first word of a long repeated passage, if the mp3 has one.

    Returns the start of the second copy when at least `min_len` words (in
    runs of `run`) re-occur later in the narration, as happens when a render
    appended part of the story twice.
    """
    toks = ["".join(tokens(w["w"])) for w in words]
    seen: dict[tuple, int] = {}
    hits = []
    for i in range(len(toks) - run):
        key = tuple(toks[i:i + run])
        if key in seen and i - seen[key] > run:
            hits.append(i)
        else:
            seen.setdefault(key, i)
    if len(hits) >= min_len:
        return hits[0]
    return None


# Where each page was visible in the original YouTube story videos (seconds).
# Copied from the old storyPageTiming table in app/read/[slug]/page.jsx: page
# i was on screen at samples[i], so its turn lies in (samples[i-1], samples[i]].
YOUTUBE = {
    "funny-fah-learns-when-to-stop": ("OAu1PmILqeA", [2, 15, 39, 69, 95, 110, 127, 140, 153, 172, 183, 198, 215, 230, 250, 278, 302, 326, 354, 371, 379, 406, 417, 448, 458, 484, 492, 516, 530, 544, 566, 587, 609, 636]),
    "imaginative-little-mee": ("ZwzVEIQp3Cw", [2, 16, 31, 48, 65, 84, 104, 123, 138, 161, 183, 199, 207, 224, 240, 245, 252, 265, 301, 335, 361, 392, 426, 452, 473, 488, 507, 522, 537]),
}


def youtube_page_times(slug: str, words: list[dict], cache: Path) -> list[float | None] | None:
    """Estimate each page's start in the mp3 from the YouTube video.

    Scene changes (ffmpeg) give the exact page turns in the video; the auto
    captions give what was being said at each turn; aligning the captions to
    the mp3 transcript maps that moment into the mp3. Used for picture-only
    pages that have no text to align.
    """
    if slug not in YOUTUBE:
        return None
    vid, samples = YOUTUBE[slug]
    d = cache / "youtube"
    d.mkdir(parents=True, exist_ok=True)
    video, subs = d / f"{vid}.mp4", d / f"{vid}.en.json3"
    base = [sys.executable, "-m", "yt_dlp", "--js-runtimes", "node", "--extractor-args",
            "youtube:player_client=android_vr", "--ffmpeg-location", str(Path(find_tool("ffmpeg")).parent),
            "-o", str(d / "%(id)s.%(ext)s")]
    try:
        if not subs.exists():
            subprocess.run(base + ["--skip-download", "--write-auto-subs", "--sub-langs", "en", "--sub-format", "json3",
                                   f"https://www.youtube.com/watch?v={vid}"], check=True, capture_output=True)
        if not video.exists():
            subprocess.run(base + ["-f", "worst[ext=mp4]/worst", f"https://www.youtube.com/watch?v={vid}"],
                           check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        print(f"  youtube download failed for {vid}: {exc}", flush=True)
        return None

    scene_file = d / f"{vid}.scenes.json"
    if scene_file.exists():
        scenes = json.loads(scene_file.read_text())
    else:
        out = subprocess.run([find_tool("ffmpeg"), "-hide_banner", "-i", str(video), "-an", "-vf",
                              "select='gt(scene,0.25)',showinfo", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
        scenes = [float(x) for x in re.findall(r"pts_time:([0-9.]+)", out)]
        scene_file.write_text(json.dumps(scenes))

    cap = []  # (token, time in video)
    for ev in json.loads(subs.read_text(encoding="utf-8")).get("events", []):
        t0 = ev.get("tStartMs", 0)
        for seg in ev.get("segs") or []:
            for tok in tokens(seg.get("utf8", "")):
                cap.append((tok, (t0 + seg.get("tOffsetMs", 0)) / 1000))
    t_tok, t_word = [], []
    for wi, w in enumerate(words):
        for tok in tokens(w["w"]):
            t_tok.append(tok)
            t_word.append(wi)

    sm = difflib.SequenceMatcher(None, [c[0] for c in cap], t_tok, autojunk=False)
    cap_to_mp3 = {}
    for a, b, size in sm.get_matching_blocks():
        if size >= 2:
            for k in range(size):
                cap_to_mp3[a + k] = t_word[b + k]

    times: list[float | None] = [0.0]
    for i in range(1, len(samples)):
        inside = [s for s in scenes if samples[i - 1] < s <= samples[i]]
        turn = inside[0] if inside else (samples[i - 1] + samples[i]) / 2
        k = next((j for j, c in enumerate(cap) if c[1] >= turn - 0.3), None)
        mapped = None
        if k is not None:
            nxt = next((j for j in range(k, min(k + 15, len(cap))) if j in cap_to_mp3), None)
            prv = next((j for j in range(k - 1, max(k - 15, -1), -1) if j in cap_to_mp3), None)
            if nxt is not None and prv is not None:
                # Interpolate in mp3 time between the matched words around the turn.
                tp, tn = words[cap_to_mp3[prv]]["e"], words[cap_to_mp3[nxt]]["s"]
                cp, cn = cap[prv][1], cap[nxt][1]
                frac = 0.5 if cn <= cp else min(1.0, max(0.0, (turn - cp) / (cn - cp)))
                mapped = round(tp + frac * (tn - tp), 2)
            elif nxt is not None:
                mapped = words[cap_to_mp3[nxt]]["s"]
        times.append(mapped)
    return times


# --------------------------------------------------------------------------


def run(slug: str, args) -> dict:
    audio_url = STORIES[slug]
    audio = ROOT / "public" / audio_url.lstrip("/")
    manifest = json.loads((ROOT / "public" / "books" / slug / "manifest.json").read_text(encoding="utf-8"))
    page_count = manifest["pageCount"]
    cache = Path(args.cache)
    print(f"{slug}: {page_count} pages, {audio.name}", flush=True)

    ocr = ocr_pages(slug, page_count, cache)
    texts = page_texts(ocr)
    (cache / slug / "pages.json").write_text(json.dumps(texts, indent=1), encoding="utf-8")
    words, engine = transcribe(slug, audio, args.model, cache)
    duration = duration_of(audio)
    warnings = []
    rep = detect_repeat(words)
    align_words, align_end = words, duration
    if rep is not None:
        align_words, align_end = words[:rep], words[rep]["s"]
        warnings.append(
            f"The mp3 repeats part of the story from {words[rep]['s']:.1f} s to the end. Cues follow the first "
            f"reading, so the last page stays up while the repeat plays; trim the audio at about "
            f"{words[rep]['s']:.1f} s (then rerun this script) or re-render it.")
        print(f"  {warnings[-1]}", flush=True)
    cues = align(texts, align_words, align_end)

    # Picture-only pages: place them where the YouTube video turned to them.
    yt = youtube_page_times(slug, align_words, cache / slug)
    used_youtube = False
    if yt:
        def phrase_start(t: float) -> float:
            starts = [w["s"] for i, w in enumerate(align_words)
                      if i == 0 or w["s"] - align_words[i - 1]["e"] >= 0.2 or re.search(r"[.!?]$", align_words[i - 1]["w"])]
            return min(starts, key=lambda x: abs(x - t))

        for i, c in enumerate(cues):
            if i == 0 or "no narration matched" not in c["note"] or yt[i] is None:
                continue
            t = phrase_start(yt[i])
            prv, nxt = cues[i - 1]["start"], cues[i + 1]["start"] if i + 1 < len(cues) else align_end
            if prv + 0.5 < t < nxt - 0.5:
                c.update(start=round(max(0.01, t - LEAD), 2), confidence=0.4, note="picture page placed from the YouTube page turn")
                k = next(j for j, w in enumerate(align_words) if w["s"] >= t - 0.01)
                c["wordIndex"] = k
                c["firstWords"] = " ".join(w["w"] for w in align_words[k: k + 6])
                used_youtube = True
            else:
                c["note"] += f"; YouTube turn ({t:.1f} s) fell outside its neighbours"

    # Silence snapping: pull each text-anchored cue to the speech onset just
    # before its first word (whisper word starts can lag the onset).
    onsets = speech_onsets(load_audio(audio))
    for i in range(1, len(cues)):
        c = cues[i]
        if c.get("wordIndex") is None:
            continue
        w = align_words[c["wordIndex"]]
        prev_end = align_words[c["wordIndex"] - 1]["e"] if c["wordIndex"] > 0 else 0.0
        onset = snap_to_onset(w["s"], onsets, 0.6, 0.3)
        if onset is None:
            # Whisper sometimes stretches the first word back over a pause;
            # then speech really starts at an onset inside that word.
            inside = [o for o in onsets if w["s"] + 0.3 < o < w["e"]]
            onset = inside[0] if inside else None
        if onset is not None and onset >= prev_end - 0.05:
            start = round(max(0.01, onset - 0.1), 2)
            nxt = cues[i + 1]["start"] if i + 1 < len(cues) else align_end
            if cues[i - 1]["start"] < start < nxt:
                c["start"] = start
                c["note"] += "; snapped to speech onset"

    starts = [c["start"] for c in cues]
    assert starts[0] == 0 and all(b > a for a, b in zip(starts, starts[1:])) and starts[-1] < duration, starts

    method = (f"OCR page text (RapidOCR) segmented against {engine} word timestamps "
              f"(IDF-weighted dynamic programming refined to each page's first printed words), cues snapped to speech onsets (silence detection)")
    if used_youtube:
        method += "; picture-only pages placed from YouTube caption timing and ffmpeg scene changes"
    if any("placed at the narration that follows" in c["note"] for c in cues):
        method += "; other pages without narrated text start at the unprinted narration after the previous page's text"
    if any("shown briefly" in c["note"] for c in cues):
        method += "; remaining pages without narration shown briefly before the next page (low confidence)"
    data = {
        "slug": slug,
        "audio": audio_url,
        "audioSha256": sha256(audio),
        "duration": round(duration, 3),
        "pageCount": page_count,
        "verified": False,
        "method": method,
        **({"warnings": warnings} if warnings else {}),
        "cues": [{"page": c["page"], "start": c["start"], "confidence": c["confidence"], "firstWords": c["firstWords"]} for c in cues],
    }
    out = ROOT / "content" / "story-cues" / f"{slug}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    report_dir = ROOT / "docs" / "cue-review" / slug
    clip_dir = report_dir / "clips"
    if clip_dir.exists():
        shutil.rmtree(clip_dir)
    for c in cues:
        make_clip(audio, c["start"], clip_dir / f"p{c['page']:03d}.mp3")
    for c in cues:
        k0 = c.get("wordIndex")
        if k0 is None:
            k0 = next((i for i, w in enumerate(align_words) if w["s"] >= c["start"] - 0.05), None)
        c["firstTokens"] = []
        if k0 is not None:
            for w in align_words[k0:k0 + 6]:
                for tok in tokens(w["w"]):
                    c["firstTokens"].append((tok, round(w["s"] - align_words[k0]["s"], 2)))
    if not args.skip_check:
        self_check(audio, cues, clip_dir, args.check_model, onsets)
    for c in cues[1:]:
        # Independent of whisper: the cue sits just before speech that resumes
        # after a clear pause (>= 0.3 s), i.e. at a phrase start.
        c["pauseConfirmed"] = any(c["start"] < o <= c["start"] + 0.3 and onsets.gap[o] >= 0.3 for o in onsets)
    summary = write_report(slug, data, cues, texts, report_dir, args.check_model)
    print(f"{slug}: {json.dumps(summary)}", flush=True)
    return summary


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--slug", action="append", choices=sorted(STORIES), help="story to align (default: all four)")
    ap.add_argument("--model", default="small", help="whisper model for the alignment transcript")
    ap.add_argument("--check-model", default="small", help="faster-whisper model for the independent self-check")
    ap.add_argument("--cache", default=str(Path(tempfile.gettempdir()) / "align-story-cues"))
    ap.add_argument("--skip-check", action="store_true", help="skip the faster-whisper self-check")
    args = ap.parse_args()
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    results = {slug: run(slug, args) for slug in (args.slug or STORIES)}
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
