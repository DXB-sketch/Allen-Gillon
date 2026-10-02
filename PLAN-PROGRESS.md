# Plan progress

Source: `Allen-Gillon-redesign-plan-and-prompt.md`. Branch: `overhaul`. Update after every item.
Legend: `[x]` done and verified, `[ ]` open, `[B]` blocked on the human (see bottom).

## Phase 0 baseline
- [x] Branch `overhaul` created, `npm install`, existing tests green (3/3)
- [x] Baseline screenshots (375/768/1280/1920) in `docs/screenshots/before/`
- [x] Baseline axe results recorded (docs/screenshots/before/axe-baseline.json)
- [x] Toolchain: ffmpeg 9, Ghostscript 10.05.1, Python 3.12 + stable-ts/faster-whisper/yt-dlp/ocrmypdf
- [x] Textbook PDFs compressed and legibility-checked (scripts/incoming/processed: 13.3, 12.0, 13.5 MiB; text layers intact). No R2 needed.

## W1 Email fixes
- [x] a) Player status machine, words in bar, previews labelled and never auto-advance, mediaSession, aria-live
- [x] b) Allen's Stories paragraph beside the Chinese Chimes H2 (rendered HTML grep)
- [x] c) PageReader leaf-block reading, TreeWalker skip, dedupe + DOM test
- [x] d) `normaliseForSpeech()` + tests/speech.test.mjs
- [x] e) PageReader single "Listen to this page" control, voice prop from layout
- [x] Gate: W1 unit tests + Playwright now-playing tests pass

## W2 Subdomain split
- [x] lib/sites.mjs (SITES, ROUTE_OWNER, siteForHost, resolveRequest, crossSiteUrl, SITE_DEV_PORT)
- [x] Route groups (main)/(other), lang en-AU, data-site, metadataBase per group
- [x] SiteMast / SiteFooter with cross-site absolute link, no hamburger
- [x] proxy.ts rules 1-6, /plays rule removed from next.config.mjs
- [x] tests/sites.test.mjs
- [x] Other home "The sideboard"
- [x] wrangler.jsonc other route, workers_dev false, preview_urls false; vercel.json noindex
- [x] /comments returnTo whitelist per host; host-aware not-found
- [x] CLOUDFLARE.md updated
- [x] Gate: sites tests + local curl Host-header checks pass (robots/sitemap check deferred to W6)
- Notes: merged W1 (f83c1f9) and W2. Page reader voice per site via SiteChrome. Handed to W6: sideboard 1200x630 OG image, blue-led icon set, manifest (TODO(W6) in app/(other)/other-home/page.jsx). data-site on <html> via inline SITE_MARKER_SCRIPT. start:vinext now uses scripts/start-local.mjs (no routes, SITE_PREVIEW=1).

## W3 Design foundation
- [x] Tokens, named-line grid, full width mast/footer/bands
- [x] Per-page `<style>` moved to CSS files
- [x] Shadows, double rules, decorative rules, chrome, kickers removed
- [x] Times New Roman body, Lora removed, DESIGN.md Layout/Illustration/Motion + line 51/56 updated
- [x] Gate: grep checks pass, no horizontal overflow, before/after screenshots (docs/screenshots/after-w3, CHECKLIST.md; e2e/layout.spec.mjs 8 widths x both hosts)
- Notes: --measure is 56ch, not 66ch (66ch at 20px Times gave 68-75 char lines; DESIGN.md rule is 60-72). Filled buttons use red-deep (white on red was 3.78:1). Play gate added: playPrice=100, playLinksCurrent=false, play-* links blank.

## W4 Reader, audiobooks, textbooks
- [x] One BookReader (react-pageflip) for all 12 titles, shared controls
- [x] Play previews (previewPages, end panel, counter wording, Buy only)
- [x] Play audio preview clips; full recordings moved to private/
- [x] Text alternative toggle + /read/[slug]/text for stories and textbooks
- [x] books.config.json fields, build-books download gating, preview-only page images
- [x] Story cues + review reports (HTML + CSV) for 4 stories; unverified => follow off (content/story-cues, docs/cue-review; stable-ts alignment; all verified:false). Reader wiring pending.
- [x] Auto-turn behaviour rules
- [x] Textbooks live (read online + download PDF)
- [x] Gate: story-cues, leak, reader DOM tests pass (build:books --force + build:vinext + npm test 211/211; only story/textbook PDFs public; plays 6 preview images each; full play mp3s in private/)

## W5 Declutter and art direction
- [x] Illustration system + motion observer (components/illustrations/TwoInk, MotionObserver, app/illustrations.css)
- [x] Home, Bookings, Albums, Timeless, Stories, Ann's art, Reviews, Comments, Other home (merged; each implemented, 2-lens reviewed, fixed)
- [x] Counted checks (anns-art index 0 Buy / 0 View 1; each detail exactly 1 Buy/Enquire; unit test) (curl on the built Worker: index 0 and 0, 36 of 36 details exactly 1; tests/artwork-purchase.test.mjs)
- [x] Gate: counted checks, screenshots, grep checks (docs/screenshots/after re-captured with the scroll and decode pass; no offset shadows, ⋯, "no refunds" or em dashes in app/components/content)
- Notes (fixer round 1): DESIGN.md Layout records the accepted amendments: the home hero is a split, not a full-bleed band, because the only photo is 600px [B: larger original]; the albums stand on one drawn shelf board with clamp() sleeves; one action per book on /books (text-only in the reader), except textbooks, which show "Read online" and "Download PDF" as W4 requires (restored in 8a5964d); More on Allen page titles take the blue lead.

## W6 SEO
- [x] Metadata per page, templates, canonicals (every page wired, /read and /read/*/text included; docs/SEO-WIRING.md)
- [x] Host-aware robots + sitemap (lib/seo.mjs, tests/seo.test.mjs)
- [x] Icons + manifest per host (group layouts and pageMetadata)
- [x] OG images (65 built via scripts/build-og.mjs; served through pageMetadata)
- [x] JSON-LD wired into every page (/books: all 12 Book nodes; /read: Book + breadcrumbs; /delivery and legal: breadcrumbs)
- [B] JS budget 150 KB gzip: 9 of 16 measured routes pass; /music (152.6), /reviews (151.2), /comments (150.1), /anns-art (156.2), painting pages (152.3) and /read (167.9) are over (vinext floor 138.3 KB; docs/PERFORMANCE.md). Human decision, see bottom.
- [x] Static HTML with cache headers: every (main) and (other) page is static (`revalidate = false` in the group layouts; the host-aware root not-found that made every page `no-store` is replaced by static per-group not-founds). The edge gets `s-maxage=31536000, stale-while-revalidate` through @vinext/cloudflare's CDN adapter, the browser `private, max-age=0, must-revalidate`; /comments and 404s stay `no-store` (docs/PERFORMANCE.md, Cache headers). [B] confirm `cf-cache-status: HIT` after deploy.
- [x] Performance: Dynalight self-hosted (plus a size-adjusted Times fallback), _headers (/_next/static immutable, /icons daily revalidate), LCP preload with fetchpriority (other home now preloads its real LCP page), responsive shelf covers on /music
- [x] Lighthouse mobile recorded in docs/PERFORMANCE.md for every route on both hosts (fixer round 2): Performance 91 to 97 everywhere, CLS 0.000 to 0.008, Accessibility and Best Practices 100, SEO 100 except /comments (66, the spec-mandated noindex exception). 720px copies of book pages and paintings, a srcset preload for the /read cover, low-priority wall photos on /anns-art. Simulated LCP 2.35 to 3.40 s is [B] with the JS budget and a post-deploy re-run.

## W7 Accessibility and legal
- [x] Landmarks, captions, transcripts, scroll padding, contrast fixes (e2e/w7-a11y.spec.mjs, tests/contrast.test.mjs)
- [x] /privacy, /terms, /accessibility, /delivery; legal.config.json gate (legal pages 404 on both hosts while unpublished; tests/legal.test.mjs)
- [x] Footers contact + legal links + copyright
- [x] LEGAL-TODO.md
- [x] Keyboard: Go to page and Close player keep focus (Go to page button; the control that started the track, else #main)
- [x] Coverage: pa11y includes the 7 /read/<slug>/text routes and one 404 per host; e2e/layout.spec.mjs has a 200% zoom pass; e2e/reader-audio.spec.mjs covers VERIFICATION > Audio

## DEFINITION OF DONE
- [x] Now-playing bar (e2e/now-playing.spec.mjs)
- [x] Stories paragraph (rendered HTML grep, e2e/books.spec.mjs)
- [x] Chimes auto-turn (2026-10-02): on for all 4 stories (cue files signed off, verified:true) and always on, with no switch. While a story's audiobook plays, the book turns each time the narration reaches a new page; after a manual flip, or on coming back to /read while it plays, it goes to the narrated page at the narration's next page turn (no jump before that). Unit tested, and e2e/reader-audio.spec.mjs checks it in a browser (turns land within 0.5 s using a 0.45 s look-ahead).
- [x] Cue reports: all 4 in docs/cue-review; every title has follow off until signed off
- [x] One reader
- [x] Play previews (no $50 link rendered; "A$1 download. Online checkout coming soon" in the readers and on /books)
- [x] Textbooks
- [x] No paid-content leak in public/ and dist/client (tests/books-leak.test.mjs). private/ is no longer tracked in git; [B] the public repo history still holds the files (see bottom).
- [x] Albums free
- [x] Font and names
- [x] Speech
- [x] other.allengillon.com (locally, on the built Worker; [B] custom domain and DNS)
- [x] Host routing (tests/sites.test.mjs; www robots.txt, sitemap.xml and favicon now 301 to the apex too)
- [x] Unique metadata (tests/seo.test.mjs; every other-host title now carries "· More on Allen")
- [x] Declutter
- [x] Ann's art
- [x] Art direction
- [x] Full width (e2e/layout.spec.mjs)
- [B] SEO: every W6 item is present; the Rich Results Test and Schema validator need the deployed URLs
- [B] Accessibility: axe and pa11y pass; Lighthouse Accessibility 100, Best Practices 100 and Performance 90 or more on every route; the LCP 2.5 s threshold (simulated) waits on the JS budget decision and a post-deploy run (docs/PERFORMANCE.md). The legal pages can only be audited once published.
- [x] Legal (pages exist, gated on sign-off by content/legal.config.json)
- [x] Progress

- Open questions from agents: docs/open-questions-raw.md

## Blocked on the human (TODO, not blocking other work)
- [B] Create A$1 play Payment Links, then set `playLinksCurrent: true`
- [x] Cloudflare (2026-10-01): deployed overhaul (version 20e6c5ee); other.allengillon.com custom domain and DNS created by the deploy; remote D1 reviews migration applied (GET /api/reviews 200); Email Routing enabled with MX records live and support@allengillon.com forwarding to allen0295@gmail.com; Vercel copy (allengillon-mockups) paused. Live robots.txt shows only our rules, so no Managed robots.txt is prepended. No manual cache purge was needed: both hosts serve the new titles.
- [B] Allen: click the Cloudflare verification email sent to allen0295@gmail.com, or support@ mail will not forward
- [B] Legal text sign-off, play licence terms (legal pages stay unpublished)
- [B] Ultra-wide cap, /shows indexing, tel: links, painting dimensions and medium
- [x] funny-fah mp3 repeat removed (2026-10-02): trimmed at 540.75 s (stream copy, in the pause after "...was not a monster?"; the repeat began at 540.98 s with "Boom!") and saved as funny-fah-learns-when-to-stop-v2.mp3; cue file audio, audioSha256 and duration updated (cues unchanged, all before the cut); old mp3 removed
- [B] Optional cue ear-check per story (cues are live without it) (docs/cue-review/<slug>/index.html; low-confidence picture pages listed there); ElevenLabs source script if alignment confidence < 0.6
- [B] JS budget: accept the overage on interactive routes, raise the budget to 160 KB, or choose one of the options in docs/PERFORMANCE.md
- [B] Confirm "Albums" as the /music H1 wording
- [B] Confirm /music lede edit: "Individual song downloads are available in each track list." (was "...under the three-dot menus")
- [B] The GitHub repo is public and its history (including origin/master) holds the full play PDFs, the full play recordings and play page images past the preview. private/ is now untracked and ignored; make the repo private or purge the history (git filter-repo) and force-push, which only the human can approve.
- [B] Home hero: supply a larger original of allen-playing-red-gibson-waterfront.jpg (at least 2400px wide) if the hero should become a full-bleed band (DESIGN.md Layout, amendments)
- [x] Audio seeking (2026-10-01): production answered Range with 200 on every static file, so seeking failed live. /audio/* and /videos/* now go to the Worker first and proxy.ts serves them with 206/416 (lib/media-range.mjs, tests/media-range.test.mjs). Live: 206 with Content-Range, and a browser seek to 5:00 lands at 5:03.
- [B] After deploy: Lighthouse mobile on both hosts, the Rich Results Test and the Schema validator
- [x] After deploy: /other-home and /plays redirect to https (checked live)
- [x] After deploy: remote reviews migration applied; GET /api/reviews returns 200
- [x] After deploy: cf-cache-status HIT on both hosts, each serving its own title (no host collision); robots.txt and sitemap.xml differ per host (5 and 60 URLs)
- [B] After the legal pages are published: `npm run a11y:pa11y`, the axe sweep and Lighthouse on /privacy, /terms and /accessibility
- [B] Legal check: the paintings' JSON-LD return policy (MerchantReturnNotPermitted), see LEGAL-TODO.md
- [B] Desktop only: opening a play preview's cover in a two-page spread shifts layout by about 0.10 once (react-pageflip's hard cover). Accept, use a soft cover, or stop the automatic opening (docs/PERFORMANCE.md)
