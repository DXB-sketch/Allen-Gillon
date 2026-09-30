# JavaScript budget

The plan's budget is 150 KB of JavaScript (gzip) per route. The figures below
are measured on the built Worker, not the dev server:

```sh
npm run build:vinext
SITE_DEV_PORT=4870 npm run start:vinext
SITE_DEV_PORT=4870 node scripts/measure-js.mjs
```

`scripts/measure-js.mjs` opens each route in Chromium, waits until the network
is quiet plus 1.5 seconds, and adds up the gzip size (level 9, gzipped by the
script) of every script the page fetched with no clicks, key presses or
scrolling. Prefetches count, because they download on page load too.

Measured 2026-10-01, on the overhaul branch after the integration pass.

| Host | Route | Before (KB) | Now (KB) | Budget |
|---|---|---:|---:|---|
| main | `/` | 154.5 | 149.3 | ok |
| main | `/hire` | 154.5 | 149.3 | ok |
| main | `/music` | 154.5 | 152.3 | over by 2.3 |
| main | `/reviews` | 156.2 | 151.0 | over by 1.0 |
| main | `/shows` | 155.0 | 149.8 | ok |
| main | `/comments` | 155.6 | 150.0 | ok (on the line) |
| other | `/` | 160.1 | 149.3 | ok |
| other | `/biography` | 160.1 | 149.3 | ok |
| other | `/books` | 166.9 | 149.3 | ok |
| other | `/anns-art` | 160.1 | 155.8 | over by 5.8 |
| other | `/anns-art/<id>` | 160.1 | 152.1 | over by 2.1 |
| other | `/delivery` | 160.1 | 149.3 | ok |
| other | `/read/<slug>` (story, play or textbook) | 177.4 | 167.4 | over by 17.4 |
| other | `/read/<slug>/text` | 166.9 | 149.3 | ok |

## What changed

1. **Link prefetch is off.** Each `next/link` in view fetched the target
   route's RSC payload, and the browser then loaded that route's client
   chunks. That is how Album got onto `/`, ArtWall and the art catalogue got
   onto `/read/*`, and BookReader got onto `/books`. Every `<Link>` now has
   `prefetch={false}`. Links still navigate on the client, so the now-playing
   bar keeps playing; the RSC fetch starts on click instead. (In vinext,
   `prefetch={false}` also turns off hover prefetch.)
2. **The page reader loads on first press.** `components/PageReader.jsx` is
   now a 0.6 KB stub that renders the same "Listen to this page" button. The
   first press imports `components/PageReaderControls.jsx` (text extraction,
   voices, controls), which starts reading at once and moves focus to Pause.
   That saved about 2.2 KB on every route.
3. **The art catalogue stays on the server.** The client art components
   import helpers from `lib/art-catalog.mjs`. Its two top-level expressions
   (the duplicate-view `Set` and the filtered `artworks` list) are now marked
   pure, so the bundler drops the 36-painting catalogue from the client chunk
   (3.1 KB down to 1.1 KB gzip).

## Why some routes are still over

Every route loads the same floor of 149.3 KB before its own code:

| Chunk | KB gzip | What it is |
|---|---:|---|
| `framework` | 65.9 | react-dom client and React |
| `vinext` | 38.5 | the vinext app router runtime |
| `index` | 33.3 | the vinext browser entry (RSC client and hydration) |
| `rolldown-runtime` | 0.6 | bundler runtime |
| `link` | 4.6 | the `next/link` shim (client navigation) |
| `Player` | 2.6 | the now-playing bar and its provider (root layout) |
| `CrossSiteLink` | 1.1 | cross-host links in the mast and footer, with `lib/sites.mjs` |
| `MotionObserver` | 0.7 | the illustration draw-on observer |
| `PageReader` | 0.6 | the page reader stub |
| `query`, `SiteMast`, `layout-segment-context` | 1.2 | vinext helpers and the mast's current-page state |

The first four (138.3 KB) come from vinext and React and cannot be changed
without a vinext upgrade, which is out of scope. The rest is the site
chrome on every page. That leaves 0.7 KB for a page's own code, so any page
with a client component goes over:

- `/music`: Album (2.3) and LiteYouTube (0.7).
- `/reviews`: the review form (1.2) and approved reviews (0.5).
- `/anns-art`: ArtWall (3.2), PaintingViews (1.3), the art helpers (1.1),
  TwoInk (0.5), ArtHallScript (0.3) and PurchaseLink (0.2).
- `/anns-art/<id>`: PaintingViews (1.3), the art helpers (1.1) and TwoInk (0.5).
- `/read/<slug>`: react-pageflip (10.5, loaded on mount so the cover can
  open when the book comes into view), BookReader (6.8), TwoInk (0.5) and
  PurchaseLink (0.2).

The next steps would each change behaviour, so they are left for a decision:

- Load react-pageflip on the first touch of the book, rather than on mount.
  `/read` would drop to about 157 KB, but the cover would no longer open by
  itself, and the first turn would use the plain image reader.
- Drop `next/link` for plain `<a>` links (saves 4.6 KB). Every navigation
  would then be a full page load, which stops the now-playing bar.
- Ask for a 160 KB budget, since the vinext floor alone is 138.3 KB.
