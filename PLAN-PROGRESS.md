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
- [ ] a) Player status machine, words in bar, previews labelled and never auto-advance, mediaSession, aria-live
- [ ] b) Allen's Stories paragraph beside the Chinese Chimes H2 (rendered HTML grep)
- [ ] c) PageReader leaf-block reading, TreeWalker skip, dedupe + DOM test
- [ ] d) `normaliseForSpeech()` + tests/speech.test.mjs
- [ ] e) PageReader single "Listen to this page" control, voice prop from layout
- [ ] Gate: W1 unit tests + Playwright now-playing tests pass

## W2 Subdomain split
- [ ] lib/sites.mjs (SITES, ROUTE_OWNER, siteForHost, resolveRequest, crossSiteUrl, SITE_DEV_PORT)
- [ ] Route groups (main)/(other), lang en-AU, data-site, metadataBase per group
- [ ] SiteMast / SiteFooter with cross-site absolute link, no hamburger
- [ ] proxy.ts rules 1-6, /plays rule removed from next.config.mjs
- [ ] tests/sites.test.mjs
- [ ] Other home "The sideboard"
- [ ] wrangler.jsonc other route, workers_dev false, preview_urls false; vercel.json noindex
- [ ] /comments returnTo whitelist per host; host-aware not-found
- [ ] CLOUDFLARE.md updated
- [ ] Gate: sites tests + local curl Host-header checks pass

## W3 Design foundation
- [ ] Tokens, named-line grid, full width mast/footer/bands
- [ ] Per-page `<style>` moved to CSS files
- [ ] Shadows, double rules, decorative rules, chrome, kickers removed
- [ ] Times New Roman body, Lora removed, DESIGN.md Layout/Illustration/Motion + line 51/56 updated
- [ ] Gate: grep checks pass, no horizontal overflow, before/after screenshots

## W4 Reader, audiobooks, textbooks
- [ ] One BookReader (react-pageflip) for all 12 titles, shared controls
- [ ] Play previews (previewPages, end panel, counter wording, Buy only)
- [ ] Play audio preview clips; full recordings moved to private/
- [ ] Text alternative toggle + /read/[slug]/text for stories and textbooks
- [ ] books.config.json fields, build-books download gating, preview-only page images
- [ ] Story cues + review reports (HTML + CSV) for 4 stories; unverified => follow off
- [ ] Auto-turn behaviour rules
- [ ] Textbooks live (read online + download PDF)
- [ ] Gate: story-cues, leak, reader DOM tests pass

## W5 Declutter and art direction
- [ ] Illustration system + motion observer
- [ ] Home, Bookings, Albums, Timeless, Stories, Ann's art, Reviews, Comments, Other home
- [ ] Counted checks (anns-art index 0 Buy / 0 View 1; each detail exactly 1 Buy/Enquire; unit test)
- [ ] Gate: counted checks, screenshots, grep checks

## W6 SEO
- [ ] Metadata per page, templates, canonicals
- [ ] Host-aware robots + sitemap
- [ ] Icons + manifest per host
- [ ] OG images
- [ ] JSON-LD lib/schema.mjs + test
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

## Blocked on the human (TODO, not blocking other work)
- [B] Create A$1 play Payment Links, then set `playLinksCurrent: true`
- [B] Cloudflare: Email Routing for support@, `other` custom domain + DNS, cache purge, managed robots.txt, retire Vercel
- [B] Legal text sign-off, play licence terms (legal pages stay unpublished)
- [B] Ultra-wide cap, /shows indexing, tel: links, painting dimensions and medium
- [B] Cue ear-check sign-off per story; ElevenLabs source script if alignment confidence < 0.6
- [B] Confirm "Albums" as the /music H1 wording
