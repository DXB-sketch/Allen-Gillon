# Open questions raised by W5/W6 agents (raw, consolidated at the end)

##### fix:W5-hire
Open questions for the human
1. **tel: link.** Does Allen take phone calls? If yes, add `tel:+61438747882` next to the text link. There is still a TODO in the code where it would go.
2. **Photo.** The page now uses the Chandler theatre photo of Allen alone. It is a soft 670px video still with thin black edges, so it looks soft on high-resolution screens. Is there a sharper photo of Allen playing alone? The Gibson promo photo is on the home page, so using it here would repeat it. The earlier duo photo is still available, but it shows Ann next to copy that describes a solo guitarist.
3. **Smaller title on this page.** For the number to be the largest text, "Bookings" is capped at 85% of the number's size: about 48px at 375 wide and 115px at 1280, instead of 64 and 141. Is that acceptable?
4. **"Text" above the number.** The link reads "Text" on one line and the number below it. Would you prefer both on one line? That makes the number smaller.
5. **Lamp on phones.** The small spotlight in the heading row is 112 to 190px wide. Is that visible enough on a phone, or should it be left out below 1024px?
##### fix:W5-home
**Open questions for the human**
1. The spec asks for a full-bleed hero photo, but the only copy is 600×600 with a watermark. Is there a higher-resolution original without the watermark? With one, the hero can become a full-width band with the name on it. The only code change is `HERO` in `page.jsx`.
2. The home name is capped at 13rem, where DESIGN.md says 10rem for the main heading. Should DESIGN.md record the home page as an exception?
3. The Albums doorway used to say "Listen Free". Is "Albums" all right there?
4. The Allen and Ann photo was removed along with the collage. Should it appear somewhere else, such as the other site?
##### fix:W6-seo
**Open questions for the human**
1. Should `/shows` stay indexed (`SHOWS_INDEXED = true` for now)?
2. `/images` and `/icons` get a one-year immutable cache but the file names don't change when a file does. Is that acceptable, or should we use a shorter cache or versioned names?
3. W6 must not go live until the W4 text route, the W5 painting route and the textbook page images have merged, or the sitemap submits 46 dead links.
4. The play and painting descriptions need sign-off. Two points:
   - Breakout and Melting Pot no longer mention the school recording. The new "will soon be" wording is longer, and the recording line no longer fits within the 160-character limit. Should I trim other words to bring it back?
   - `/anns-art` now says "from A$125", which leaves out the A$100 painting because it is enquiry only. Is that right, or do you want the original "A$100 to A$250"?
5. Pages that are not wired yet show the root layout's generic description. That goes away once the orchestrator applies `docs/SEO-WIRING.md`, and the `/comments` change needs both lines, metadata and viewport.
##### fix:W5-stories
Open questions for the human
1. **Merge order:** merge W5-stories after W4. Until then the 4 "Text only" links return 404, "Read a preview" opens the whole play, and the textbooks' "Read online" opens the old restricted page.
2. **Story blurbs:** they are back in full, so "A Chinese Chimes story about…" appears four times. Keep that, or have Allen shorten them in the manifests?
3. **Plays lede:** it now reads "Each script comes as a PDF." without the price, which is shown on each play instead. Is that wording OK?
4. **Wide p001 pages:** Funny Fah's and Little Mee's first pages are 1080x607. They look right with the centred square crop, but W4 could supply a square `cover` in the manifest, which `coverFor()` already uses.
5. **Carried over from the implementer, still open:**
   - Heading text kept as "Chinese Chimes stories" while "Stories" shows large.
   - Prices shown as "A$1" rather than `formatAud`'s "$1 AUD".
   - `fullPageCount` versus `pageCount` depends on how W4 names the full page count.
   - The `.writing-head` and `.audiobook-list` class names are kept so `e2e/layout.spec.mjs` still passes.
   - The second-ink offset on the planks stretches sideways at wide widths. The doubled last-row planks stretch it further.
##### fix:W5-reviews-comments-sideboard
Open questions for the human
1. The comment on line 7 of `e2e/layout.spec.mjs` says /reviews never reaches networkidle. That has not been reproduced on either the old or the new code, and it may be out of date. Its owner should check or remove it; I did not edit that file.
2. The painting copies in `public/images/sideboard/` are temporary. Should they be replaced by the Ann's art 480/960 versions when that workstream lands?
3. Still waiting from the first round:
   - The privacy link wording, and allengillon.com/privacy not existing yet.
   - Allen's approval of the sideboard labels and the added "1968" note.
   - Whether the open book should show Little Ray or the group picture `chinese-chimes-together.webp`.
   - Whoever captures the docs screenshots should use reduced motion, or full-page captures can catch the drawings half finished.
4. `node_modules/.vite` is shared by every worktree through the junction, and the scratchpad `shots` folder also holds other agents' files. The dev log showed a cache error pointing at another worktree. This did not affect my results, but it could cause odd dev-server behaviour when several agents run at once.
##### fix:W5-music
**Open questions for the human**
1. Is "Albums" right as the H1? The browser-tab title is still "Al's music style", left for the SEO workstream (W6).
2. The Gibson is on screen when the page loads, so under the Motion rules it appears in place and only slides in when the page opens already scrolled down. Is that acceptable, or should the top-of-page art get an on-load entrance, recorded as an exception in DESIGN.md?
3. Both Timeless labels may be wrong:
   - "Ann and Allen performing Unforgettable": the whole clip is a Sunset Pier Cafe promo of Allen alone.
   - "Ann and Allen performing This Masquerade": it is mostly title cards, with Ann on screen only from about 10 to 23 seconds.

   Should the labels change, or can Allen supply better clips or stills?
4. All five original-song videos are lyric videos with small 640×480 thumbnails, so their posters look slightly soft in the large slot at 1920px. Can Allen supply better images?
5. Should /music get its album JSON-LD now, using the data in `albums.mjs`, or leave it to W6?
6. Is one album open at a time acceptable?
##### fix:W5-art
for the human**
1. Can we get higher-resolution photos of Ann's paintings? The Facebook copies are at most 1400px wide, so the 1600 size can't be made without enlarging.
2. The catalogue lists two photos twice (Blue Macaws `156590929103043`, and `130267801735356`). They are hidden in code; should they be removed from `content/artworks.mjs` too?
3. On phones the painting's name and price now come before the picture. Is that order OK?
4. On a painting page at 375, Buy still starts just below the fold because of the site header, though the price is visible. Is that acceptable?
5. The implementer's open questions still stand: wall-label wording for the seven works not for sale, the smaller painting-page title versus the heading-size rule in `DESIGN.md`, cropping the table and fence out of Ann's photos, and letting the W6 SEO agent know `/anns-art` already sets its own titles, OG images and structured data.
##### fix:W5-timeless
**Open questions for the human**
1. **The lyric.** Can Allen or Ann confirm the lyric ("You're so lovely when you smile, you're so…") and give the song title? The rest of the third line is unclear.
2. **The curtain now shows parted at load.** Following the motion system's own rule, it only slides apart when someone scrolls back up to it. Is that acceptable, or should it always part once on load, even though that brings back a brief jump?
3. **Allen's earlier questions 1–3, 6 and 8 are still open:**
   - Moving the two recent photos into the Today scene.
   - Confirming the years 1968 and 1970s.
   - The Page One Revue location.
   - How wide photos should get on very wide screens.
   - The "Philippino" spelling printed on the MA 5 card.
4. **Videos on /music are still out of this task's scope.** `timeless-masquerade.mp4` and `timeless-unforgettable.mp4` belong to the albums agent and still have no poster or captions.
5. **The shared scratchpad folder.** Parallel agents write to the same scratchpad folder, and another agent's `dev.log` overwrote mine there. Future agents should use a subfolder of their own.

Files changed:
- `app/(other)/biography/page.jsx`
- `app/(other)/biography/biography.css`
- `e2e/timeless.spec.mjs`
- `public/videos/allen-steakout.en.vtt`

##### base:illustrations
## Questions for the human
1. **Offset grows with size.** The misregistration offset is measured in drawing units, so it scales with the drawing: a headstock shown at 400px wide has about a 7px offset. Should big hero drawings pass a smaller `offset`, or should the offset stay about 3px on screen at any size?
2. **No draw-on in the first screen.** A drawing already on screen at load stays still and never draws itself. This avoids content vanishing and reappearing as the page loads. The cost is that hero drawings in the first screen never animate. Is that acceptable?
3. **Stroke lengths are measured in JS.** `draw` needs the browser to measure each stroke when it comes into view. The simpler CSS-only method left gaps in the finished lines because the stroke width doesn't scale with the drawing. It is about 10 lines of JS on top of the observer. Fine to keep?
##### fix:W4-reader
**Questions for you**
1. **Title size vs. the fold.** DESIGN.md sets every page title at clamp(4rem,11vw,10rem). At 1280×800, pages with two-line titles show only about 180px of the book. Would you allow a smaller title on reader pages, or put the lede beside the title?
2. **Funny Fah's printed page numbers are inconsistent.** Printed 16 is skipped, and the page after two unnumbered pages is printed 23. With numbering from 4, 24 of 33 pages match; pages printed 17 to 22 show one lower in the reader.
3. **Preview length** (implementer's question 1) is still open: a 6-page preview shows only 1–2 pages of actual script.
4. **Textbook worksheets** still contain some leftover noise from rotated labels and word-search grids. The contents pages, covers and prose read cleanly.
5. **Deliberate choices in the story text:** Allen's own typos are kept (for example "Mater Chi Lu", "bighting", "ticked"), and signs drawn in the pictures (TV STUDIO, MEXICAN VILLA) are left out. Please check both.
6. **Dev server port.** The server must be started with `SITE_DEV_PORT` set, or links to the other site point at `localhost:3001` and `sites.spec` fails. Worth noting for other agents.
7. Implementer questions 5–8 still stand (`/books` audio field, the comments return-address whitelist for `/read/<slug>/text`, esbuild as a devDependency, the shared vite cache).##### integrator:2026-10-01
**Questions for you**
1. **Legacy root files kept.** `index.html`, `books.html`, `hire.html`, `music.html`, `biography.html`, `plays.html`, `player.js`, `gallery.js`, `gallery.css` and the root `site.css` are the old static site. Nothing in the build uses them (the app imports `app/site.css`, and `dist/client` holds no HTML). They were left in place because `hire.html` and `music.html` were still being edited with the app pages on 2026-09-23 ("Replace 1967 duration wording"), and `vite.config.ts`, `wrangler.jsonc` and CLOUDFLARE.md work around them rather than removing them. May they be deleted? If they go, the dev-only `html_handling: "none"` workaround in `vite.config.ts` can go too.
2. **JS budget.** Some routes are still over 150 KB gzip (/music, /reviews, /anns-art, the painting pages and every /read page). The vinext and React floor is 138.3 KB and the site chrome brings every page to 149.3 KB. See docs/PERFORMANCE.md for the options. Accept the overage, raise the budget, or pick an option?
3. **Link prefetch is off everywhere.** This keeps other routes' chunks out of each page's first load. Navigation still happens on the client (the now-playing bar keeps playing), and the RSC request now starts on click. Fine?
