# DESIGN.md — allengillon.com

## Status
The rules below are invariant: they apply to every design direction we try. Palette and
typefaces are chosen per direction and locked into the "Chosen direction" block once Allen
selects one. Until then that block stays empty on purpose.

## Color
- Work in OKLCH. No pure #000 or #fff. Tint every neutral slightly toward the direction's hue.
- Contrast floor is deliberately high for older readers: aim ≥ 7:1 for body text, never below
  4.5:1 for anything that must be read. No faint text on a pale ground.
- Choose a color strategy per direction and commit to it (restrained / committed / full-palette
  / drenched). Do not reflex every direction back to one pale accent.
- Measured contrast of the locked palette (OKLCH to sRGB, WCAG 2 ratio; run
  `node scripts/contrast.mjs`, checked 2026-10-01):
  - ink on paper 16.04:1, ink on paper-2 15.25:1 (body text: passes 7:1).
  - soft on paper 8.59:1, soft on paper-2 8.17:1 (secondary text: passes 7:1).
  - on (paper text) on ink 16.18:1; footer text on ink 9.31:1.
  - blue on paper 6.89:1, red-deep on paper 6.02:1: links and small accents only,
    never body copy.
  - red on paper 3.75:1 and on-text on red 3.78:1: large Dynalight titles only
    (3:1 large-text floor). Filled buttons therefore use red-deep (on-text 6.07:1)
    or blue (6.95:1), not red.
  - red on ink 4.28:1: the Dynalight name in the footer (large text, passes 3:1).
  - Focus rings (3:1 non-text floor): blue on paper 6.89:1, blue on paper-2
    6.55:1, paper on ink 16.04:1 (ink bands, footer, now-playing bar). The skip
    link is an ink block on paper, so its ring is blue, not paper.
  - `scripts/contrast.mjs` reads the tokens from app/site.css and exits 1 if any
    pair falls under its threshold; tests/contrast.test.mjs runs it in `npm test`.

## Typography
- Body ≥ 18px, ideally 19 to 20px. Line length 60 to 72ch. Line-height ~1.6.
- Real hierarchy: ≥ 1.3 ratio between scale steps, plus weight contrast. No flat scales.
- The display face must NOT be Fraunces, and the pairing must NOT be "characterful serif +
  neutral grotesk." Each direction names its own faces and says why they fit Allen's work.
- No uppercase letter-spaced kicker labels used as decoration.

## Layout
- Full width. The mast, the footer and every band run edge to edge; content sits
  inside `--gutter: clamp(16px,4vw,72px)` on each side. No ultra-wide cap unless
  the human asks for one.
- Every band is the named-line grid `.band` in app/site.css:
  `[full-start] gutter [wide-start] repeat(12,minmax(0,1fr)) [wide-end] gutter [full-end]`.
  Children default to `wide`; images and colour bands may take `full` (`.bleed`).
  The gutter tracks are shortened by the column gap, so `wide` is exactly the
  viewport minus two gutters. e2e/layout.spec.mjs checks this at 1440 and 1920.
- Text sits at `--measure: 56ch`, hung from the left of the wide area or stepped in
  a column or two (the lede under a title starts at grid line 3 from 1024px up),
  never in a centred column. The plan's first value, 66ch, set 68 to 75 characters
  per line in Times (its "0", which `ch` measures, is wider than its average
  letter), which breaks the 60 to 72 rule under Typography. 56ch (560px at 20px)
  measures on /biography at 60 to 71 characters per full line, median 64
  (10th to 90th percentile 60 to 68), and ledes at 1.1em keep the same count.
- Running copy (paragraphs, ledes, offer and play descriptions) is sized in em
  from the body: 1em for body copy, 1.1em for ledes, never a rem size that would
  render below the 20px body. 1rem to 1.05rem is only for metadata, captions,
  navigation and the footer.
- Two-column bands place their parts on the 12 columns (for example text on
  `wide-start / span 7`, a photo on `span 4 / wide-end`) or use fr and clamp()
  tracks. No fixed pixel columns.
- No overflow tricks: never `100vw` in padded contexts, `min-width:0` on grid
  children, no page-wide `overflow-x` clipping. A band may clip its own
  decoration (the albums band clips a record slid out of the last sleeve).
  e2e/layout.spec.mjs asserts no horizontal scroll from 320 to 2560px.
- Space separates content, not lines, boxes or cards. No decorative rules, no
  note boxes, no side stripes. Photos have no frame by default; frames only where
  they mean something (the gallery, record sleeves, books).
- Hierarchy on every page: L1 a visible Dynalight `h1.script` lockup at
  clamp(4rem,11vw,10rem), L2 section titles, L3 body. No visually hidden h1.
  One visible primary action per object, and one filled button per view:
  "Back to ..." links and secondary options (such as Facebook on /comments) are
  text links. Comments get one quiet link per section or page, never one per item.
- Page-specific CSS lives in a file next to the page (for example
  app/(main)/hire/hire.css imported by the page), never in `<style>` blocks.
- Vary how sections open. No repeated eyebrow / heading / aside module.
- Cards only where a card is the honest affordance (a purchasable book legitimately is a
  discrete object). No nested cards. No identical icon-heading-text grids.
- Generous, varied spacing for rhythm. Do not wrap everything in a container.
- Tap targets ≥ 44px. Everything important reachable without hover.

## Illustration
- Hand-authored inline SVG components in components/illustrations/.
- A single stroke of 2.5-3px with round caps, plus a misregistered second-ink copy
  offset about 3px at 30% opacity.
- Red-led on main and blue-led on other, set by `html[data-site]`.
- aria-hidden and pointer-events:none, and never under text.
- At most 40KB of decorative SVG per page.
- No AI rasters and no libraries: no GSAP, Framer, Lottie, Three or carousel
  libraries.

## Motion
- Use only transform, opacity and stroke-dashoffset, with ease-out curves
  (`--ease-out: cubic-bezier(0.22,1,0.36,1)` in site.css). Never generic `ease`,
  bounce or elastic. Never animate layout properties.
- Each effect plays once, through a single IntersectionObserver of about 1KB.
- Final states render by default, so content is visible without JS.
- Under reduced motion, everything is static.
- No scroll-jacking anywhere. Never convert the vertical wheel into horizontal
  scrolling.
- Hover changes colour only: no lift, no translate, no sliding arrows, no
  underline wipes.
- One exception, a state indicator rather than an entrance effect: on /music the
  record of an open album slides out and keeps turning on a linear infinite
  rotation (`discspin` in app/(main)/music/music.css), because a record turns at
  a constant speed. It stops when the album closes and never runs under reduced
  motion (the global reduced-motion rule sets `animation:none`). W5 narrows it so
  the disc spins only while that album's audio status is `playing`.

## Shared components (styled per direction)
- **Work item** (play, book, or album): title, one plain-language line, and the metadata the
  buyer needs. For a play: age band, cast size, run time. For a book: age or classroom use,
  length, format. For an album: length, free-to-stream. Price or "Free" is always visible.
- **Player:** inline audio, large controls, no account, works on tap.
- **Sample then acquire:** every play and book offers a read/listen sample and one clear
  acquire action. Children's storybooks note when a new recording is coming.
- **Cart:** one cart, paid items only, kept simple.

## Chosen direction (locked 2026-08-27)
- Base: Small Press (two-ink overprint on paper), carried over from the chosen mockup.
- Palette (OKLCH roles): paper 0.972/0.010/92, ink 0.22/0.02/300, red 0.615/0.195/33,
  blue 0.455/0.150/262, soft 0.40/0.03/300. Red = music and performance accents,
  blue = the written work.
- Color strategy: restrained two-ink. Red and blue only ever as accents on paper and ink.
- Display / body / utility type: **Dynalight** for titles (Allen's request, e.g. his name),
  **Times New Roman** for all body and utility text (Allen's request), as the system stack
  `"Times New Roman", Times, "Liberation Serif", serif` (never embedded; Lora is removed).
  Dynalight is self-hosted (public/fonts/dynalight-latin.woff2, OFL, font-display:swap,
  preloaded). It is a script, so it appears only at 2rem or larger and always with an
  overprint text-shadow in the other ink: a red title takes the blue overprint
  (`--overprint`), and a blue title takes the red misregistration (`--overprint-red`),
  because a blue shadow under blue ink would not show. Everything that must be read
  fast is Times.
  Body is 20px (19px at 820px and below), line-height 1.6. Line length: see Layout
  (`--measure: 56ch`, measured at 60 to 71 characters per full line on /biography).
- Elevation, texture, borders: flat, faint SVG noise on the paper. No rules between rows,
  no photo borders except gallery frames, sleeves and books. No shadows (except the book-
  spine inset, react-pageflip's page curl and the Dynalight overprint), no glass, no
  gradients (except the .disc record drawing).
- Signature element: the numbered index with Dynalight numerals in red, next to the hero.
- Motion: see the Motion section above (the W5 rules). Player state changes are instant.

## Implementation note (current build)
Static multi-page site: index, music, hire, books, plays, biography. Shared `site.css`,
`gallery.js` image swapper kept from the mockup phase, `player.js` for the free album
streaming (audio pulled from the old Wix site, see project context file).
