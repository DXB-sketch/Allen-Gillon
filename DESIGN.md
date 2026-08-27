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

## Typography
- Body ≥ 18px, ideally 19 to 20px. Line length 60 to 72ch. Line-height ~1.6.
- Real hierarchy: ≥ 1.3 ratio between scale steps, plus weight contrast. No flat scales.
- The display face must NOT be Fraunces, and the pairing must NOT be "characterful serif +
  neutral grotesk." Each direction names its own faces and says why they fit Allen's work.
- No uppercase letter-spaced kicker labels used as decoration.

## Layout
- Vary how sections open. No repeated eyebrow / heading / aside module.
- Cards only where a card is the honest affordance (a purchasable book legitimately is a
  discrete object). No nested cards. No identical icon-heading-text grids.
- Generous, varied spacing for rhythm. Do not wrap everything in a container.
- Tap targets ≥ 44px. Everything important reachable without hover.

## Motion
- Default to almost none. Motion has to mean something.
- Never animate layout properties. Ease-out (quart / quint / expo) curves only. No bounce,
  no elastic, no generic `ease`.
- Respect prefers-reduced-motion completely.

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
  **Times New Roman** for all body and utility text (Allen's request). Dynalight is a script,
  so it appears only at large sizes (>=2rem); everything that must be read fast is Times.
- Elevation, texture, borders: flat, 2px ink rules, 3px ink borders on photos, faint SVG
  noise on the paper. No shadows, no glass.
- Signature element: the numbered index with Dynalight numerals in red, next to the hero.
- Motion budget: none beyond the gallery-arrow opacity fade. Player state changes are instant.

## Implementation note (current build)
Static multi-page site: index, music, hire, books, plays, biography. Shared `site.css`,
`gallery.js` image swapper kept from the mockup phase, `player.js` for the free album
streaming (audio pulled from the old Wix site, see project context file).
