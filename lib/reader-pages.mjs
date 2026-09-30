// Page arithmetic for the book reader (components/reader/BookReader.jsx):
// spread or single layout, which pages are on screen, printed page numbers
// and the words of the page counter. Pure, so node --test can check it.
//
// Indexes are 0-based physical pages in the flip book. For a play the book
// holds the preview pages plus one extra "end of the preview" page.

/** A page taller than this (height / width) is portrait and may show as a two-page spread. */
export const PORTRAIT_RATIO = 1.15;
const MIN_SPREAD_PAGE = 260;
const MIN_SPREAD_WIDTH = 700;

/**
 * Fits the book into the space available.
 * - `layout` "single" always turns one page at a time (the 16:9 and square
 *   Chinese Chimes pages); "auto" shows a spread for portrait pages when two
 *   pages of a useful size fit side by side.
 * - The book uses the full width but never grows taller than `height`.
 */
export function fitBook({ aspect, layout = "auto", width, height }) {
  const [w, h] = aspect && aspect[0] > 0 ? aspect : [3, 4];
  const ratio = h / w;
  const availW = Math.max(160, Math.floor(width));
  const availH = Math.max(220, Math.floor(height));
  const spreadW = Math.floor(Math.min(availW / 2, availH / ratio));
  if (layout !== "single" && ratio >= PORTRAIT_RATIO && availW >= MIN_SPREAD_WIDTH && spreadW >= MIN_SPREAD_PAGE) {
    return { mode: "spread", pageWidth: spreadW, pageHeight: Math.floor(spreadW * ratio) };
  }
  const singleW = Math.floor(Math.min(availW, availH / ratio));
  return { mode: "single", pageWidth: singleW, pageHeight: Math.floor(singleW * ratio) };
}

/**
 * Pages on screen for the flip book's current index. With a cover, spreads
 * are [0], [1, 2], [3, 4] ... and the last page may stand alone.
 */
export function visiblePages(index, total, mode) {
  const i = Math.min(Math.max(0, index | 0), Math.max(0, total - 1));
  if (mode !== "spread" || i === 0) return [i];
  const left = i % 2 === 1 ? i : i - 1;
  return [left, left + 1].filter((p) => p < total);
}

/**
 * Printed numbering. Pages before contentStartPage are the introduction.
 * The first content page carries `firstPageNumber` (so a textbook's contents
 * list and the "Go to page" box agree with the numbers printed on its pages).
 */
export function numbering({ shownPages, contentStartPage = 1, firstPageNumber = 1 }) {
  const introPages = Math.max(0, contentStartPage - 1);
  const first = firstPageNumber;
  const last = first + (shownPages - 1 - introPages);
  return {
    introPages,
    first,
    last,
    /** "intro" or "page", and the number to show, for an index. */
    label(index) {
      if (index < introPages) return { kind: "intro", n: index + 1 };
      return { kind: "page", n: first + (index - introPages) };
    },
    /** Index for a printed page number, clamped to the book. */
    indexOf(n) {
      const clamped = Math.min(Math.max(first, Math.round(n)), last);
      return introPages + (clamped - first);
    },
  };
}

const and = (items) => items.join(" and ");

/**
 * The words of the page counter.
 * Plays: "Preview: page 3 of 6 (full script 47 pages)", and on the last
 * spread "End of the preview (full script 47 pages)".
 * Other titles: "Page 3 of 29", "Pages 2 and 3 of 29", "Introduction 2 of 5".
 */
export function counterText({ visible, book }) {
  const shown = book.shownPages;
  if (book.section === "plays") {
    const pages = visible.filter((p) => p < shown).map((p) => p + 1);
    const full = `(full script ${book.pageCount} pages)`;
    if (!pages.length) return `End of the preview ${full}`;
    const noun = pages.length > 1 ? "pages" : "page";
    const end = visible.some((p) => p >= shown) ? `. End of the preview ${full}` : ` ${full}`;
    return `Preview: ${noun} ${and(pages.map(String))} of ${shown}${end}`;
  }
  const num = numbering(book);
  const labels = visible.map((p) => num.label(p));
  const intro = labels.filter((l) => l.kind === "intro").map((l) => l.n);
  const pages = labels.filter((l) => l.kind === "page").map((l) => l.n);
  const parts = [];
  if (intro.length) parts.push(`Introduction ${and(intro.map(String))}${pages.length ? "" : ` of ${num.introPages}`}`);
  if (pages.length) parts.push(`${intro.length ? "page" : pages.length > 1 ? "Pages" : "Page"} ${and(pages.map(String))} of ${num.last}`);
  return and(parts);
}
