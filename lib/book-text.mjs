// Text clean-up for content/book-text/<slug>.pages.json (written by
// scripts/extract-text.mjs). Pure functions so node --test can check them.
//
// A page is stored as one string; paragraphs are separated by "\n".

const PAGE_NUMBER = /^(page\s*)?\d{1,3}$/i;

/** Normalises characters: spaces, OCR bars for "I", dashes, stray quotes. */
export function cleanLine(line) {
  return String(line)
    .replace(/ /g, " ")
    .replace(/，/g, ", ")
    .replace(/([.?!"”])\s+\d{1,3}$/, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/(^|\s)\|(?=\s|$)/g, "$1I")
    .replace(/^(?:[e°¢•*]|[-—–])\s+(?=[A-Z(])/, "")
    .replace(/\s*[—–]\s*/g, " - ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

/**
 * True for OCR noise: word-search grids, scattered letters, symbol runs and
 * bare page numbers. Real lines keep most of their characters as letters and
 * contain at least one word of three or more letters with a vowel.
 */
export function isNoise(line) {
  const text = line.trim();
  if (!text) return true;
  if (PAGE_NUMBER.test(text)) return true;
  // Grid rules read as | / { } [ ] in word searches and crosswords.
  if ((text.match(/[|/{}[\]\\]/g) || []).length >= 3 || text.includes("\\")) return true;
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  if (letters / text.replace(/\s/g, "").length < 0.5) return true;
  const tokens = text.split(/\s+/);
  const singles = tokens.filter((t) => t.replace(/[^A-Za-z]/g, "").length === 1).length;
  if (tokens.length >= 4 && singles / tokens.length >= 0.5) return true;
  if (!/[A-Za-z]*[aeiouyAEIOUY][A-Za-z]*/.test(text) || !tokens.some((t) => /^[A-Za-z'’]{2,}/.test(t) && /[aeiouy]/i.test(t))) return true;
  return false;
}

/**
 * Removes lines that repeat on many pages (running heads, footers such as
 * "May be reproduced in schools"), which would otherwise be read on every page.
 */
export function dropRepeated(pages) {
  const key = (l) => l.toLowerCase().replace(/[^a-z]+/g, " ").trim();
  const counts = new Map();
  for (const lines of pages) {
    for (const k of new Set(lines.map(key))) if (k) counts.set(k, (counts.get(k) || 0) + 1);
  }
  const limit = Math.max(3, Math.ceil(pages.length / 4));
  return pages.map((lines) => lines.filter((l) => (counts.get(key(l)) || 0) < limit));
}

/** Joins layout lines into paragraphs: a line that does not end a sentence runs on into a lower-case one. */
export function toParagraphs(lines) {
  const out = [];
  for (const line of lines) {
    const prev = out.at(-1);
    if (prev && !/[.?!:;"”)]$/.test(prev) && /^[a-z(]/.test(line)) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out;
}

const wordsOf = (line) => line.toLowerCase().match(/[a-z]+(?:['’][a-z]+)?/g) || [];

/**
 * OCR garbage that survives isNoise ("SRZSESORSEOGES tae kes.") is mostly
 * made of short lines whose words occur once in the whole book. A line of
 * three words or fewer is kept when at least a third of its words occur twice
 * or more in the book. Longer lines are always kept.
 */
export function dropUnknown(pages) {
  const freq = new Map();
  for (const lines of pages) for (const l of lines) for (const w of wordsOf(l)) freq.set(w, (freq.get(w) || 0) + 1);
  return pages.map((lines) =>
    lines.filter((l) => {
      const words = wordsOf(l);
      if (!words.length) return false;
      if (l.split(/\s+/).length > 3) return true;
      const known = words.filter((w) => (freq.get(w) || 0) >= 2).length;
      return known / words.length >= 1 / 3;
    })
  );
}

/**
 * Full clean of every page: lines in, one string per page out.
 * `source` "ocr" (the illustrated stories) skips dropUnknown: a short story
 * uses most of its words once, and its OCR has no grid noise to remove.
 */
export function cleanPages(pagesOfLines, { source = "pdf-text" } = {}) {
  let pages = pagesOfLines.map((lines) => lines.map(cleanLine).filter((l) => !isNoise(l)));
  if (source !== "ocr") pages = dropUnknown(pages);
  return dropRepeated(pages).map((lines) => toParagraphs(lines).join("\n"));
}

/** Paragraphs of one stored page. */
export function paragraphs(pageText) {
  return String(pageText || "").split("\n").map((p) => p.trim()).filter(Boolean);
}
