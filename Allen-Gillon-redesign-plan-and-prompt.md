# Plan

## Why visual hierarchy and decluttering matter (put this in front of every decision)
Most of Allen's visitors are older: venue managers, teachers, parents and grandparents. For them, clutter on this site causes real failures, not just a dated look.
- **Every extra border, rule, chip or button competes for attention.** Right now the site has 29 identical "Buy this painting" buttons, 42 "⋯" menus and a rule between every row, all at the same weight. Nothing stands out, so visitors can't tell what to look at or what to do first. Older users often see contrast less well and have less patience for scanning. They give up or click the wrong thing.
- **A clear hierarchy fixes this.** Each page gets exactly one primary thing (the artwork, the book, the phone number) and one visible action per object. Everything else appears on demand. The eye knows where to go, and screen-reader and keyboard users get a shorter, more logical path. This is the practical core of WCAG 1.3.1, 2.4.3, 2.4.6 and 3.2.
- **Decluttering is what lets the art direction work.** The Small Dark One and Lama Lama references look artistic because they hold back everywhere except where the art is. Illustration layered on top of the current boxes and lines would just add noise. Space and scale should separate content, not lines and cards.
- **Credibility and SEO.** Generic "AI template" patterns make a small artist's site look mass-produced: offset shadows, pill chips, kicker labels, card grids. Duplicated DOM also hurts crawling and performance (every biography photo is currently rendered twice), and so does hidden text.

## Phases (order, dependencies and gates)
| # | Phase | Depends on | Output | Gate before the next phase |
|---|---|---|---|---|
| 0 | Baseline: create a git branch, get tests green, take screenshots of every route at 375/768/1280/1920, record a Lighthouse and axe baseline, create `PLAN-PROGRESS.md` | none | A reference point | Baseline files committed |
| 1 | Email fixes (W1): now-playing bar, Stories paragraph, PageReader double-read, price speech | 0 | Small, safe fixes that can ship first | The W1 tests and the Playwright now-playing test pass |
| 2 | Subdomain architecture (W2): `lib/sites.mjs`, route groups, `proxy.ts`, other-site home, cross-links, wrangler route | 0 | Two hosts working locally | tests/sites.test.mjs passes and the curl Host-header checks pass |
| 3 | Design foundation (W3): full-width grid, move CSS out of pages, remove shadows, rules and kickers, amend DESIGN.md | 1 and 2 merged | A clean base | The grep checks pass and there is no horizontal overflow at any tested width |
| 4 | Unified book reader, synced audiobooks, textbooks made active (W4) | 3 (textbook PDFs are in scripts/incoming/) | One animated reader for all 12 titles | The story-cues, reader and build-books tests pass, and every cue report is signed off or follow is off for that title |
| 5 | Page-by-page declutter and art direction (W5) | 3 and 4 | The redesign | The counted checks (Ann's art and others) pass, and before/after screenshots are attached |
| 6 | SEO (W6): metadata, icons, manifest, OG images, JSON-LD, host-aware sitemap and robots, performance | 2 and 5 | Search-ready on both hosts | The schema test passes, every title is unique, and robots and sitemap are correct per host |
| 7 | Accessibility and legal (W7) | 2 and 5 | Compliant pages, `LEGAL-TODO.md` | axe and pa11y pass, and the legal wording checks pass |
| 8 | Verification matrix, then deploy, DNS, cache check and Search Console | all | Live | The post-deploy curl checks pass |

Phases 1 and 2 can run in parallel worktrees. Once phase 3 has merged, phases 4, 5 (split by page) and 6 can run in parallel with separate agents. The agent ticks off every item in `PLAN-PROGRESS.md` as it finishes, so a resumed /goal knows where it stopped.

## Decisions already made (these are also in the prompt)
- **Plays** cost **A$1** each (`playPrice = 100`). Online, visitors get a **preview only**: the first pages of each play, plus a short clip of the play recording where one exists. The full page images, full PDFs and full recordings must not be publicly reachable. The existing $50 Payment Links are switched off in the site, so Buy shows "coming soon" until Dexter creates the A$1 links in Stripe.
- **Albums** are free to download. The album Payment Links are no longer used.
- **Sellers.** **Ann Gillon** sells the paintings; **Allen Gillon** sells everything else. There is **no ABN**.
- **Refunds.** No change-of-mind refunds. Refunds are given only when the Australian Consumer Law requires them, for example goods that are damaged, destroyed, faulty or not as described. The wording must keep the ACL guarantee sentence and must never say "no refunds" outright.
- **Email.** The public contact is **support@allengillon.com**. Dexter sets it up in Cloudflare Email Routing to forward to Allen's Gmail.
- **Body font.** **Times New Roman** (system stack). Lora is removed.
- **Other site name.** **"More on Allen"**, Allen's personal side: family, writing, Timeless and Ann's art. The paths `/biography` and `/books` stay as they are.
- **Textbook PDFs** are in `scripts/incoming/`, and their publishing rights are cleared.

## What still needs the human (Claude Code leaves a TODO and keeps going; it does not block)
- **Stripe.** Create the five A$1 play Payment Links and the after-payment URLs on `other.allengillon.com`, then add them to `content/stripe-payment-links.mjs`.
- **Cloudflare dashboard.** Set up Email Routing for support@. Add the `other` custom domain, checking that no DNS record for it already exists. After deploy, purge the cache and check the Managed robots.txt setting. Retire the Vercel copy.
- **Search Console and Bing.** Add a Domain property and submit both sitemaps.
- **Legal sign-off.**
  - The final legal wording.
  - The school-play performance licence terms.
  - APRA AMCOS for the cover recordings.
  - The ElevenLabs licence.
- **Hosting and content.**
  - R2, if a textbook PDF is still over about 25 MiB after compression.
  - Painting dimensions and medium.
  - An ultra-wide cap (the default is none).
  - Whether /shows is indexed or noindexed.
  - A tel: link, if Allen accepts calls.
- **Final ear-check** of the story cue timings, using the review report.

# Claude Code prompt

~~~
/goal Ship the full allengillon.com overhaul described below. It covers: the email fixes; one animated book reader with audiobooks synced to within 0.5 s; the textbooks made live; the other.allengillon.com split into its own working site; a declutter and art-direction redesign of the whole site using full desktop width; heavy SEO; WCAG 2.2 AA; and Australian legal pages. Every item in the DEFINITION OF DONE must be checkably true. Track progress in PLAN-PROGRESS.md at the repo root and update it after every completed item so the goal can resume.

## GOAL
Allen Gillon (81, guitarist and author, Bribie Island QLD) is separating his music and professional work from his family, writing and art work.
- **allengillon.com** serves Home, Bookings (/hire) and Albums (/music), plus /reviews, /shows and the legal pages.
- **other.allengillon.com** serves its own new Home, Timeless (/biography), Stories (/books and /read/[slug]), Ann Gillon (/anns-art) and /delivery.

Both sites must look deliberately designed: clear hierarchy, no clutter, full width, and two-ink line-art stylisation. Both must also be fully SEO-optimised, accessible and legally compliant. The audience is older, so accessibility is a core value, not an add-on.

## DECISIONS ALREADY MADE BY THE HUMAN (do not ask again)
- **Plays**
  - Price: A$1 each. Set `playPrice = 100` in lib/storefront.mjs.
  - Online: preview only. Show the first `previewPages` pages (default 6, set per title in books.config.json), then a "Buy the full script" end panel.
  - Play recordings (melting-pot, breakout): preview only. Make a 60-second clip with ffmpeg (`public/audio/school-play-previews/<slug>.mp3`) and move the full mp3s out of public/ into private/.
  - Only preview page images may exist under public/ or dist/client. The build must not emit the other page images, the full text or the PDFs.
  - Buy links: the existing play Payment Links charge $50, so the site must not use them. In lib/storefront.mjs, ignore `play-*` keys unless a new `playLinksCurrent: true` flag is set. PurchaseLink then shows "A$1 download. Online checkout coming soon". Leave content/stripe-payment-links.mjs and all Stripe products untouched.
- **Albums** are free to download. Do not render any album Payment Link. Album JSON-LD offers have price 0.
- **Sellers and business**
  - Ann Gillon sells the paintings. Allen Gillon sells everything else (play PDFs). Name each correctly in the terms, footers and JSON-LD Offer `seller`.
  - There is no ABN, so do not show or ask for one.
- **Refunds.** No change-of-mind refunds. The remedy is repair, replacement or refund where the Australian Consumer Law requires it, for example goods that are damaged or destroyed in transit, faulty, or not as described, and digital files that are corrupt or never delivered. Keep the ACL guarantee sentence. Never write a blanket "no refunds".
- **Contact email.** support@allengillon.com (a mailto link). It forwards to Allen's Gmail through Cloudflare Email Routing, which the human sets up. Show it in both footers, on /privacy and /terms, and in JSON-LD `email`.
- **Body font: Times New Roman.**
  - `font-family: "Times New Roman", Times, "Liberation Serif", serif`.
  - Remove the Lora import from app/layout.jsx, then update DESIGN.md:51 and the site.css header to match.
  - Self-host only Dynalight. Do not embed Times, because it is a system font and web licensing is unclear.
  - Check that 20px Times still meets the line-length and contrast rules.
- **Other site name: "More on Allen"**
  - It covers Allen's personal side: family, writing, Timeless and Ann's art.
  - Title template: "%s · More on Allen".
  - OG siteName and manifest name: "More on Allen".
  - Cross-link text from main: "More on Allen: stories, Timeless and Ann's art".
  - Keep the /biography and /books paths.
- **Textbooks.** The PDFs are in scripts/incoming/ and their publishing rights are cleared. Make them readable online and downloadable.

## CONTEXT AND HARD CONSTRAINTS
- **Stack.**
  - Next.js 16 App Router, React 19, plain CSS (app/site.css).
  - Built with vinext 1.0.0-beta.12 and deployed to Cloudflare Workers (wrangler.jsonc, D1 binding REVIEWS_DB, `cache.enabled:true`, a www custom_domain).
  - Stripe Payment Links.
  - Do not upgrade vinext.
  - Read CLOUDFLARE.md, STRIPE-SETUP.md, DESIGN.md, PRODUCT.md and ARTWORK-CATALOGUE.md first.
- **Workers runtime.** There are no filesystem reads at request time. Import JSON statically, the same way the book manifests are imported now.
- **Scripts.** `npm test` = `node --test tests/*.test.mjs`. `build:vinext`, `start:vinext` (wrangler dev on port 8787), `dev:vinext` (port 3001) and `build:books` already exist. A new devDependency for DOM tests (jsdom or happy-dom) and `@playwright/test` plus `@axe-core/playwright` are allowed.
- **Keep the design spec.**
  - Keep the OKLCH palette tokens in site.css:7-15 (paper, paper-2, ink, red, red-deep, blue, soft, on). Never use #000 or #fff. Fix `background:#fff` at app/comments/page.jsx:23 and `white` in the BookReader CSS.
  - Dynalight titles appear only at 2rem or larger, with the blue overprint text-shadow. That text-shadow is allowed.
  - Body text is 20px (19px at 820px and below) with line-height 1.6. Body contrast must be at least 7:1.
  - Targets are at least 44px; buttons are 48px. The focus outline is 3px blue with a 3px offset; use a paper-coloured outline on ink bands.
  - Nothing important is hover-only. Support prefers-reduced-motion fully.
  - Red means music and performance. Blue means the written work.
  - Body font: Times New Roman, per the DECISIONS above. Remove Lora.
- **Copy rules.** Keep Allen's wording. No em dashes in copy. Sentence case throughout.
- **Stripe.**
  - Leave the Payment Links and content/stripe-payment-links.mjs untouched.
  - Every Buy `href` must come from that file through the existing PurchaseLink component, with the play-link gate from the DECISIONS.
  - Paid play PDFs, full play recordings and non-preview play page images stay in private/ and never go under public/ or dist/client.
- **Anti-patterns (never use):**
  - gradients (remove the body radial washes and `background-attachment:fixed` at site.css:27-29). EXCEPTION: keep the existing `.disc` vinyl label and grooves drawing (site.css:117-121).
  - gradient text, glass or blur
  - drop or offset shadows. EXCEPTION: react-pageflip's own page-curl shadow (`drawShadow`), the book-spine inset shadow and the Dynalight overprint text-shadow.
  - rounded cards, identical 3-up card grids, bordered "View N" chips, pill-plus-ghost button pairs
  - sliding hover arrows, underline wipes, lift-on-hover
  - emoji, stock icon sets
  - uppercase letter-spaced kicker labels, a single recoloured accent word, side-stripe borders
  - generic `ease` or bounce easing, fade-up on every block, preloaders
  - hamburger menus
- **Test for every element.** If removing it loses nothing, remove it. Decoration lives only in margins or structure, is drawn in the two-ink line style, and is aria-hidden.
- **Amend DESIGN.md explicitly** with new Layout, Illustration and Motion sections. Replace DESIGN.md:56 ("Motion budget: none beyond the gallery-arrow opacity fade…") with the motion rules in W5. Update DESIGN.md:51 only after the font answer. Do not diverge silently.

## WORKSTREAMS

### W1 Email fixes
**a) Now-playing bar (components/Player.jsx)**
- Replace the booleans with `status: idle|loading|playing|paused|ended|error`, driven by audio events. Use `await audio.play().catch(()=>setStatus('error'))`.
- Set `current` only once playback succeeds. Reset pos and time when the source changes.
- The bar states what is happening in words: "Paused: Misty", "Finished: Misty", "Couldn't play Misty".
- Never silently auto-advance into a track the user didn't choose.
- The 30-second preview tracks must not auto-advance. These are MA5 Chandler Theatre and "Dedicated to Tim Hughes". Label them "30-second preview" and show their real duration.
- Announce any auto-advance through aria-live.
- Set `navigator.mediaSession.metadata`.
- Playwright test:
  - Play a preview, wait 32 s, and assert the bar reads "Finished: <title>" and no audio element is playing.
  - Play a track, pause it from PageReader, and assert the bar reads "Paused: <title>".

**b) Stories paragraph**
- In app/books/page.jsx:59-62, inside `.section-heading` next to `<h2 id="stories-title">Chinese Chimes stories</h2>`, replace `<p>Four stories for young readers, each with a moral. Read them online or listen to the audiobooks.</p>` with exactly: "The characters in these stories are named after the musical scale: Doh, Ray, Mee, Fah, Soh, Lah, Tee, Doh, with an added Hi-Doh and Low-Doh. Here are four of Allen's stories for young readers. Each story contains an important moral, and the name of the Little Chime sometimes highlights it. A teacher or parent can read the eBook online, or watch and listen to the audiobook."
- When W5 removes `.section-heading`, keep this paragraph directly beside or under the H2.
- Check: the rendered /books HTML contains the exact string.

**c) PageReader double-read (components/PageReader.jsx `pageText()`)**
- Keep only leaf blocks: `!node.querySelector('h1,h2,h3,h4,h5,h6,p,li')`.
- Use a TreeWalker to skip `[hidden]`, `details:not([open])`, `button`, `summary`, `[aria-hidden=true]` and `[data-reader-skip]`.
- Remove consecutive identical chunks.
- Add a jsdom or happy-dom test that uses the /books, /read/<slug> and /anns-art markup and asserts each title and heading is read exactly once.

**d) Price speech**
- Add `normaliseForSpeech()` in lib/speech.mjs. It converts:
  - `$50 AUD`, `A$50` and `AUD $50` to "50 Australian dollars"
  - `$100–$250` and `A$100-250` to "100 to 250 Australian dollars"
  - a dash between numbers to "to"
  - `·` to a comma
  - `&` to "and"
- Apply it to every utterance. Visible text and formatAud stay as they are.
- Add tests/speech.test.mjs. Cover the formats above plus a generic cents case.

**e) PageReader UI**
- Collapse the full-width bar into a single "Listen to this page" control (at least 44px).
- Pause, stop and voice controls appear only once playback starts. Use friendly voice labels.
- The voice comes from a prop set by each site's layout, not from `allenPages` pathname matching.

**Gate.** W1 tests and the Playwright now-playing test pass. Tick them in PLAN-PROGRESS.md.

### W2 Subdomain split (one repo, one Worker, host routing)
**lib/sites.mjs**
- Exports SITES (main: allengillon.com; other: other.allengillon.com), ROUTE_OWNER, `siteForHost`, `resolveRequest(host, path, {env})` and `crossSiteUrl`.
- In dev and local preview, main is `localhost` and other is `other.localhost`. The port comes from `SITE_DEV_PORT` (default 3001; 8787 for start:vinext). Do not hard-code it.

**Route groups**
- app/layout.jsx sets html `lang="en-AU"` (it is currently `lang="en"` at line 16). It also keeps the fonts, PlayerProvider, NowBar and skip link, and sets `data-site`.
- app/(main)/layout.jsx holds page.jsx, hire, music, reviews, shows, privacy, terms and accessibility. It sets `metadataBase` to https://allengillon.com.
- app/(other)/layout.jsx holds biography, books, read/[slug], anns-art, delivery and a new other-home/page.jsx. It sets `metadataBase` to https://other.allengillon.com.
- /comments and not-found are host-aware (they read `headers().get('host')`).
- The legal pages are served only on main. Other-host footers link to them cross-host.

**Mast and footer**
- Replace Mast and Footer with a shared SiteMast and SiteFooter that take a link set per site.
- Add a visible cross-site `<a>` with an absolute URL (not next/link), with text such as "Stories, Timeless and Ann's art (Allen's other site)".
- Accept that cross-site navigation reloads the page and stops NowBar audio.
- Navigation stays visible and wraps on small screens. No hamburger.

**proxy.ts** (repo root; its matcher excludes static assets). Rules:
1. Requests to www return 301 to the apex.
2. A path owned by the other site, requested on main, returns 301 to other. The reverse also applies.
3. On the other host, "/" is rewritten to /other-home. Requesting /other-home directly returns 301 to "/".
4. /plays returns 301 to https://other.allengillon.com/books#school-plays. Remove the duplicate rule from next.config.mjs.
5. /api/* is never redirected. POST /api/reviews must keep working on both hosts.
6. Unknown hosts:
   - In production only, return 301 to main.
   - Never redirect loopback hosts (localhost, 127.0.0.1, ::1), `*.localhost`, `*.test`, or any host when `NODE_ENV!=='production'` or the preview flag is set. Treat those as main (or other for `other.*`).
   - This way Playwright and wrangler dev never hit production.

**Tests (tests/sites.test.mjs)**
- A table-driven test of `resolveRequest`.
- It must include: loopback and *.localhost never redirect; `/api/reviews` POST is non-3xx on both hosts; /other-home returns 301; each owned path returns 301 across hosts.
- Add a Playwright check that on other.*, client-side navigation to Home keeps `aria-current="page"` on the Home link despite the /other-home rewrite. OtherMast treats "/" and "/other-home" as Home.

**Cross-site links**
- Update them: biography to /shows, the Timeless links on /music, and the footers.
- The /comments `returnTo` becomes a whitelist per host.

**wrangler.jsonc**
- Add `{"pattern":"other.allengillon.com","custom_domain":true}`, `"workers_dev":false` and `"preview_urls":false`.
- Confirm the route appears in dist/server/wrangler.json after the build.
- Give vercel.json an `X-Robots-Tag: noindex` header.

**Other-site home, "The sideboard"**
- Three art-led doorways, each a single link: an open book with the Chimes cover, a framed painting, and a 1968 photo with photo corners.
- A link back to allengillon.com.
- Its own title, description, canonical (`https://other.allengillon.com/`), OG image, icon set and manifest (see W6).

**Docs.** Update CLOUDFLARE.md with the two-host setup, `SITE_DEV_PORT`, and how to test with `other.localhost`.

**Gate.** tests/sites.test.mjs passes, and the curl Host-header checks in VERIFICATION pass locally.

### W3 Design foundation and full width
**Tokens and grid**
- Tokens: `--gutter: clamp(16px,4vw,72px)`, `--measure: 66ch`.
- Replace `.wrap` and `--maxw` with a named-line grid: `[full-start] gutter [wide-start] repeat(12,minmax(0,1fr)) [wide-end] gutter [full-end]`.
- Images and bands can span full. Text sits at the measure, placed asymmetrically on the grid rather than in a centred column.
- No ultra-wide cap unless the human asks for one.
- Criterion: at 1440 and 1920 the mast, the hero or bands, and the gallery or shelf span the viewport minus `--gutter` on each side. Measure this in Playwright.

**Full width everywhere.** The mast, footer and bands go full width with gutter padding.

**No overflow tricks**
- Never use `100vw` in padded contexts.
- Use `min-width:0` on grid children.
- Replace the fixed 380/340/320px columns with fr units or clamp().

**Move CSS.** Move every per-page `<style>` block into site.css or per-route CSS files.

**Remove the offset shadows**
- .sleeve img
- .video .frame
- .bkr-cover-wait
- .text-cover
- the home photos
- .more-popover
- .btn

Keep the exceptions listed in the anti-patterns.

**Remove the double rules** on the mast and footer.

**.btn.** Keep the flat fill and clipped corner. Remove the translate. Hover changes colour only, with an ease-out curve.

**Remove the decorative rules**
- .ruled
- .trklist li
- .audiobook-list
- hr.secrule
- .writing-head
- .writing-section+.writing-section
- .gallery-tools
- .bkr-controls
- the review dividers
- .homeTestimonial

**Remove the rest of the chrome**
- `.note` boxes become plain text.
- Remove the `.upcoming-books` side stripe and its duplicate rule.
- Remove every uppercase kicker.
- Remove the red "date" span on /hire.
- Remove the gutter hacks.

**Photos.** No border by default. Frames appear only where they mean something: the gallery, sleeves and books.

**Comments.** Replace the per-item `.comment-link` chips and "⋯" menus with one quiet comment link per section or page.

**Minimum text size.** Nothing readable is below 1rem.

**Hierarchy.** Each page has three levels:
- L1: a Dynalight lockup at clamp(4rem,11vw,10rem)
- L2: section titles
- L3: body

Each object gets one visible primary action.

**Grep checks (must pass):**
- `rg "box-shadow" app components` matches only the allow-list: the book spine, react-pageflip and focus.
- `rg -n "<hr|\.ruled|more-menu|comment-link|text-transform:\s*uppercase|background-attachment" app components` returns nothing.
- `rg "font-size:\s*0?\.[0-8]" app/site.css` returns no readable-text selectors.

**Gate.**
- The grep checks pass.
- `scrollWidth <= clientWidth` at every tested width.
- Before/after screenshots of every route are committed to `docs/screenshots/` and listed in a PR checklist.

### W4 One book reader, synced audiobooks, textbooks active
**components/reader/BookReader.jsx** is used by every /read/[slug]: 4 stories, 5 plays and 3 textbooks.
- Always use react-pageflip, including for the Chimes titles with `largePages` that currently render a static img.
- Show a two-page spread for portrait pages on wide screens. Use a single-page flip for 16:9 pages and on narrow screens.
- Size the book from a ResizeObserver so it uses the width but fits the viewport height.
- Prototype 16:9 first. If react-pageflip fails, build an in-house CSS rotateY turn.
- The cover opens once. Under reduced motion, turns are instant.

**Controls (the same on every title)**
- 56px prev and next buttons on the book's edges.
- A quiet page counter with aria-live.
- A "Go to page" disclosure with a unique id.
- An Introduction link when `contentStartPage > 1`.
- One small toolbar above the book: Listen (when audio exists), Download (when `download==='public'`), and Buy (plays, replacing Download).
- The keyboard shortcuts (arrows, Home/End, PgUp/PgDn) only work when focus is inside `role=region`.
- Remove the shared-cover figure.
- Move the comment link and the "← Stories" back link out of the H1 area.

**Play access (decided).** Plays show a preview only: pages 1 to `previewPages`, then a final spread that says "That's the preview. Buy the full script (A$1)" with the PurchaseLink. The page counter reads "Preview: page 3 of 6 (full script 47 pages)". The only download action is Buy. Listen plays the 60-second preview clip, labelled "Listen to a preview".

**Text alternative**
- scripts/extract-text.mjs writes content/book-text/<slug>.pages.json.
- Add a "Show the words on this page" toggle to every title. This is the WCAG text alternative, including for plays.
- Add a server-rendered /read/[slug]/text route for stories and textbooks only. Clean the OCR noise.
- Plays get no full-text route. Their text is an excerpt plus the blurb, unless the human says otherwise.

**Config**
- Move contentStartPage, layout, sharedCover and `download: public|paid|none` into content/books.config.json. build-books.mjs writes them into the manifest.
- `download` defaults to `"paid"` for `section:"plays"`. Note that all five plays are currently `"status":"free"` (lines 2-6).
- Fix build-books.mjs:127 so it copies the PDF to public/ only when `download==='public'`.
- For plays, build-books emits page images only for pages 1 to `previewPages`. The full renders go to private/books/<slug>/ or are not kept at all. Delete the existing full play page images from public/books/<slug>/.
- Move public/audio/school-play-audiobooks/*.mp3 to private/audio/, and generate the 60-second preview clips.
- Test: after `npm run build:books -- --force && npm run build:vinext`, none of these exists under public/ or dist/client:
  - a play PDF
  - a play page image beyond `previewPages`
  - a full play recording

**Audiobook sync**
- Delete `storyPageTiming` and `pageCuesFor`. They rescale YouTube timings linearly, which causes the drift.
- Tolerance: each page turn lands within ±0.5 s of the first word of that page's narration.
- Try these methods in order, and stop at the first that works:
  1. **scripts/align-story-cues.py**, only if the Python toolchain installs. It needs WhisperX or stable-ts, faster-whisper, ffmpeg and yt-dlp, with network access.
     - Per-page reference text: OCR for little-ray and little-hi-doh; YouTube captions plus ffmpeg scene-change detection for funny-fah and imaginative-little-mee.
     - Align with stable-ts or WhisperX, falling back to faster-whisper word timestamps and then silencedetect snapping.
  2. If the toolchain is unavailable, go straight to a **dev-only cue tapper** at app/dev/cues. It must be excluded from the production build, the sitemap and routing (return 404 when `NODE_ENV==='production'`).
  3. **Piecewise-linear interpolation** between hand-verified anchors.
  4. If none of these reaches the tolerance, **turn follow off** for that title.
- Output content/story-cues/<slug>.json with start times, confidence and audioSha256.
- Output a review report (HTML plus CSV) with a 4-second clip at each cue for the human's ear-check.
- Never ship regenerated cues without sign-off. Record the sign-off per title in the cue file as `"verified": true`. Unverified titles ship with follow off.
- tests/story-cues.test.mjs asserts:
  - the number of cues equals pageCount
  - cues strictly increase
  - the first cue is 0
  - the last cue is less than the duration
  - the sha matches
  - follow is enabled only when `verified` is true

**Auto-turn behaviour**
- Pages follow the narration only when all three are true: the shared player's current source is THIS book, its status is `playing`, and the user has not suspended following.
- Reading without audio never turns a page. Pausing never turns a page.
- On mount while this book's audio is already playing (for example, started from /books), the reader starts suspended on the requested page. It shows "Follow the narration", which jumps to the narrated page and resumes following. There is no jump on mount.
- Pressing Listen in the reader:
  - If the player's source is this book, it seeks to `cues[page]`.
  - Otherwise it first loads this book's audio at `cues[page]`. It never seeks or hijacks an album track.
- A manual flip during playback suspends following and shows "Play from this page" and "Back to the narration". "Play from this page" follows the same source rule.
- Seeking in the NowBar while following turns the page.
- There is a "Turn pages with the narration" toggle, on by default.
- Plays with recordings (melting-pot, breakout) get "Listen to a preview", which plays the 60-second clip. It doesn't turn pages.

**Textbooks**
- The PDFs are in scripts/incoming/. Match the files there to the three slugs (practice-in-communication-book-1, practice-in-communication-book-2, riddled-with-language), even if the filenames differ. Only stop if a file genuinely can't be matched.
- Then:
  - Run ocrmypdf if there is no text layer.
  - Set status free and download public.
  - Run `npm run build:books`.
  - Add the manifests to app/read/[slug].
- Compress any PDF over about 25 MiB with `gs -dPDFSETTINGS=/ebook`. Then render 3 sample pages before and after, and check they are still legible. If a file is still too large or becomes illegible, STOP and ask about R2. Do not create R2 resources.
- On /books, each textbook shows "Read online" and "Download PDF". Remove the "Contact Allen…" text and the restricted branch.

**Gate.** The story-cues, build-books leak and reader DOM tests pass. The cue review reports exist for all 4 stories.

### W5 Page-by-page declutter and art direction
**Illustration system**
- Hand-authored inline SVG components in components/illustrations/.
- A single stroke of 2.5-3px with round caps, plus a misregistered second-ink copy offset about 3px at 30% opacity.
- Red-led on main and blue-led on other, set by `html[data-site]`.
- aria-hidden and pointer-events:none, and never under text.
- At most 40KB of decorative SVG per page.
- No AI rasters and no libraries: no GSAP, Framer, Lottie, Three or carousel libraries.

**Motion (this replaces DESIGN.md:56)**
- Use only transform, opacity and stroke-dashoffset, with ease-out curves.
- Each effect plays once, through a single IntersectionObserver of about 1KB.
- Final states render by default, so content is visible without JS.
- Under reduced motion, everything is static.
- No scroll-jacking anywhere. Never convert the vertical wheel into horizontal scrolling.

**Home**
- A full-bleed hero photo (allen-playing-red-gibson-waterfront.jpg) with the name as the L1 lockup.
- Two huge typographic doorways (Bookings, Albums) with a line-drawn headstock and a record.
- Venues as a legible two-ink handbill at 1.1rem or larger, replacing the collage. Remove the teal, magenta, ochre and green.
- One pull-quote with a `<cite>`.
- A line pointing to the other site.

**Bookings**
- A full-bleed ink band where "Text 0438 747 882" (sms:) is the largest text on the page, with a line-drawn spotlight.
- A tel: link only after the human confirms phone calls.
- Facebook as a text link.
- The two offers as headed columns with no rules.
- Quotes appear once, as a typographic strip.

**Albums**
- A full-width shelf with sleeves sized by clamp(). Keep the sleeve and the record slide-out.
- The sleeve becomes the only toggle. It is a `<button>` with `aria-expanded`, `aria-controls` and the accessible name "Show tracks for <album>" (visible text or visually hidden), and it is at least 44px. Only then remove `.tracklist-toggle`.
- Tracklist rows show play, title, time and a visible 44px download icon.
- Albums are free (decided). Move "Download album free" inside the open panel as its one primary action, and never render an album Payment Link.
- The disc spins only while that album's status is `playing`.
- Instruments slide in once from the page edges, partly off-canvas: a Trini Lopez Gibson drawn from Allen's photos in public/images/personal, a microphone on a stand, a flute and a piano-key strip. They never overlap text and are never sized from 100vw. On mobile, one instrument peeks from the header.
- Videos use a lite-YouTube facade in a clean 16:9 grid.
- The H1 is "Albums" (flag the wording to the human). Cut the instruction lede to one sentence.
- The Timeless duet videos stay here on an ink band, with absolute links to the other site.

**Timeless**
- Render every photo and video once (delete the duplicated sticky aside).
- Lay out the eras as scenes, with large Dynalight years in the gutter and photos in scrapbook corners, bleeding off alternating sides.
- A stage-pelmet curtain sits above the H1 and never covers it or any content. It parts once, and its parted state is the default render.
- The Matthew Allen 5 section stays quiet, with no ornament.
- Rewrite the alt text so it describes each image rather than repeating the caption.

**Stories**
- A visible H1 and three large shelf headings: Stories, Plays, Textbooks.
- Books stand on a drawn shelf as objects, each using its own p001.webp as the cover.
- One action per book. Prices are visible on the plays.
- Remove the numerals, the repeated subtitle, every ⋯ menu and `.section-heading`. Keep Allen's paragraph from W1b beside the Chinese Chimes H2.
- Vary how each section opens.
- Move the YouTube narration link to a tertiary link inside the reader.

**Ann's art**
- A short bio and one terms line: "Originals, A$100-250, free delivery in Australia".
- The rooms become text filter tabs with aria-pressed. The count moves to an sr-only live status.
- A server-rendered salon-hang index shows every work at its true aspect ratio. It is also the no-JS and SEO base, and it is the default view under prefers-reduced-motion.
- With JS and motion allowed, the index is enhanced into a full-bleed "hallway":
  - a horizontal scroll-snap track, moved only by arrows, keys, drag or swipe (never by the vertical wheel)
  - a drawn picture rail and skirting line
  - thin two-ink frames
  - a museum wall label with the title, medium and price or "Sold"
  - 64px prev and next arrows, ←/→ keys and a "12 of 36" live counter
- Add a "See every painting at once" toggle.
- Each painting gets a route /anns-art/[id], and opens as a native `<dialog>` over the wall.
  - Focus is trapped, Esc closes, and focus returns to the painting.
  - The dialog shows a large image with view arrows overlaid. They fade in on hover on pointer devices. They are always visible at `(hover:none)` and on `:focus-visible`, and they are reachable by Tab.
  - Views also change by swipe and by ←/→ keys, with "View 2 of 3" and dots.
  - Medium and size appear only when known. Then the price, ONE "Buy this painting" (a PurchaseLink from content/stripe-payment-links.mjs) or "Enquire", and a delivery link.
- Remove the per-card buttons, the "View N" chips, the "Original painting" status and the "By Ann Gillon" filler.
- Build responsive AVIF and WebP images with sharp (480/960/1600).
- Counted checks:
  - The /anns-art index HTML contains 0 "Buy this painting" and 0 "View 1".
  - Every /anns-art/[id] contains exactly 1 Buy or Enquire link.
  - Every artwork that has a Stripe link renders exactly that link on its detail route (unit test).

**Reviews**
- One large featured quote, then the table comments as an unruled cluster, then the approved reviews, with the form last.
- Every field gets a consistent 2px border.
- The form links /privacy.
- Remove "Back home".

**Comments.** A text link back. The SMS button is primary; Facebook becomes a text link.

**Gate.** The counted checks pass, the before/after screenshots are updated, and the grep checks still pass.

### W6 SEO (both hosts, no cost to users)
**Titles and descriptions**
- Each group layout sets a title template.
- Every page has a unique title (60 characters or fewer), a description (150-160 characters), an absolute `alternates.canonical`, openGraph (siteName, locale en_AU) and a twitter summary_large_image card.
- Suggested titles:
  - "Allen Gillon, guitarist on Bribie Island"
  - "Book a guitarist on Bribie Island and Moreton Bay"
  - "Free jazz and easy-listening guitar albums"
- The other-site home gets its own title, description, canonical, OG image and icons.
- /delivery gets a description.

**Robots and sitemap**
- Host-aware route handlers for app/robots.txt and app/sitemap.xml. If vinext can't serve them, fall back to a proxy rewrite to /api/robots and /api/sitemap.
- Each host's sitemap lists only the pages it owns. The legal pages appear only in the main sitemap.
- The other sitemap includes every /read slug, the story and textbook text routes, every /anns-art/[id], and image entries.
- robots.txt: `Disallow: /api/` plus the Sitemap line only.
  - Keep /comments crawlable, with `robots:{index:false}`.
  - Do not list /other-home, because it already returns 301.
  - Also noindex placeholder pages and app/dev.

**Icons and manifest**
- An "AG" monogram drawn as SVG paths: red-led for main and blue-led for other.
- Per host: favicon.ico (16/32/48), icon.svg, 192 and 512 PNGs, a maskable 512, a 180 apple-icon, a manifest, and viewport themeColor.

**OG images.** A 1200×630 image per page. Build them at build time with sharp if next/og doesn't run on vinext. Paintings and albums use their own image.

**JSON-LD** via lib/schema.mjs, with a unit test:
- WebSite (per host)
- Person for Allen and for Ann
- Service with areaServed for bookings (no street address)
- MusicGroup for Timeless
- MusicAlbum with MusicRecording
- Book for plays, stories and textbooks, with Offer, audience and AudioObject. No invented ISBNs.
- VisualArtwork plus Product with Offer, OfferShippingDetails and MerchantReturnPolicy
- CollectionPage with ItemList
- BreadcrumbList
- VideoObject only where the upload date is known [VERIFY]
- No self-serving Review or AggregateRating, no FAQPage, no Event
- Main and other reference each other with @id and sameAs.

**Performance**
- Static HTML with cache headers. Only /comments and /api are dynamic.
- Self-host Dynalight only, as woff2 with swap and a preload. The body uses the system Times New Roman stack, with no web-font request.
- Preload only the LCP image, with fetchpriority. Lazy-load the rest, always with width and height.
- `preload=none` on audio. Posters on videos.
- `public/_headers` currently has only `/audio/*`. Add:
  - `immutable` long-cache for /images/*, videos and fonts
  - for /books/*, `max-age=86400, must-revalidate`, because pages and manifests are regenerated in place (or fingerprint them)
- Budget: 150KB JS gzip per route.

### W7 Accessibility and legal
**Accessibility**
- A skip link to `<main id="main" tabIndex=-1>`, plus `<header>` and `<nav>` landmarks and one H1 per page.
- WebVTT captions on the self-hosted videos.
- A transcript or text link beside every audiobook.
- scroll-padding-bottom equal to the NowBar height.
- Meaningful link text ("see Ann's paintings", not "here").
- Measure the contrast of --red on paper, --soft, the footer text and the focus ring on ink, and fix anything under its threshold.

**Legal pages (main host only)**
- /privacy: APP-style, covering the D1 reviews, Stripe, Cloudflare and YouTube, the APP 8 disclosures and an under-15 note.
- /terms: it must contain the ACL sentence "Our goods come with guarantees that cannot be excluded under the Australian Consumer Law". It also covers:
  - the sellers: Ann Gillon for the paintings, Allen Gillon for the play PDFs
  - the digital PDFs, which are emailed after purchase, with a remedy if the file is corrupt or not delivered
  - the paintings
  - the refund policy exactly as set out in the DECISIONS: no change-of-mind refunds, and ACL remedies for damaged, destroyed, faulty or not-as-described goods, with photos requested within 7 days of delivery for damage claims
  - the play performance licence (a placeholder pending sign-off)
  - copyright
  - the contact address support@allengillon.com
- /accessibility.
- An updated /delivery on other, in the present tense.
- `rg -i "no refunds" app content` must return nothing.

**Footers.** Every footer carries:
- a contact block: Bribie Island QLD, sms (and tel if confirmed), support@allengillon.com (mailto), Facebook
- the legal links (absolute on other)
- "© {current year} Allen Gillon · Paintings © Ann Gillon"

**No cookie banner.**

**LEGAL-TODO.md** lists every unverified legal fact.

**Publishing.** The legal routes are gated by `content/legal.config.json` `{"published":false}`. While it is false, the routes 404 and the footer links are hidden. Flip it to true only after the human signs off (or approves a visible "draft pending sign-off" note).

## EXECUTION ORDER AND PARALLELISM
1. Create PLAN-PROGRESS.md with every DEFINITION OF DONE item and every gate. Update it after each item.
2. Run W1 and W2 in separate git worktrees. Each must pass its gate. Merge both, then start W3.
3. After W3 passes its gate and merges, run W4, W5 and W6 in parallel worktrees.
   - W5 uses one agent per page, touching disjoint route files.
   - site.css changes go only through per-route CSS files.
4. Run W7 last, then the full VERIFICATION.
5. One owner merges. Re-run all tests after each merge. Commit per workstream with clear messages. Never force-push.

## VERIFICATION
**Unit tests.** `npm test` passes: sites, speech, story-cues, schema, the PageReader DOM test, the books leak test, the artwork purchase-link test and storefront.

**Build.** `npm run build:vinext` passes. The other route appears in dist/server/wrangler.json, and no play PDF is under dist/client.

**Local Host-header checks** (`SITE_DEV_PORT=8787 npm run start:vinext`, then curl with Host headers):
- allengillon.com/books returns 301 to other.
- other/hire returns 301 to main.
- other `/` shows the other site's title.
- other /other-home returns 301 to `/`.
- www returns 301 to the apex.
- /plays returns 301 to #school-plays.
- POST /api/reviews is not a 3xx on either host.
- `Host: localhost` and `127.0.0.1` never return 3xx to production.
- robots.txt and sitemap.xml differ per host.
- The legal pages 404 on other (or on both while unpublished).

**Playwright** (both hosts, at 320/375/768/1024/1280/1440/1920/2560):
- `scrollWidth <= clientWidth` at every width.
- The full-width span check at 1440 and 1920.
- Screenshots at 375/768/1280/1920, reviewed against the anti-pattern list.
- The now-playing tests.
- The aria-current check on other.
- A keyboard-only pass over the gallery, the dialog, the reader and the player.
- A reduced-motion run, in which the gallery index is the default.
- 200% zoom.

**Audio**
- For each story with verified cues, compare the cue report with page turns: every turn is within ±0.5 s.
- Paused or unplayed audio turns nothing.
- A manual flip suspends following.
- Opening /read while the book is playing starts suspended.
- Listen never seeks an album track.

**Accessibility tools.** @axe-core/playwright reports 0 violations (wcag2a, wcag2aa, wcag21aa, wcag22aa). pa11y-ci reports 0 errors.

**Lighthouse (mobile).** Accessibility 100, SEO 100, Best Practices 95 or higher, Performance 90 or higher, LCP 2.5 s or less, CLS 0.1 or less.

**Structured data.** The Rich Results Test and the Schema validator report no errors.

**After deploy**
- `curl -s https://other.allengillon.com/ | grep "<title>"` differs from the apex title.
- Check `cf-cache-status` on both hosts to confirm no cache-key host collision.
- robots.txt and sitemap are correct per host.

## DEFINITION OF DONE
- [ ] **Now-playing bar.** It never shows a track that isn't playing, and previews don't auto-advance. The Playwright test passes.
- [ ] **Stories paragraph.** It matches Allen's text exactly, beside the Chinese Chimes H2, and a grep of the rendered HTML confirms it.
- [ ] **Chimes auto-turn.** Pages turn only while their own narration plays, within ±0.5 s per the cue report, and never when reading alone or on mount. Titles without verified cues ship with follow off.
- [ ] **Cue reports.** A per-page report exists for all 4 stories, and every cue is signed off or follow is off for that title.
- [ ] **One reader.** All 12 readables use one animated flip-book reader with the same controls and a "Show the words" toggle. Stories and textbooks have text routes. Plays offer Buy, not Download.
- [ ] **Play previews.** Plays show a preview of the first `previewPages` pages and a 60-second audio preview, priced at A$1. Buy shows "coming soon" until `playLinksCurrent` is true, and no $50 link is rendered anywhere.
- [ ] **Textbooks.** All 3 are readable online and downloadable from the PDFs in scripts/incoming/.
- [ ] **No paid-content leak.** Rebuilding the books with `--force` leaves none of these under public/ or dist/client: a play PDF, a play page image beyond `previewPages`, or a full play recording (a test asserts this).
- [ ] **Albums** are free to download, with no album Payment Link rendered anywhere.
- [ ] **Font and names.** The body text is Times New Roman, Lora is removed, and DESIGN.md is updated. The other site is branded "More on Allen" throughout.
- [ ] **Speech.** The page reader reads each block once, and prices are spoken as "50 Australian dollars".
- [ ] **other.allengillon.com** works as its own site: its home, nav, footer, title, description, canonical, OG image, icons, manifest, sitemap and robots. Old URLs return 301, cross-links work, and aria-current is correct.
- [ ] **Host routing.** resolveRequest never redirects loopback or *.localhost hosts, and POST /api/reviews is non-3xx on both hosts (a unit test covers this).
- [ ] **Unique metadata.** Every route on both hosts has a unique title, description and canonical. The legal pages are canonical on main only.
- [ ] **Declutter.** The W3 grep checks pass: no offset shadows (outside the allow-list), decorative rules, kickers, ⋯ menus, per-item comment chips or duplicate DOM. There is one primary action per object, and DESIGN.md is amended (including line 56).
- [ ] **Ann's art.** A hallway plus an index, a click-to-open dialog and route with exactly one Buy or Enquire, and arrow views on hover, focus, tap and swipe. The index has 0 "Buy this painting" and 0 "View 1".
- [ ] **Art direction** is live on all pages: instruments on Albums, a curtain on Timeless that never hides content, the sideboard home and drawn shelves. There is no scroll-jacking.
- [ ] **Full width.** At 1440 and 1920 the main bands span the viewport minus the gutter, and there is no horizontal scroll at any tested width.
- [ ] **SEO.** Every item in W6 is present and validated.
- [ ] **Accessibility.** The axe, pa11y and Lighthouse thresholds pass on every route of both hosts, including under reduced motion.
- [ ] **Legal.** The pages exist with the ACL guarantee sentence, the correct sellers (Ann for paintings, Allen for everything else), the decided refund policy and support@allengillon.com. There is no blanket "no refunds" wording. The review form links /privacy. The footer contact and LEGAL-TODO.md exist, and publishing is gated on sign-off.
- [ ] **Progress.** PLAN-PROGRESS.md shows every item ticked or explicitly blocked on the human.

## LEAVE A TODO FOR THE HUMAN (in PLAN-PROGRESS.md) AND KEEP GOING
These need the human's accounts or sign-off. Never block other work on them.
- Creating the A$1 play Payment Links and setting `playLinksCurrent: true`.
- Cloudflare Email Routing for support@, the `other` custom domain and DNS, the cache purge, the managed robots.txt setting, and retiring Vercel.
- Legal text sign-off and the play licence terms. The legal pages stay unpublished until then.
- R2, only if a textbook PDF is still too large or illegible after compression. This is the one case where you should STOP and ask.
- An ultra-wide cap, /shows indexing, tel: links, and the painting dimensions and medium.
- The ElevenLabs source script, if alignment confidence is below 0.6. The ear-check sign-off for each story's cues.
~~~