// Text clean-up for content/book-text/<slug>.pages.json (written by
// scripts/extract-text.mjs). Pure functions so node --test can check them.
//
// A page is stored as one string; paragraphs are separated by "\n".

/* "17", "Page6", a lone "Page", and OCR'd page heads such as "Poge 9" or "Page I!". */
const PAGE_NUMBER = /^(?:p[aoe]ge\s*[\dIl!|]{0,3}[.!]?|\d{1,3})$/i;

/* Running footers of the textbooks, wherever the text layer puts them in a line. */
const FOOTERS = [
  /[©“"=-]?\s*A[.,]\s*(?:R\.\s*)?Gillon\.?\s*(?=Published)/gi,
  /Published by Modern Teaching A[il]d[sa]\s+P\w+\.?\s+[\w.]+/g,
  /M[aoe]y be rep\w*\s+in\s+schoo\w*\s+\w+\s+non[\s-]*commer\s*c\w*\s*u\w*/gi,
  /\bP\w{2,3}\s+\S{1,3}\s*[=-]?\s*RID\w*\s+WITH\s+LANGUAGE\b/gi,
  /\bRID\w*\s+WITH\s+LANGUAGE\s*[“"=]?\s*A[.,]?\s*Gill[oe]n\b/gi,
];

/* A piece of a footer the text layer broke over lines ("in schools for non commercial use"). */
const FOOTER_BIT =
  /reproduced|roduced [Ii]n schoo|non[\s-]*commer|Modern Teaching|M[aoe]y be rep|P[rta]y\s+U?[Llm]i?[mr]?n?ited|^\W*RID\w*\s+WITH\s+LANGUAGE\W*$|^[©“"=]?\s*A[.,]?\s+Gill[oe]n$|^Published by$/;

/** Removes the textbooks' running footers from a line. */
export function stripFooters(line) {
  let s = String(line);
  for (const re of FOOTERS) s = s.replace(re, " ");
  if (FOOTER_BIT.test(s) && s.trim().split(/\s+/).length <= 12) return "";
  return s.replace(/\s[=–-]\s*$/, "").replace(/^\s*[=–-]\s/, "").replace(/\s{2,}/g, " ").trim();
}

/* Two-letter words that are real; any other one- or two-letter token in a
   worksheet line is usually a scrap of a word search or a rotated label. */
const SHORT_WORDS = new Set("a i am an as at be by do go he hi if in is it me my no of oh ok on or so to up us we mr dr tv".split(" "));

/* Dot-leader debris ("hat.......cceeeeeeeseeerseeetes"): a token made mostly of c and e. */
function isLeaderDebris(token) {
  const letters = token.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4) return false;
  return (letters.match(/[ce]/gi) || []).length / letters.length >= 0.6;
}

/** Drops dot-leader debris from a line that has a leader or fill-in dots. */
export function dropLeaderDebris(line) {
  if (!line.includes("...")) return line;
  return line
    .split(/\s+/)
    .map((t) => {
      if (!t.includes("...")) return isLeaderDebris(t) ? "" : t;
      /* "hat...cceeees": keep the word and the dots, drop what follows them. */
      const [head, ...rest] = t.split("...");
      const tail = rest.join("...");
      return isLeaderDebris(tail) || !/[A-Za-z]{2}/.test(tail) ? `${head}...` : t;
    })
    .filter(Boolean)
    .join(" ");
}

/** Normalises characters: spaces, OCR bars for "I", dashes, stray quotes. */
export function cleanLine(line) {
  return String(line)
    .replace(/ /g, " ")
    .replace(/，/g, ", ")
    .replace(/([.?!"”])\s+\d{1,3}$/, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/(^|[\s“"(])\|(?=[\s?.,!’'”]|$)/g, "$1I")
    .replace(/(^|[\s“"‘'(])\|am\b/g, "$1I am")
    .replace(/(^|[\s“"‘'(])\|(?=[a-z])/g, "$1I")
    .replace(/(^|[\s“"‘'(])\|(?=\s+[A-Z][a-z])/g, "$1I")
    .replace(/\.{4,}/g, "...")
    .replace(/([?!])\s+[A-Za-z]{1,2}$/, "$1")
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
  if ((text.match(/[{}[\]]/g) || []).length >= 2) return true;
  const letters = (text.match(/[A-Za-z]/g) || []).length;
  if (letters / text.replace(/\s/g, "").length < 0.5) return true;
  const tokens = text.split(/\s+/);
  const singles = tokens.filter((t) => t.replace(/[^A-Za-z]/g, "").length === 1).length;
  if (tokens.length >= 4 && singles / tokens.length >= 0.5) return true;
  if (!/[A-Za-z]*[aeiouyAEIOUY][A-Za-z]*/.test(text) || !tokens.some((t) => /^[A-Za-z'’]{2,}/.test(t) && /[aeiouy]/i.test(t))) return true;
  // Scraps: fewer than three letters ("Ss", "po"), or a bare list marker ("iii)").
  if (letters < 3 || /^\(?[ivx]{1,4}[).]$/i.test(text)) return true;
  // Mostly one- and two-letter fragments that are not words: a rotated label
  // or a word-search row read across ("Co t m he ple R t I e DDLE").
  const words = tokens.map((t) => t.replace(/[^A-Za-z]/g, "")).filter(Boolean);
  const scraps = words.filter((w) => w.length <= 2 && !SHORT_WORDS.has(w.toLowerCase())).length;
  if (words.length >= 3 && scraps / words.length > 0.3) return true;
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
  let pages = pagesOfLines.map((lines) =>
    lines
      .map((l) => dropLeaderDebris(cleanLine(stripFooters(l))))
      .filter((l) => !isNoise(l))
      /* Bars left after the noise check are box rules beside real words. */
      .map((l) => l.replace(/\s*\|+\s*/g, " ").trim())
      .filter((l) => !isNoise(l))
  );
  if (source !== "ocr") pages = splitRunOns(dropUnknown(pages));
  return dropRepeated(pages).map((lines) => toParagraphs(lines).join("\n"));
}

const RUN_ON = /[A-Za-z]{14,}/g;

/**
 * Words the text layer ran together ("schoolsfornoncommercialuse"): a run of
 * 16 or more letters, or 14 or more with a case change inside ("AidsPty"),
 * is split into words the book uses elsewhere (each at least twice), fewest
 * pieces first. A run that cannot be split that way is dropped when it has a
 * case change or 18 or more letters (OCR debris), and kept otherwise.
 */
export function splitRunOns(pages) {
  const freq = new Map();
  for (const lines of pages) for (const l of lines) for (const w of wordsOf(l)) freq.set(w, (freq.get(w) || 0) + 1);
  const known = (w) => w === "a" || w === "i" || (w.length >= 2 && (freq.get(w) || 0) >= 2);
  const split = (run) => {
    const s = run.toLowerCase();
    const best = new Array(s.length + 1).fill(null);
    best[0] = [];
    for (let end = 1; end <= s.length; end += 1) {
      for (let start = Math.max(0, end - 20); start < end; start += 1) {
        if (!best[start] || !known(s.slice(start, end))) continue;
        const cand = [...best[start], [start, end]];
        if (!best[end] || cand.length < best[end].length) best[end] = cand;
      }
    }
    return best[s.length] ? best[s.length].map(([a, b]) => run.slice(a, b)).join(" ") : null;
  };
  return pages.map((lines) =>
    lines
      .map((l) =>
        l
          .replace(RUN_ON, (run) => {
            if ((freq.get(run.toLowerCase()) || 0) >= 2) return run;
            const joined = /[a-z][A-Z]/.test(run); /* "schoolsLack": two words run together */
            if (!joined && run.length < 16) return run; /* a long real word, used once */
            const words = split(run);
            if (words) return words;
            return joined || run.length >= 18 ? "" : run;
          })
          .replace(/\s{2,}/g, " ")
          .trim()
      )
      .filter((l) => !isNoise(l))
  );
}

/** Paragraphs of one stored page. */
export function paragraphs(pageText) {
  return String(pageText || "").split("\n").map((p) => p.trim()).filter(Boolean);
}
