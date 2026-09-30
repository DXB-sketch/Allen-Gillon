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
- [ ] One BookReader (react-pageflip) for all 12 titles, shared controls
- [ ] Play previews (previewPages, end panel, counter wording, Buy only)
- [ ] Play audio preview clips; full recordings moved to private/
- [ ] Text alternative toggle + /read/[slug]/text for stories and textbooks
- [ ] books.config.json fields, build-books download gating, preview-only page images
- [x] Story cues + review reports (HTML + CSV) for 4 stories; unverified => follow off (content/story-cues, docs/cue-review; stable-ts alignment; all verified:false). Reader wiring pending.
- [ ] Auto-turn behaviour rules
- [ ] Textbooks live (read online + download PDF)
- [ ] Gate: story-cues, leak, reader DOM tests pass

## W5 Declutter and art direction
- [x] Illustration system + motion observer (components/illustrations/TwoInk, MotionObserver, app/illustrations.css)
- [x] Home, Bookings, Albums, Timeless, Stories, Ann's art, Reviews, Comments, Other home (merged; each implemented, 2-lens reviewed, fixed)
- [ ] Counted checks (anns-art index 0 Buy / 0 View 1; each detail exactly 1 Buy/Enquire; unit test)
- [ ] Gate: counted checks, screenshots, grep checks

## W6 SEO
- [~] Metadata per page, templates, canonicals (lib/seo.mjs ROUTE_META done; per-page wiring per docs/SEO-WIRING.md pending)
- [x] Host-aware robots + sitemap (lib/seo.mjs, tests/seo.test.mjs)
- [~] Icons + manifest per host (public/icons/{main,other} built; wiring pending)
- [~] OG images (65 built via scripts/build-og.mjs + content/og-images.json; wiring pending)
- [~] JSON-LD lib/schema.mjs + test (library + 19 tests merged; wiring into pages pending)
- [ ] Performance: Dynalight self-hosted, _headers, LCP preload

## W7 Accessibility and legal
- [ ] Landmarks, captions, transcripts, scroll padding, contrast fixes
- [ ] /privacy, /terms, /accessibility, /delivery; legal.config.json gate
- [ ] Footers contact + legal links + copyright
- [ ] LEGAL-TODO.md

## DEFINITION OF DONE
- [ ] Now-playing bar
- [ ] Stories paragraph
- [ ] Chimes auto-turn
- [ ] Cue reports
- [ ] One reader
- [ ] Play previews
- [ ] Textbooks
- [ ] No paid-content leak
- [ ] Albums free
- [ ] Font and names
- [ ] Speech
- [ ] other.allengillon.com
- [ ] Host routing
- [ ] Unique metadata
- [ ] Declutter
- [ ] Ann's art
- [ ] Art direction
- [ ] Full width
- [ ] SEO
- [ ] Accessibility
- [ ] Legal
- [ ] Progress

- Open questions from agents: docs/open-questions-raw.md

## Blocked on the human (TODO, not blocking other work)
- [B] Create A$1 play Payment Links, then set `playLinksCurrent: true`
- [B] Cloudflare: Email Routing for support@, `other` custom domain + DNS, cache purge, managed robots.txt, retire Vercel
- [B] Legal text sign-off, play licence terms (legal pages stay unpublished)
- [B] Ultra-wide cap, /shows indexing, tel: links, painting dimensions and medium
- [B] funny-fah mp3 repeats 338-537 s after 541 s (pages 23-34 read twice): trim at ~541 s or re-render, then re-run scripts/align-story-cues.py
- [B] Cue ear-check sign-off per story (docs/cue-review/<slug>/index.html; low-confidence picture pages listed there); ElevenLabs source script if alignment confidence < 0.6
- [B] Confirm "Albums" as the /music H1 wording
- [B] Confirm /music lede edit: "Individual song downloads are available in each track list." (was "...under the three-dot menus")
