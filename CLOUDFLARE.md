# Cloudflare deployment

The site runs on Cloudflare Workers through vinext. Visitor reviews are stored in the `allen-gillon-reviews` D1 database.

## First deployment

1. Build the Worker with `npm run build:vinext`.
2. Deploy it with `npm run deploy:vinext`. The Worker uses the production D1 database declared in `wrangler.jsonc`.
3. Apply any new database migrations with `npm run reviews:migrate:remote`.
4. Open `/reviews` on the deployed Worker and submit a test review.

The existing Next.js build remains available through `npm run build` while the Cloudflare migration is being completed.

## Two hosts, one Worker

One Worker serves both sites:

| Host | Site | Pages |
|---|---|---|
| `allengillon.com` | Allen Gillon (main) | Home, `/hire`, `/music`, `/reviews`, `/shows`, and later `/privacy`, `/terms`, `/accessibility` |
| `other.allengillon.com` | More on Allen (other) | Home (`app/(other)/other-home`), `/biography`, `/books`, `/read/[slug]`, `/anns-art`, `/delivery` |
| `www.allengillon.com` | none | 301 to `https://allengillon.com` |

`/comments` and `/api/*` are served on both hosts.

- Pages live in the route groups `app/(main)` and `app/(other)`. Each group layout sets `metadataBase`, the title template (`%s · Allen Gillon` or `%s · More on Allen`) and the site's mast and footer.
- `lib/sites.mjs` is the single source of truth: `SITES`, `ROUTE_OWNER`, `siteForHost`, `resolveRequest` and `crossSiteUrl`. `tests/sites.test.mjs` covers it.
- `proxy.ts` (repo root) applies `resolveRequest` to every non-asset request. vinext 1.0.0-beta.12 supports the Next 16 `proxy.ts` convention directly (`node_modules/vinext/dist/server/middleware.js` looks for `proxy.*` first, then the deprecated `middleware.*`), in `vinext dev` and in the built Worker.
- Rules: www goes to the apex; a path owned by one site returns 301 to the other host; on other, `/` is rewritten to `/other-home` and `/other-home` returns 301 to `/`; `/plays` returns 301 to `https://other.allengillon.com/books#school-plays`; `/api/*` is never redirected, so `POST /api/reviews` works on both hosts.
- Loopback hosts (`localhost`, `127.0.0.1`, `::1`), `*.localhost` and `*.test` never redirect. Unknown hosts (a LAN IP, a tunnel, `*.vercel.app`) return 301 to the main site only in production. They are served as main (or as other when the name starts with `other.`) when `NODE_ENV` is not `production`, when `SITE_PREVIEW=1` (`start:vinext` sets it for the local Worker), or on Vercel (`VERCEL=1`, set by Vercel on every deployment). Requests that name a production host (`allengillon.com`, `other.allengillon.com`, `www`) still follow the production rules with the preview flag set, so the curl Host-header checks below behave like production.
- The legal pages are gated by `content/legal.config.json` (`{"published": false}`). While unpublished they 404 on both hosts and the footer hides their links. Once published they are main-only and other returns 301 to main.
- Cross-site links are plain `<a>` elements with absolute URLs (`components/CrossSiteLink.jsx`), so moving between sites is a full page load and stops NowBar audio. In `vinext dev` and the local Worker preview the server-rendered links already use `http://localhost` / `http://other.localhost` on `SITE_DEV_PORT`, so local HTML never links to production; after hydration a page opened on `localhost`, `other.localhost` or `127.0.0.1` points at the local counterpart on the port in use. Vercel and production use the production URLs.
- `<html data-site="main|other">` is set by a tiny inline script in `app/layout.jsx` (`SITE_MARKER_SCRIPT` in `lib/sites.mjs`, same rule as `siteForHost`), so the root layout never reads the request and pages stay static. `app/global-not-found.jsx` sets it on the server. The group layouts also put `data-site` on their `div.site` wrapper.
- The other-site home clears `metadataBase` so its canonical and `og:url` print as `https://other.allengillon.com/` with the trailing slash (with a `metadataBase`, vinext prints a root URL as the bare origin). Its metadata URLs must therefore stay absolute.
- Route misses render `app/global-not-found.jsx` (enabled with `experimental.globalNotFound` in `next.config.mjs`), which reads the Host header. Without it vinext wraps every miss in the `(main)` layout.

### Cloudflare setup

`wrangler.jsonc` declares three custom domains (`allengillon.com`, `www.allengillon.com`, `other.allengillon.com`) with `"workers_dev": false` and `"preview_urls": false`. After `npm run build:vinext`, check that the other route is in `dist/server/wrangler.json`:

```sh
grep other.allengillon.com dist/server/wrangler.json
```

Before the first deploy with the new route, check in the Cloudflare dashboard that no DNS record for `other` already exists (a custom domain creates its own record). After deploying, purge the cache and check `cf-cache-status` on both hosts.

`vercel.json` sends `X-Robots-Tag: noindex` so the old Vercel copy is not indexed.

### Testing both hosts locally

`SITE_DEV_PORT` sets the local port: default 3001 for `npm run dev:vinext` (`scripts/dev-local.mjs`, which also hands the port to the app through `vite.config.ts`) and 8787 for `npm run start:vinext`. Neither script hard-codes the port. Browsers and curl resolve `*.localhost` to loopback, so:

- main: `http://localhost:3001`
- other: `http://other.localhost:3001`

```sh
npm run dev:vinext                       # vinext dev on port 3001
SITE_DEV_PORT=3201 npm run dev:vinext    # or any other port
SITE_DEV_PORT=3201 npx playwright test e2e/sites.spec.mjs   # starts vinext dev on 3201 if needed
```

In `vinext dev`, `vite.config.ts` allows the `.localhost` and `allengillon.com` host names, and turns off the Cloudflare asset worker's HTML handling in dev only. Without that, the legacy root `*.html` files (`index.html`, `books.html`, ...) are served in place of the app routes.

To check the built Worker with production Host headers:

```sh
npm run build:vinext
SITE_DEV_PORT=8787 npm run start:vinext
curl -sI -H "Host: allengillon.com" http://localhost:8787/books            # 301 to other
curl -sI -H "Host: other.allengillon.com" http://localhost:8787/hire       # 301 to main
curl -s  -H "Host: other.allengillon.com" http://localhost:8787/ | grep "<title>"
curl -sI -H "Host: other.allengillon.com" http://localhost:8787/other-home # 301 to /
curl -sI -H "Host: www.allengillon.com" http://localhost:8787/             # 301 to apex
curl -sI -H "Host: allengillon.com" http://localhost:8787/plays            # 301 to #school-plays
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Host: other.allengillon.com" -H "Content-Type: application/json" -d "{}" http://localhost:8787/api/reviews   # 400, not 3xx
curl -sI http://localhost:8787/books                                       # 200, loopback never redirects
curl -sI -H "Host: 192.168.1.5:8787" http://localhost:8787/books          # 200, SITE_PREVIEW: unknown hosts stay local
curl -s  -H "Host: other.allengillon.com" http://localhost:8787/ | grep -o '<link rel="canonical"[^>]*>'   # https://other.allengillon.com/
```

`npm run start:vinext` runs `scripts/start-local.mjs`. Plain `wrangler dev` infers an origin from the first route in `wrangler.json` and rewrites every request's Host header to `allengillon.com`, which hides the host `proxy.ts` routes on. The script writes `dist/server/wrangler.local.json` without `routes` and runs `wrangler dev` on that, so Host headers reach the Worker unchanged. It also adds the vars `SITE_PREVIEW=1` and `SITE_DEV_PORT`, which reach `process.env` in the Worker through `nodejs_compat`. Deploys still use `dist/server/wrangler.json`, which has neither.

## Review moderation

New visitor reviews are saved as `pending`, so nothing appears publicly without approval.

List pending reviews:

```sh
npm run reviews:pending
```

Approve a review after copying its ID from that list:

```sh
npx wrangler d1 execute allen-gillon-reviews --remote --command "UPDATE reviews SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = 'REVIEW_ID'"
```

Reject a review:

```sh
npx wrangler d1 execute allen-gillon-reviews --remote --command "UPDATE reviews SET status = 'rejected' WHERE id = 'REVIEW_ID'"
```

The public API returns approved reviews only. The form also includes a hidden honeypot and a minimum completion time to block basic automated submissions without interrupting visitors.
