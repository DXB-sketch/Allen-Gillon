// Shared rules for the book reader data: content/books.config.json in,
// public/books/<slug>/manifest.json out. Used by scripts/build-books.mjs and
// by tests/books-leak.test.mjs, so the build and the leak test agree on what
// may be public.

export const DEFAULT_PREVIEW_PAGES = 6;

export const pageFile = (n) => `p${String(n).padStart(3, "0")}.webp`;

/* Smaller copy of every page image (pNNN-720.webp) so a
   phone downloads a page sized for it (the full pNNN.webp is 1080 wide).
   scripts/build-books.mjs makes them from the full image; only widths below
   the page's own width exist. */
export const PAGE_VARIANT_WIDTHS = [720];
export const pageVariantFile = (n, width) => `p${String(n).padStart(3, "0")}-${width}.webp`;

/* srcset for page n (1-based) of a book whose full page images are fullWidth wide. */
export function pageSrcSet(slug, n, fullWidth) {
  const base = `/books/${slug}/`;
  const parts = PAGE_VARIANT_WIDTHS.filter((w) => w < fullWidth).map((w) => `${base}${pageVariantFile(n, w)} ${w}w`);
  parts.push(`${base}${pageFile(n)} ${fullWidth}w`);
  return parts.join(", ");
}

/* How wide a reader page is drawn: one page across a phone (inside the 16px
   gutters), half of a two-page spread on wider screens. */
export const READER_PAGE_SIZES = "(max-width: 820px) calc(100vw - 32px), 50vw";

/** Plays are sold, so they default to a paid download and a short preview. */
export function isPlay(book) {
  return book?.section === "plays";
}

/**
 * Builds the manifest for one title from its config entry plus what the
 * build measured (pageCount, aspect). Everything /books and /read need is here.
 * - download: "public" (free PDF in public/books), "paid" (Buy only) or "none".
 * - shownPages: how many page images exist in public/. For plays this is
 *   previewPages; the rest of the script is never published.
 */
export function normaliseBook(raw, { pageCount = 0, aspect = null, price = 0, pdfBytes = null } = {}) {
  const play = isPlay(raw);
  const download = raw.download ?? (play ? "paid" : "public");
  if (!["public", "paid", "none"].includes(download)) throw new Error(`${raw.slug}: bad download "${download}"`);
  const previewPages = play ? Math.max(1, Number(raw.previewPages ?? DEFAULT_PREVIEW_PAGES)) : null;
  const shownPages = play ? Math.min(previewPages, pageCount) : pageCount;
  const contentStartPage = Math.min(Math.max(1, Number(raw.contentStartPage ?? 1)), Math.max(1, shownPages));
  const audio = raw.audio
    ? {
        src: raw.audio.src,
        kind: raw.audio.kind,
        label: raw.audio.kind === "preview" ? "Listen to a preview" : "Listen to the audiobook",
      }
    : null;
  return {
    slug: raw.slug,
    title: raw.title,
    author: raw.author,
    section: raw.section,
    status: raw.status ?? (play ? "preview" : "free"),
    blurb: raw.blurb,
    download,
    pdf: download === "public" ? `/books/${raw.slug}/${raw.slug}.pdf` : null,
    pdfBytes: download === "public" ? pdfBytes : null,
    price: play ? price : 0,
    pageCount,
    shownPages,
    previewPages,
    contentStartPage,
    firstPageNumber: Math.max(1, Number(raw.firstPageNumber ?? 1)),
    layout: raw.layout ?? "auto",
    aspect,
    cover: shownPages > 0 ? `/books/${raw.slug}/${pageFile(1)}` : null,
    audio,
    video: raw.video ?? null,
    readRoute: `/read/${raw.slug}`,
    textRoute: play || shownPages === 0 ? null : `/read/${raw.slug}/text`,
  };
}

/** True when `name` may exist in public/books/<slug>/ for this manifest. */
export function keepFile(manifest, name) {
  if (name === "manifest.json") return true;
  if (name === `${manifest.slug}.pdf`) return manifest.download === "public";
  const m = /^p(\d{3})(?:-(\d+))?\.webp$/.exec(name);
  if (m) {
    const n = Number(m[1]);
    if (m[2]) {
      const width = Number(m[2]);
      if (!PAGE_VARIANT_WIDTHS.includes(width) || width >= (manifest.aspect?.[0] ?? 0)) return false;
    }
    return n >= 1 && n <= manifest.shownPages;
  }
  return false;
}
