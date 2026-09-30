# Screenshot checklist

Three sets, all full page, downscaled to 960px wide, JPEG quality 60 (sharp):

- `before/`: phase 0 baseline, taken before the subdomain split (see the notes in the W3 section below).
- `after-w3/`: after the W3 design foundation, captured with `SITE_DEV_PORT=<port> node scripts/capture-screenshots.mjs docs/screenshots/after-w3`.
- `after/`: final state of `overhaul` after all workstreams (W1 to W7), the integration pass (ff325af) and fixer round 1 (e5e140c).
  Re-captured on 2026-10-01 by the playwright-matrix-visual verifier (round 2) against the built Worker (`npm run build:vinext`, then
  `SITE_DEV_PORT=<port> node scripts/start-local.mjs`) with **prefers-reduced-motion: reduce**, so every drawing is in its final state and
  Ann's art shows the salon-hang index (its reduced-motion default). The capture scrolls the whole page once and decodes every image before
  the shot. Re-captured again after fixer round 2 with the repo script itself, which now passes `reducedMotion: "reduce"` and lists
  every route below (`SITE_DEV_PORT=<port> node scripts/capture-screenshots.mjs docs/screenshots/after`). Round 2 visible changes: the
  More on Allen mast and footer logos and prose links are blue, Bookings is no longer bold red in the main nav, and on short pages the
  footer reaches the bottom of the window. It adds routes the earlier sets did not have: the 404 page on both hosts, /comments on the other
  host, a story's text route, a textbook reader and a painting route.

Each `after/` shot at 1280 and 375 was looked at against the anti-pattern list and the art-direction requirements in
Allen-Gillon-redesign-plan-and-prompt.md. A box is ticked when that review found nothing blocking; notes follow the list.

## Final (after/)

- [x] **allengillon.com/**
  - 375: before/home-375.jpg / after-w3/home-375.jpg / after/home-375.jpg
  - 768: before/home-768.jpg / after-w3/home-768.jpg / after/home-768.jpg
  - 1280: before/home-1280.jpg / after-w3/home-1280.jpg / after/home-1280.jpg
  - 1920: before/home-1920.jpg / after-w3/home-1920.jpg / after/home-1920.jpg
- [x] **allengillon.com/hire**
  - 375: before/hire-375.jpg / after-w3/hire-375.jpg / after/hire-375.jpg
  - 768: before/hire-768.jpg / after-w3/hire-768.jpg / after/hire-768.jpg
  - 1280: before/hire-1280.jpg / after-w3/hire-1280.jpg / after/hire-1280.jpg
  - 1920: before/hire-1920.jpg / after-w3/hire-1920.jpg / after/hire-1920.jpg
- [x] **allengillon.com/music**
  - 375: before/music-375.jpg / after-w3/music-375.jpg / after/music-375.jpg
  - 768: before/music-768.jpg / after-w3/music-768.jpg / after/music-768.jpg
  - 1280: before/music-1280.jpg / after-w3/music-1280.jpg / after/music-1280.jpg
  - 1920: before/music-1920.jpg / after-w3/music-1920.jpg / after/music-1920.jpg
- [x] **allengillon.com/reviews**
  - 375: before/reviews-375.jpg / after-w3/reviews-375.jpg / after/reviews-375.jpg
  - 768: before/reviews-768.jpg / after-w3/reviews-768.jpg / after/reviews-768.jpg
  - 1280: before/reviews-1280.jpg / after-w3/reviews-1280.jpg / after/reviews-1280.jpg
  - 1920: before/reviews-1920.jpg / after-w3/reviews-1920.jpg / after/reviews-1920.jpg
- [x] **allengillon.com/shows**
  - 375: before/shows-375.jpg / after-w3/shows-375.jpg / after/shows-375.jpg
  - 768: before/shows-768.jpg / after-w3/shows-768.jpg / after/shows-768.jpg
  - 1280: before/shows-1280.jpg / after-w3/shows-1280.jpg / after/shows-1280.jpg
  - 1920: before/shows-1920.jpg / after-w3/shows-1920.jpg / after/shows-1920.jpg
- [x] **allengillon.com/comments**
  - 375: before/comments-375.jpg / after-w3/comments-375.jpg / after/comments-375.jpg
  - 768: before/comments-768.jpg / after-w3/comments-768.jpg / after/comments-768.jpg
  - 1280: before/comments-1280.jpg / after-w3/comments-1280.jpg / after/comments-1280.jpg
  - 1920: before/comments-1920.jpg / after-w3/comments-1920.jpg / after/comments-1920.jpg
- [x] **allengillon.com/no-such-page (404)**
  - 375: after/not-found-375.jpg
  - 768: after/not-found-768.jpg
  - 1280: after/not-found-1280.jpg
  - 1920: after/not-found-1920.jpg
- [x] **other.allengillon.com/**
  - 375: before/other-home-375.jpg / after-w3/other-home-375.jpg / after/other-home-375.jpg
  - 768: before/other-home-768.jpg / after-w3/other-home-768.jpg / after/other-home-768.jpg
  - 1280: before/other-home-1280.jpg / after-w3/other-home-1280.jpg / after/other-home-1280.jpg
  - 1920: before/other-home-1920.jpg / after-w3/other-home-1920.jpg / after/other-home-1920.jpg
- [x] **other.allengillon.com/biography**
  - 375: before/biography-375.jpg / after-w3/biography-375.jpg / after/biography-375.jpg
  - 768: before/biography-768.jpg / after-w3/biography-768.jpg / after/biography-768.jpg
  - 1280: before/biography-1280.jpg / after-w3/biography-1280.jpg / after/biography-1280.jpg
  - 1920: before/biography-1920.jpg / after-w3/biography-1920.jpg / after/biography-1920.jpg
- [x] **other.allengillon.com/books**
  - 375: before/books-375.jpg / after-w3/books-375.jpg / after/books-375.jpg
  - 768: before/books-768.jpg / after-w3/books-768.jpg / after/books-768.jpg
  - 1280: before/books-1280.jpg / after-w3/books-1280.jpg / after/books-1280.jpg
  - 1920: before/books-1920.jpg / after-w3/books-1920.jpg / after/books-1920.jpg
- [x] **other.allengillon.com/read/little-ray**
  - 375: before/read_little-ray-375.jpg / after-w3/read_little-ray-375.jpg / after/read_little-ray-375.jpg
  - 768: before/read_little-ray-768.jpg / after-w3/read_little-ray-768.jpg / after/read_little-ray-768.jpg
  - 1280: before/read_little-ray-1280.jpg / after-w3/read_little-ray-1280.jpg / after/read_little-ray-1280.jpg
  - 1920: before/read_little-ray-1920.jpg / after-w3/read_little-ray-1920.jpg / after/read_little-ray-1920.jpg
- [x] **other.allengillon.com/read/little-ray/text**
  - 375: after/read_little-ray_text-375.jpg
  - 768: after/read_little-ray_text-768.jpg
  - 1280: after/read_little-ray_text-1280.jpg
  - 1920: after/read_little-ray_text-1920.jpg
- [x] **other.allengillon.com/read/melting-pot**
  - 375: before/read_melting-pot-375.jpg / after-w3/read_melting-pot-375.jpg / after/read_melting-pot-375.jpg
  - 768: before/read_melting-pot-768.jpg / after-w3/read_melting-pot-768.jpg / after/read_melting-pot-768.jpg
  - 1280: before/read_melting-pot-1280.jpg / after-w3/read_melting-pot-1280.jpg / after/read_melting-pot-1280.jpg
  - 1920: before/read_melting-pot-1920.jpg / after-w3/read_melting-pot-1920.jpg / after/read_melting-pot-1920.jpg
- [x] **other.allengillon.com/read/practice-in-communication-book-1**
  - 375: after/read_practice-in-communication-book-1-375.jpg
  - 768: after/read_practice-in-communication-book-1-768.jpg
  - 1280: after/read_practice-in-communication-book-1-1280.jpg
  - 1920: after/read_practice-in-communication-book-1-1920.jpg
- [x] **other.allengillon.com/anns-art**
  - 375: before/anns-art-375.jpg / after-w3/anns-art-375.jpg / after/anns-art-375.jpg
  - 768: before/anns-art-768.jpg / after-w3/anns-art-768.jpg / after/anns-art-768.jpg
  - 1280: before/anns-art-1280.jpg / after-w3/anns-art-1280.jpg / after/anns-art-1280.jpg
  - 1920: before/anns-art-1920.jpg / after-w3/anns-art-1920.jpg / after/anns-art-1920.jpg
- [x] **other.allengillon.com/anns-art/ann-426502619623139**
  - 375: after/anns-art_painting-375.jpg
  - 768: after/anns-art_painting-768.jpg
  - 1280: after/anns-art_painting-1280.jpg
  - 1920: after/anns-art_painting-1920.jpg
- [x] **other.allengillon.com/delivery**
  - 375: before/delivery-375.jpg / after-w3/delivery-375.jpg / after/delivery-375.jpg
  - 768: before/delivery-768.jpg / after-w3/delivery-768.jpg / after/delivery-768.jpg
  - 1280: before/delivery-1280.jpg / after-w3/delivery-1280.jpg / after/delivery-1280.jpg
  - 1920: before/delivery-1920.jpg / after-w3/delivery-1920.jpg / after/delivery-1920.jpg

- [x] **other.allengillon.com/comments**
  - 375: after/other-comments-375.jpg
  - 768: after/other-comments-768.jpg
  - 1280: after/other-comments-1280.jpg
  - 1920: after/other-comments-1920.jpg
- [x] **other.allengillon.com/no-such-page (404)**
  - 375: after/other-not-found-375.jpg
  - 768: after/other-not-found-768.jpg
  - 1280: after/other-not-found-1280.jpg
  - 1920: after/other-not-found-1920.jpg

### Review notes (after/)

Round 2 review (every 1280 and 375 shot opened and looked at):

- Art direction present: instruments on Albums (Gibson guitar in the head, flute beside the shelf, microphone on the Timeless ink band,
  piano-key strip at Original songs; at 375 one guitar headstock peeks from the header), the Timeless pelmet curtain in its own strip above
  the H1 (measured with motion allowed: curtain bottom 365px, H1 top 378px at 1280; 337px and 341px at 375), the sideboard home on the other
  site (three doorways on a drawn sideboard, one small shelf each at 375), drawn two-ink shelves under the books on /books and the albums on
  /music, and on /anns-art the salon-hang index (reduced motion) plus the hallway with picture rail, skirting, 64px arrows and "1 of 36"
  counter (checked separately with motion allowed; not in this set).
- Page titles on the other site are now blue on every route; main keeps red.
- No gradients (other than the allowed vinyl disc), no drop shadows (other than the allowed book-spine insets), no rounded cards, no
  kicker labels, no hamburger menu, no "View N" chips, one action per book, one Buy or Enquire per painting.
- No readable text below 16px on any route at 1280 (every visible text node checked).
- Timeless: two scrapbook prints are deliberately tucked over a corner of the neighbouring photo (`.snap--inset`).
- Main home hero is half width, recorded as an accepted change in DESIGN.md (the only photo is 600px wide).
- Design points raised in round 2 and fixed in fixer round 2: Bookings no longer has its own bold red style (only the current page is
  marked); the More on Allen logo, footer logo and prose links are blue; the footer reaches the bottom of short pages (404). Still open:
  the reviews form has no privacy link until the legal pages are published (gated by content/legal.config.json).

## W3 design foundation (after-w3/)

Before: `docs/screenshots/before/` (phase 0 baseline, taken before the subdomain split).
After: `docs/screenshots/after-w3/`, captured with `SITE_DEV_PORT=<port> node scripts/capture-screenshots.mjs docs/screenshots/after-w3`
(full page, downscaled to 960px wide, JPEG quality 60).

Review each pair against the anti-pattern list in Allen-Gillon-redesign-plan-and-prompt.md. The phase 0 baseline had no
/reviews shots (networkidle timed out), no /anns-art at 1280 or 1920, and no other-site home (new in W2). Those ten
before shots were captured afterwards from the W3 base commit b061d17 (overhaul with W1 and W2, before any W3 change),
exported with `git archive`, served by `vinext dev`, and shot the same way with `waitUntil: "load"`.

- [ ] **allengillon.com/**
  - 375: before/home-375.jpg / after-w3/home-375.jpg
  - 768: before/home-768.jpg / after-w3/home-768.jpg
  - 1280: before/home-1280.jpg / after-w3/home-1280.jpg
  - 1920: before/home-1920.jpg / after-w3/home-1920.jpg
- [ ] **allengillon.com/hire**
  - 375: before/hire-375.jpg / after-w3/hire-375.jpg
  - 768: before/hire-768.jpg / after-w3/hire-768.jpg
  - 1280: before/hire-1280.jpg / after-w3/hire-1280.jpg
  - 1920: before/hire-1920.jpg / after-w3/hire-1920.jpg
- [ ] **allengillon.com/music**
  - 375: before/music-375.jpg / after-w3/music-375.jpg
  - 768: before/music-768.jpg / after-w3/music-768.jpg
  - 1280: before/music-1280.jpg / after-w3/music-1280.jpg
  - 1920: before/music-1920.jpg / after-w3/music-1920.jpg
- [ ] **allengillon.com/reviews**
  - 375: before/reviews-375.jpg / after-w3/reviews-375.jpg
  - 768: before/reviews-768.jpg / after-w3/reviews-768.jpg
  - 1280: before/reviews-1280.jpg / after-w3/reviews-1280.jpg
  - 1920: before/reviews-1920.jpg / after-w3/reviews-1920.jpg
- [ ] **allengillon.com/shows**
  - 375: before/shows-375.jpg / after-w3/shows-375.jpg
  - 768: before/shows-768.jpg / after-w3/shows-768.jpg
  - 1280: before/shows-1280.jpg / after-w3/shows-1280.jpg
  - 1920: before/shows-1920.jpg / after-w3/shows-1920.jpg
- [ ] **allengillon.com/comments**
  - 375: before/comments-375.jpg / after-w3/comments-375.jpg
  - 768: before/comments-768.jpg / after-w3/comments-768.jpg
  - 1280: before/comments-1280.jpg / after-w3/comments-1280.jpg
  - 1920: before/comments-1920.jpg / after-w3/comments-1920.jpg
- [ ] **other.allengillon.com/**
  - 375: before/other-home-375.jpg / after-w3/other-home-375.jpg
  - 768: before/other-home-768.jpg / after-w3/other-home-768.jpg
  - 1280: before/other-home-1280.jpg / after-w3/other-home-1280.jpg
  - 1920: before/other-home-1920.jpg / after-w3/other-home-1920.jpg
- [ ] **other.allengillon.com/biography**
  - 375: before/biography-375.jpg / after-w3/biography-375.jpg
  - 768: before/biography-768.jpg / after-w3/biography-768.jpg
  - 1280: before/biography-1280.jpg / after-w3/biography-1280.jpg
  - 1920: before/biography-1920.jpg / after-w3/biography-1920.jpg
- [ ] **other.allengillon.com/books**
  - 375: before/books-375.jpg / after-w3/books-375.jpg
  - 768: before/books-768.jpg / after-w3/books-768.jpg
  - 1280: before/books-1280.jpg / after-w3/books-1280.jpg
  - 1920: before/books-1920.jpg / after-w3/books-1920.jpg
- [ ] **other.allengillon.com/read/little-ray**
  - 375: before/read_little-ray-375.jpg / after-w3/read_little-ray-375.jpg
  - 768: before/read_little-ray-768.jpg / after-w3/read_little-ray-768.jpg
  - 1280: before/read_little-ray-1280.jpg / after-w3/read_little-ray-1280.jpg
  - 1920: before/read_little-ray-1920.jpg / after-w3/read_little-ray-1920.jpg
- [ ] **other.allengillon.com/read/melting-pot**
  - 375: before/read_melting-pot-375.jpg / after-w3/read_melting-pot-375.jpg
  - 768: before/read_melting-pot-768.jpg / after-w3/read_melting-pot-768.jpg
  - 1280: before/read_melting-pot-1280.jpg / after-w3/read_melting-pot-1280.jpg
  - 1920: before/read_melting-pot-1920.jpg / after-w3/read_melting-pot-1920.jpg
- [ ] **other.allengillon.com/anns-art**
  - 375: before/anns-art-375.jpg / after-w3/anns-art-375.jpg
  - 768: before/anns-art-768.jpg / after-w3/anns-art-768.jpg
  - 1280: before/anns-art-1280.jpg / after-w3/anns-art-1280.jpg
  - 1920: before/anns-art-1920.jpg / after-w3/anns-art-1920.jpg
- [ ] **other.allengillon.com/delivery**
  - 375: before/delivery-375.jpg / after-w3/delivery-375.jpg
  - 768: before/delivery-768.jpg / after-w3/delivery-768.jpg
  - 1280: before/delivery-1280.jpg / after-w3/delivery-1280.jpg
  - 1920: before/delivery-1920.jpg / after-w3/delivery-1920.jpg
