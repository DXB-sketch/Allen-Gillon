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

Measured 2026-10-01 on the built Worker after fixer round 2 (the "Before"
column is the start of W6). 9 of the 16 measured routes are within budget.

| Host | Route | Before (KB) | Now (KB) | Budget |
|---|---|---:|---:|---|
| main | `/` | 154.5 | 149.5 | ok |
| main | `/hire` | 154.5 | 149.5 | ok |
| main | `/music` | 154.5 | 152.6 | over by 2.6 |
| main | `/reviews` | 156.2 | 151.2 | over by 1.2 |
| main | `/shows` | 155.0 | 149.9 | ok |
| main | `/comments` | 155.6 | 150.1 | over by 0.1 |
| other | `/` | 160.1 | 149.5 | ok |
| other | `/biography` | 160.1 | 149.5 | ok |
| other | `/books` | 166.9 | 149.5 | ok |
| other | `/anns-art` | 160.1 | 156.2 | over by 6.2 |
| other | `/anns-art/<id>` | 160.1 | 152.3 | over by 2.3 |
| other | `/delivery` | 160.1 | 149.5 | ok |
| other | `/read/<slug>` (story, play or textbook) | 177.4 | 167.9 | over by 17.9 |
| other | `/read/<slug>/text` | 166.9 | 149.5 | ok |

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
- `/comments`: the comment form (0.6).
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

# Cache headers

Only /comments, /api and the 404 pages are dynamic. Every page in the (main)
and (other) route groups is static: both group layouts export
`revalidate = false`, and no page or boundary in them reads the request.

Until fixer round 2 every HTML route was served `no-store`. The cause was the
root `app/not-found.jsx`: it read `headers()` to pick the site, and vinext
renders the not-found boundary with every page, so every page counted as
dynamic. It is replaced by one static not-found per group
(`app/(main)/not-found.jsx`, `app/(other)/not-found.jsx`). The unpublished
legal paths on other are rewritten to a missing path (`MISSING_PATH` in
`lib/sites.mjs`), so `app/global-not-found.jsx`, which may read the Host
because it only renders for misses, gives them the More on Allen chrome.

What the Worker now sends, checked with curl on the built Worker:

| Response | Cache-Control seen by the browser |
|---|---|
| Group pages (both hosts, every 200 HTML route) | `private, max-age=0, must-revalidate` |
| /comments and every 404 | `no-store, must-revalidate` |

The group pages' browser header is set by @vinext/cloudflare's CDN adapter on
purpose. The shared policy (`s-maxage=31536000, stale-while-revalidate`) goes
to Cloudflare's Workers Cache as `Cloudflare-CDN-Cache-Control` on the inner
response and is consumed at the edge; the browser is told to revalidate
against the edge every time. The edge copy is keyed on the full URL, host
included, and each host's pages have their own paths (other "/" is rewritten
to /other-home), so the hosts cannot collide. A deploy needs a cache purge.
After deploy: request a page twice on each host and check `cf-cache-status:
HIT` on the second (local `wrangler dev` does not show it).

Static files (`public/_headers`): /_next/static, /audio, /fonts, /images,
/videos and /og are `max-age=31536000, immutable`; /icons and /books revalidate
daily. Because /audio, /images and /og filenames carry no content hash, **a
file there must never be replaced in place**: give the new version a new name
(or a `?v=` query) and update every reference. This matters for the pending
funny-fah mp3 fix: the new recording needs a new file name, with
content/story-cues and the audio manifest (`audioSha256`) updated together, or
returning visitors keep the old copy for a year.

# Lighthouse (mobile)

Lighthouse 12.8 (mobile preset, Playwright's Chromium) against the built
Worker (`SITE_DEV_PORT=4610 npm run start:vinext`), after fixer round 2 of
2026-10-01. Local runs only indicate: re-run against the deployed hosts after
deploy. Scores are Performance / Accessibility / Best Practices / SEO.

Simulated throttling (the default), every route on both hosts, one run each:

| Route | Scores | LCP | CLS |
|---|---|---:|---:|
| main `/` | 96/100/100/100 | 2.72 s | 0.000 |
| main `/hire` | 97/100/100/100 | 2.49 s | 0.000 |
| main `/music` | 91/100/100/100 | 3.40 s | 0.000 |
| main `/reviews` | 96/100/100/100 | 2.58 s | 0.000 |
| main `/shows` | 97/100/100/100 | 2.49 s | 0.000 |
| main `/comments` | 97/100/100/66 | 2.43 s | 0.000 |
| other `/` | 94/100/100/100 | 2.96 s | 0.000 |
| other `/biography` | 93/100/100/100 | 3.10 s | 0.000 |
| other `/books` | 94/100/100/100 | 2.87 s | 0.000 |
| other `/delivery` | 97/100/100/100 | 2.35 s | 0.000 |
| other `/anns-art` | 94/100/100/100 | 2.95 s | 0.008 |
| other `/anns-art/ann-426502619623139` | 96/100/100/100 | 2.73 s | 0.000 |
| other `/read/little-ray/text` | 97/100/100/100 | 2.42 s | 0.000 |
| other `/read/<slug>`, all 12 titles | 91 to 94/100/100/100 | 2.87 to 3.33 s | 0.000 |

The /read range: practice-in-communication books 1 and 2 are 91 at 3.32 and
3.33 s, riddled-with-language and tribute-to-calamity-jane 92 at 3.17 s, and
the other eight 93 or 94 at 2.87 to 3.11 s.

Devtools throttling (`--throttling-method=devtools`, performance only):

| Route | Performance | LCP | CLS |
|---|---:|---:|---:|
| main `/music` | 98 | 1.89 s | 0.000 |
| other `/` | 98 | 2.08 s | 0.000 |
| other `/anns-art` | 99 | 1.59 s | 0.008 |
| other `/anns-art/ann-426502619623139` | 97 | 2.50 s | 0.000 |
| other `/read/practice-in-communication-book-1` | 96 | 2.70 s | 0.000 |

Round 2 changes behind these numbers:

- **/read covers.** Every page image now has a 720px copy (`pNNN-720.webp`,
  made by `scripts/build-books.mjs` from the full image). The reader's first
  page and the flip book pages use `srcset` and `sizes` (`pageSrcSet` and
  `READER_PAGE_SIZES` in `lib/books.mjs`), and the page preloads the cover
  with the same `imagesrcset` at high priority. The practice-in-communication
  cover a phone downloads went from 181 KB to 100 KB, and the heavy-cover
  /read routes went from Performance 84 to 91 or more.
- **Other home.** The two Little Ray pages use the same 720px copies.
- **Paintings.** A 720px AVIF and WebP copy was added (`ART_WIDTHS` in
  `lib/art-catalog.mjs`). That is what a phone at DPR 1.75 to 2 picks for a
  92vw painting, instead of the 960.
- **/anns-art.** The wall photographs load at low priority, so they no
  longer compete with the CSS and the lede (the LCP element) for the first
  paint: Performance went from 85 to 94.
- **/reviews Best Practices** is 100: `scripts/start-local.mjs` now applies the
  D1 migrations to the preview's own local state (`dist/server/.wrangler`)
  before `wrangler dev`, so /api/reviews answers 200 instead of 503. In
  production run `npm run reviews:migrate:remote` before or at deploy and
  check that `GET https://allengillon.com/api/reviews` returns 200.

Tried and dropped: removing the Dynalight font preload (the spec says to
preload only the LCP image) left LCP unchanged and made FCP worse (1.67 s to
1.82 s), so the preload stays.

What is left:

- **Simulated LCP is over 2.5 s on most routes**, although every route now
  scores Performance 90 or more. Observed LCP breakdowns are under 0.5 s (TTFB
  about 60 ms, render delay 160 to 370 ms). Lantern charges each route for two
  render-blocking stylesheets (about 310 and 160 ms simulated, 3 and 4 KB) and
  for the 149 KB JavaScript floor above. With devtools throttling every
  measured route is at or under 2.5 s except the practice-in-communication
  covers (2.70 s). vinext beta.12 has no option to inline route CSS. This goes
  with the JavaScript budget decision (human TODO) and a re-measure on the
  deployed hosts (HTTP/2; Brotli and immutable caching already match).
- **Desktop only, plays only:** opening the cover of a play preview in a
  two-page spread moves react-pageflip's hard cover page by changing its
  left and width (about 0.10 CLS at 1280x800, once, about 0.6 s after load).
  Stories and textbooks do not shift, and Lighthouse mobile shows 0.000.
  A fix would change the look (a soft cover) or the behaviour (no automatic
  opening), so it is left for a decision.
- **`/comments` scores SEO 66 by design.** It carries
  `robots: noindex, follow` (plan W6: "Keep /comments crawlable, with
  robots:{index:false}"), which Lighthouse's is-crawlable audit counts as a
  failure. It is the one spec-mandated exception to "SEO 100 on every route".
- **Legal pages** could not be audited as content pages: they 404 while
  `content/legal.config.json` is unpublished. After the human publishes them,
  re-run `npm run a11y:pa11y` (the config adds them by itself), the axe sweep
  and Lighthouse on /privacy, /terms and /accessibility.
