"""OCR helper for scripts/extract-text.mjs.

Reads page images (the story books have no text layer) with RapidOCR and
prints JSON to stdout: a list with one string per page, in reading order.

- Lines are grouped into rows by their vertical centre, then read left to right.
- Low-confidence boxes (score < 0.5) are dropped.
- Run-on words, which RapidOCR produces for tightly set bold text
  ("inapalacefaraway"), are split into known words using a vocabulary built
  from the optional --vocab text file(s) plus short, properly spaced OCR words.

Usage: python scripts/ocr-pages.py [--vocab file.txt ...] page1.webp page2.webp ...
Requires: rapidocr_onnxruntime (pip install rapidocr_onnxruntime), Pillow.
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
import tempfile
from pathlib import Path


def rows_of(lines: list[dict]) -> list[list[dict]]:
    rows: list[list[dict]] = []
    for l in sorted(lines, key=lambda l: l["y"] + l["h"] / 2):
        yc = l["y"] + l["h"] / 2
        if rows:
            prev = rows[-1][0]
            if abs(yc - (prev["y"] + prev["h"] / 2)) < 0.5 * max(l["h"], prev["h"]):
                rows[-1].append(l)
                continue
        rows.append([l])
    return [sorted(r, key=lambda l: l["x"]) for r in rows]


def segment(word: str, vocab: set[str]) -> str:
    """Split a run-on word into vocabulary words; keep it when no good split exists."""
    core = re.sub(r"[^A-Za-z]", "", word)
    low = core.lower()
    if len(low) < 5 or low in vocab:
        return word
    n = len(low)
    best: list[tuple[float, list[str]] | None] = [(0.0, [])] + [None] * n
    for i in range(1, n + 1):
        for j in range(max(0, i - 16), i):
            piece = low[j:i]
            if best[j] is None or piece not in vocab:
                continue
            if len(piece) == 1 and piece not in ("a", "i"):
                continue
            score = best[j][0] + len(piece) ** 2
            if best[i] is None or score > best[i][0]:
                best[i] = (score, best[j][1] + [piece])
    if best[n] is None or len(best[n][1]) < 2:
        return word
    pieces = best[n][1]
    # Re-apply the original capitals letter by letter, then keep punctuation
    # that trailed or led the word.
    out, k = [], 0
    for p in pieces:
        out.append(core[k:k + len(p)])
        k += len(p)
    lead = re.match(r"^[^A-Za-z]*", word).group(0)
    trail = re.search(r"[^A-Za-z]*$", word).group(0)
    return lead + " ".join(out) + trail


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vocab", action="append", default=[])
    ap.add_argument("images", nargs="+")
    args = ap.parse_args()

    from rapidocr_onnxruntime import RapidOCR
    from PIL import Image

    engine = RapidOCR()
    pages_lines: list[list[dict]] = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, img in enumerate(args.images):
            png = Path(tmp) / f"p{i:03d}.png"
            Image.open(img).convert("RGB").save(png)
            result, _ = engine(str(png))
            lines = []
            for box, text, score in result or []:
                if score < 0.5:
                    continue
                ys = [p[1] for p in box]
                xs = [p[0] for p in box]
                lines.append({"text": text.strip(), "y": min(ys), "x": min(xs), "h": max(ys) - min(ys)})
            pages_lines.append(lines)
            print(f"  ocr {Path(img).name}: {len(lines)} lines", file=sys.stderr, flush=True)

    vocab: set[str] = set()
    for f in args.vocab:
        vocab.update(re.findall(r"[a-z]+", Path(f).read_text(encoding="utf-8").lower()))
    # The transcripts are American automatic captions; the books are printed
    # in Australian spelling ("colour", "favourite").
    vocab.update({w.replace("or", "our") for w in vocab if "or" in w and len(w) > 4})
    # Short OCR words that were set with spaces are safe to add; longer ones
    # may themselves be run-ons ("funnyfah"), so they come only from --vocab.
    for lines in pages_lines:
        for l in lines:
            if len(l["text"].split()) > 1:
                vocab.update(w for w in re.findall(r"[a-z]+", l["text"].lower()) if len(w) <= 4)

    out = []
    for lines in pages_lines:
        text_rows = []
        for row in rows_of(lines):
            text = " ".join(l["text"] for l in row).replace("，", ", ")
            text = " ".join(segment(w, vocab) for w in text.split())
            text_rows.append(text)
        out.append("\n".join(text_rows))
    sys.stdout.buffer.write(json.dumps(out, ensure_ascii=False).encode("utf-8"))


if __name__ == "__main__":
    main()
