# Books Reader — Complete (2026-09-09)

An on-site, page-turning book reader for Allen's digitised works, sourced from Google
Drive, rendered as static WebP pages inside a flip-book, with the searchable PDF kept as
the download artifact.

## What was built

- **`scripts/build-books.mjs`** (`npm run build:books`): reads the registry, rasterises
  each free book's PDF from `scripts/incoming/` (poppler `pdftoppm` if present, otherwise
  a pure-Node pdfjs-dist + @napi-rs/canvas fallback, ~150 dpi), optimises with sharp into
  `public/books/<slug>/` (screen pages max 1080w q72, thumbs 240w q58, zero-padded
  `pXXX.webp`), copies the PDF for download, copies `content/book-text/<slug>.txt` to
  `text.txt` when present, and writes per-book `manifest.json` plus `public/books/index.json`.
  Idempotent; `--force` rebuilds. Restricted books are skipped entirely.
- **`scripts/extract-text.mjs`**: one-off helper that pulls the embedded OCR text out of
  the searchable PDFs into `content/book-text/<slug>.txt` (run before build:books; the
  extracts for all six free books are committed).
- **`components/BookReader.jsx`** (client only): react-pageflip 2.0.3 (pinned) via
  `next/dynamic` with `ssr:false`. Windowed rendering: cover plus pages within 2 of the
  current page are real `<img>`s; far pages are paper-coloured placeholders; neighbours
  prefetch on turn. Controls: Back/Forward buttons, left/right arrow keys, a live page
  counter, jump-to-page, Download PDF. Two-page spread on wide screens, single page under
  820px. `prefers-reduced-motion` drops flippingTime to 1ms and the flip shadow.
- **`app/read/[slug]/page.jsx`** (server, SSG via `generateStaticParams` from
  `public/books/index.json`): free books get per-book metadata, OpenGraph cover image,
  Book JSON-LD, the OCR text inlined in a `.visually-hidden` container, and the reader.
  Restricted books get a plain notice with a contact link, no reader, no download. The
  three not-yet-digitised storybooks keep their "being digitised" placeholder pages.
- **`app/plays/page.jsx` / `app/books/page.jsx`**: now render from
  `public/books/index.json`. Free books get "Read online" + "Download PDF"; restricted
  titles are listed as published works with a contact link. No invented teacher metadata;
  the "to be listed here" lines stay until Allen supplies details.
- **Styles**: a scoped `.bkr` block plus `.visually-hidden` appended to `app/site.css`,
  tokens only (paper, ink, rule, soft inset spine shadow). No Tailwind, no new colours,
  no em dashes, all targets >= 44px.

## Config schema (`content/books.config.json`)

```json
{ "file": "source.pdf", "slug": "url-slug", "title": "...", "author": "...",
  "section": "plays | childrens | teaching", "status": "free | restricted", "blurb": "..." }
```

## Manifest schema (`public/books/<slug>/manifest.json`)

```json
{ "slug", "title", "author", "section", "status", "blurb",
  "pageCount": N, "aspect": [w, h], "hasDownload": true }
```

`public/books/index.json` holds `{ slug, title, section, status, pageCount, blurb }` for
every book in the config, including restricted ones, so listings can show them.

## Published vs restricted

Published (reader + download): Melting Pot (47pp), The Other Man's Grass (27pp), Tribute
to Calamity Jane (21pp), Three Heroes of Sherwood (26pp), Breakout (26pp), Little Hi-Doh
(2pp, listed as "Hi Doh" on the books page alongside its YouTube narration).

Restricted (listed only, no reader, no download, no page images generated): Practice in
Communication Book 1 and Book 2 (Primary Education Publications), Riddled with Language
(Modern Teaching Aids). These carry third-party publisher notices; do not lift the gate
until web-distribution rights are confirmed.

## Asset size

`public/books/**` is ~56 MB committed (about 45 MB of that is the six download PDFs, the
rest WebP pages and thumbs). Fine for git today; if it grows past a comfortable size the
migration path is Vercel Blob storage for the page images and PDFs, pointing the manifest
URLs there. The manifest/asset design does not depend on react-pageflip, so swapping the
flip library (flipping-pages, or a slide-with-fade reader) is cheap if it ever misbehaves.

## Source pull

`scripts/incoming/` is git-ignored and holds the raw PDFs pulled from My Drive > ALLEN
GILLON > SCANNED DOCUMENTS via an rclone `gdrive` remote (read-only scope) set up during
this build. Note: rclone warns its shared Google client_id retires during 2026; create a
personal client_id (https://rclone.org/drive/#making-your-own-client-id) before the next
big pull.

## For the next round

- The three remaining Chinese Chimes books (Funny Fah Learns When to Stop, Imaginative
  Little Mee, Little Ray) once digitised: drop the PDFs in Drive/scripts/incoming, add
  config rows (section "childrens", status "free"), run extract-text + build:books, and
  point their `readSlug` entries on the books page at the new slugs.
- Little Hi-Doh rendered only 2 pages; the scan may be a compact layout, worth confirming
  with Allen that the full story is there.
- Teacher metadata for the plays (age band, cast size, run time) when Allen supplies it;
  the listing copy has "to be listed here" placeholders ready.
- Thumbnails (`thumbs/pXXX.webp`) are generated but not yet used in the UI; a jump-to-page
  thumbnail strip is a natural use.
- The publisher names for the restricted titles were in the old plays page copy; they are
  in this file and could be folded into the config blurbs if wanted.
- Site-wide `favicon.ico` is missing (pre-existing 404, unrelated to the reader).
