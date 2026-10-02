/* The three shelves on /books, built from public/books/index.json and the
   book manifests. Pure code (no JSON imports, no React) so node --test can
   check it against both the old and the new manifest shapes.

   Old shape (before W4): status "free" | "restricted", hasDownload, and the
   textbooks have pageCount 0 and no page images yet.
   New shape (W4): download "public" | "paid" | "none", pdf, previewPages,
   price (cents), and every book, textbooks included, has p001.webp. */

import { playPrice } from "../../../lib/storefront.mjs";

export const STORY_ORDER = ["little-hi-doh", "little-ray", "imaginative-little-mee", "funny-fah-learns-when-to-stop"];
export const PLAY_ORDER = ["melting-pot", "the-other-mans-grass", "tribute-to-calamity-jane", "three-heroes-of-sherwood", "breakout"];
export const TEXTBOOK_ORDER = ["practice-in-communication-book-1", "practice-in-communication-book-2", "riddled-with-language"];

/* Until the W4 build renders the textbooks, their covers are the scans in
   public/images/books. */
const COVER_FALLBACK = {
  "practice-in-communication-book-1": "/images/books/practice-in-communication-book-1.webp",
  "practice-in-communication-book-2": "/images/books/practice-in-communication-book-2.webp",
  "riddled-with-language": "/images/books/riddled-with-language.webp",
};
const FALLBACK_ASPECT = [1000, 1414];

/* "A$1" rather than formatAud's "$1 AUD": the price sits on the shelf. */
export function priceLabel(cents) {
  const dollars = cents / 100;
  return `A$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

function isAbsolute(path) {
  return /^(\/|https:\/\/)/.test(path);
}

export function coverFor(book) {
  if (typeof book.cover === "string" && isAbsolute(book.cover)) return book.cover;
  if (book.pageCount > 0) return `/books/${book.slug}/p001.webp`;
  return COVER_FALLBACK[book.slug] || `/books/${book.slug}/p001.webp`;
}

function aspectFor(book) {
  const a = book.aspect;
  return Array.isArray(a) && a.length === 2 && a[0] > 0 && a[1] > 0 ? a : FALLBACK_ASPECT;
}

/* A textbook's PDF link, only when the manifest says a free PDF exists.
   New shape: download "public", with the file named in `pdf` (a path or a
   bare file name) or the build's usual <slug>.pdf. Old shape: status "free"
   with hasDownload. Anything else (the old "restricted" textbooks, "paid",
   "none") gets no link, so the shelf shows "Read online" only until W4's
   manifests land, and the link then turns on by itself. */
export function textbookPdf(book) {
  if (book.download === "none" || book.download === "paid") return "";
  const isPublic = book.download === "public"
    || (book.download === undefined && book.status === "free" && book.hasDownload === true);
  if (!isPublic) return "";
  const pdf = typeof book.pdf === "string" && book.pdf ? book.pdf : `${book.slug}.pdf`;
  return isAbsolute(pdf) ? pdf : `/books/${book.slug}/${pdf}`;
}

export function buildShelves(index, manifests = {}) {
  const bySlug = {};
  for (const entry of Array.isArray(index) ? index : []) {
    if (!entry || typeof entry.slug !== "string") continue;
    const book = { ...entry, ...(manifests[entry.slug] || {}) };
    bySlug[entry.slug] = { ...book, cover: coverFor(book), aspect: aspectFor(book) };
  }
  const pick = (order, section) => {
    const listed = order.map((slug) => bySlug[slug]).filter(Boolean);
    const extra = Object.values(bySlug).filter((b) => b.section === section && !order.includes(b.slug));
    return [...listed, ...extra];
  };
  const stories = pick(STORY_ORDER, "childrens");
  const plays = pick(PLAY_ORDER, "plays").map((b) => ({
    ...b,
    fullPages: b.fullPageCount || b.pageCount,
    previewPages: b.previewPages || 6,
    price: b.price || playPrice,
  }));
  const textbooks = pick(TEXTBOOK_ORDER, "teaching").map((b) => ({ ...b, pdf: textbookPdf(b) }));
  return { stories, plays, textbooks };
}
