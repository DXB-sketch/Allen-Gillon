# SEO wiring for each page (W6)

The W6 branch adds the infrastructure but leaves page.jsx files alone, because
page agents are editing them at the same time. Once those pages have merged,
the orchestrator makes the changes below. Each one is small.

## What is already live

- **Group layouts** (`app/(main)/layout.jsx`, `app/(other)/layout.jsx`) now take
  their metadata from `hostMetadata(site)` in `lib/seo.mjs`, and their viewport
  from `hostViewport(site)`. That covers:
  - metadataBase and the title template ("%s · Allen Gillon" or "%s · More on Allen")
  - the icon set and manifest from `public/icons/<site>/`
  - `themeColor` #f8f6ee
  - Open Graph `siteName` and `en_AU` locale
  - a `summary_large_image` twitter card
- **Site-wide JSON-LD.** Each group layout renders `siteGraph(site)` from
  `lib/schema.mjs` once, just before `SiteChrome`:
  - main: WebSite, Person (Allen) and Service (bookings)
  - other: WebSite, Person (Allen), Person (Ann) and MusicGroup (Timeless)

  Pages must not render these again.
- **robots.txt and sitemap.xml.** `app/robots.txt/route.js` and
  `app/sitemap.xml/route.js` read the Host header. The text comes from
  `robotsTxt()` and `sitemapXml()` in `lib/seo.mjs`, and both are dynamic.
- **Root favicon.** `/favicon.ico` is rewritten to `/icons/<site>/favicon.ico`
  in `lib/sites.mjs` `resolveRequest()`. `proxy.ts` now matches that path explicitly.
- **Caching.** `public/_headers` gives /images, /videos, /fonts, /icons, /og and
  /audio an immutable one-year cache. `/books/*` gets
  `max-age=86400, must-revalidate`.

## The metadata line for each page

In each page.jsx, replace the existing `export const metadata = {...}` or
`generateMetadata` with the line shown. Import from `lib/seo.mjs` at the right
depth: `../../lib/seo.mjs` for `app/(main)/page.jsx`, and `../../../lib/seo.mjs`
for `app/(main)/hire/page.jsx`.

```jsx
import { pageMetadata } from "../../../lib/seo.mjs";
export const metadata = pageMetadata("main", "/hire");
```

| File | Change |
|---|---|
| `app/(main)/page.jsx` | `export const metadata = pageMetadata("main", "/");` |
| `app/(main)/hire/page.jsx` | `export const metadata = pageMetadata("main", "/hire");` |
| `app/(main)/music/page.jsx` | `export const metadata = pageMetadata("main", "/music");` |
| `app/(main)/reviews/page.jsx` | `export const metadata = pageMetadata("main", "/reviews");` |
| `app/(main)/shows/page.jsx` | `export const metadata = pageMetadata("main", "/shows");` |
| `app/(main)/privacy/page.jsx` (W7) | `export const metadata = pageMetadata("main", "/privacy");` |
| `app/(main)/terms/page.jsx` (W7) | `export const metadata = pageMetadata("main", "/terms");` |
| `app/(main)/accessibility/page.jsx` (W7) | `export const metadata = pageMetadata("main", "/accessibility");` |
| `app/(other)/other-home/page.jsx` | `export const metadata = pageMetadata("other", "/");` (delete the local CANONICAL constant and the metadata block; the helper clears metadataBase itself) |
| `app/(other)/biography/page.jsx` | `export const metadata = pageMetadata("other", "/biography");` |
| `app/(other)/books/page.jsx` | `export const metadata = pageMetadata("other", "/books");` |
| `app/(other)/anns-art/page.jsx` | `export const metadata = pageMetadata("other", "/anns-art");` |
| `app/(other)/delivery/page.jsx` | `export const metadata = pageMetadata("other", "/delivery");` (this also gives /delivery its description) |
| `app/(other)/read/[slug]/page.jsx` | `export const generateMetadata = generateReadMetadata;` (import `generateReadMetadata`, and delete the old function) |
| `app/(other)/read/[slug]/text/page.jsx` (W4) | `export const generateMetadata = generateReadTextMetadata;` |
| `app/(other)/anns-art/[id]/page.jsx` (W5) | `export const generateMetadata = generateArtworkMetadata;` |
| `app/comments/page.jsx` | `export async function generateMetadata() { return pageMetadata(siteForHost((await headers()).get("host")), "/comments"); }` (this is noindex, follow) |
| `app/dev/**` and any placeholder page | `export const metadata = noindexMetadata({ title: "..." });` |

Notes:
- **Placeholder books.** For a book that is not digitised yet, use
  `readMetadata(slug, { placeholder: true })` inside a custom `generateMetadata`.
  That adds noindex.
- **Overrides.** Pass extra fields as the third argument:
  `pageMetadata("main", "/music", { openGraph: { type: "music.album" } })`.
  `openGraph`, `twitter` and `alternates` merge one level deep.
- **New routes.** A new static route needs an entry in `ROUTE_META` in
  `lib/seo.mjs`. `tests/seo.test.mjs` enforces:
  - a unique title of 60 characters or fewer
  - a unique description of 150 to 160 characters
  - a unique absolute canonical
- **Dynamic routes.** Books and paintings are generated from
  `content/books.config.json` and `content/artworks.mjs`, so nothing needs editing.
- I checked the wiring on the built Worker for `/`, `/hire`, the other host's
  home, `/read/little-ray` and `/comments` on both hosts. Each rendered the
  expected title, description, canonical (including `https://other.allengillon.com/`
  with its trailing slash), Open Graph image, twitter card, icons and robots.
  I then reverted those page edits.

## JSON-LD for each page

Render the JSON-LD with `<script {...jsonLdProps(data)} />` from `lib/schema.mjs`.
Pass an array to get a single `@graph`. Put it at the top of the page's `<main>`.
Never add Review, AggregateRating, FAQPage or Event types.

| Route | JSON-LD |
|---|---|
| main `/` | none beyond the layout graph |
| main `/hire` | `breadcrumbs([{ name: "Home", url: "/" }, { name: "Bookings" }], "main")`. `bookingService()` is already in the layout graph. |
| main `/music` | `[collectionPage(albums.map(a => ({ url: `/music#${a.id}`, name: a.title, image: a.cover })), { url: "/music", name: "Albums", site: "main" }), ...albums.map(musicAlbum)]`, using the `albums` array already in the page. The price is 0 because albums are free. Add `videoObject({...})` for the two Timeless videos only when the upload date is known; it returns null otherwise. |
| main `/reviews` | `breadcrumbs([{ name: "Home", url: "/" }, { name: "Reviews" }], "main")` only. Do not add a Review or AggregateRating. |
| main `/shows` | `breadcrumbs([{ name: "Home", url: "/" }, { name: "Shows" }], "main")` |
| main `/privacy`, `/terms`, `/accessibility` | `breadcrumbs([...], "main")` |
| other `/` | none beyond the layout graph |
| other `/biography` | `breadcrumbs([{ name: "Home", url: "/" }, { name: "Timeless" }], "other")`. `timelessGroup()` is already in the layout graph. |
| other `/books` | `collectionPage(books.map(b => ({ url: `/read/${b.slug}`, name: b.title, image: `/books/${b.slug}/p001.webp` })), { url: "/books", name: "Stories, plays and textbooks", site: "other" })` |
| other `/read/[slug]` | `[book({ ...entry, cover: `/books/${slug}/p001.webp`, audio }), breadcrumbs([{ name: "Home", url: "/" }, { name: "Stories", url: "/books" }, { name: entry.title }], "other")]`. This replaces the hand-built `jsonLd` object now in the page. For audio, stories pass `{ src: storyAudio[slug] }`; plays with a recording pass `{ src: "/audio/school-play-previews/<slug>.mp3", preview: true }`. Pass `downloadUrl` for stories and textbooks only. |
| other `/read/[slug]/text` | `breadcrumbs([..., { name: entry.title, url: `/read/${slug}` }, { name: "Text" }], "other")` |
| other `/anns-art` | `collectionPage(artworks.map(a => ({ url: `/anns-art/${a.id}`, name: a.title, image: a.images[0]?.src })), { url: "/anns-art", name: "Ann Gillon's paintings", site: "other" })` |
| other `/anns-art/[id]` | `[artwork(art), breadcrumbs([{ name: "Home", url: "/" }, { name: "Ann Gillon", url: "/anns-art" }, { name: art.title }], "other")]`. Works for sale get Product, Offer, shipping and return policy, sold by Ann. Enquiry-only works get VisualArtwork only. |
| other `/delivery` | `breadcrumbs([{ name: "Home", url: "/" }, { name: "Ann Gillon", url: "/anns-art" }, { name: "Delivery and payment" }], "other")` |
| `/comments` | none (noindex) |

## Checks after wiring

- `npm test` runs `tests/seo.test.mjs` and `tests/schema.test.mjs`.
- `SITE_DEV_PORT=3820 npx playwright test e2e/seo.spec.mjs` checks icons,
  manifest, theme colour, site graph, robots, sitemap and favicon on both
  hosts, plus axe on sample pages.
- On the built Worker (`SITE_DEV_PORT=4820 npm run start:vinext`):
  ```sh
  curl -s -H "Host: allengillon.com" http://127.0.0.1:4820/robots.txt
  curl -s -H "Host: other.allengillon.com" http://127.0.0.1:4820/sitemap.xml | grep -c "<url>"
  curl -s -H "Host: other.allengillon.com" http://127.0.0.1:4820/ | grep -o '<link rel="canonical"[^>]*>'
  ```
