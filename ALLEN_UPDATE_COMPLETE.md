# Allen Site Update — Complete (2026-09-02)

All six changes from UPDATED-SITE.md are done. `npm run build` completes with no errors
(9 static pages generated). No changes were made to the player, album data, existing
biography prose, or app/site.css.

## Change 1 — Plays page: real titles and the free-script model
`app/plays/page.jsx`
- The five placeholders are replaced with the real titles, in order: Melting Pot,
  The Other Man's Grass, Tribute to Calamity Jane, Three Heroes of Sherwood, Breakout.
  Same `.ruled .plays` / `.pno` markup.
- Every play carries the interim line: "Written for a primary-school end-of-year
  production, and performed on school stages. Age band, cast size and running time to
  be listed here."
- Intro rewritten: plays written in the 1980s for primary-school end-of-year
  productions, all performed on school stages, scripts offered free of charge and free
  of copyright.
- The `.note` block now uses the free-by-request copy verbatim, with the existing
  Link to /hire on "get in touch". No cart, no price, no download button.

## Change 2 — Plays page: classroom textbook titles
`app/plays/page.jsx` (Classroom Textbooks section)
- Placeholder paragraph replaced with the supplied intro line and a `.ruled` list:
  "Riddled with Language" (comprehension, Modern Teaching Aids) and "Practice in
  Communication, Book 1 and Book 2" (classroom discussion, Primary Education
  Publications Pty Ltd). No prices, no buy links. Two small scoped rules were added to
  the page's existing inline `<style>` block for the list's padding and type size
  (reusing tokens; site.css untouched).

## Change 3 — Books page: Chinese Chimes videos
`app/books/page.jsx`
- Page rewritten around the Chinese Chimes stories. Intro introduces them as short
  stories for young readers, each with a gentle moral, written by Allen the teacher,
  and honestly notes the current recordings use an older computer voice with fresh
  recordings on the way. Page metadata description updated to match.
- The three placeholder shelf rows (and their page-local CSS) are replaced with a
  `.videos / .video / .frame` grid matching the music page's iframe pattern
  (youtube-nocookie embeds, loading="lazy", encrypted-media, allowFullScreen,
  figcaptions). IDs: Funny Fah Learns When to Stop (OAu1PmILqeA), Imaginative Little
  Mee (ZwzVEIQp3Cw), Hi Doh (Ynu-5Rt7Vyw), Little Ray (cEuPWVPPN0o — the corrected ID
  from Allen's follow-up email, not the duplicated Hi Doh link).

## Change 4 — Biography: portrait and musical training
`app/biography/page.jsx`
- New portrait added as the FIRST figure in the aside column, plus a matching
  `<figure className="inline">` at the top of the prose (under "The New Breed") so it
  shows inline on phones. src `/images/personal/current-portrait-allen-2026.jpg`,
  alt "Allen Gillon at Bribie Island", caption "Allen today, Bribie Island."
- Training paragraph added verbatim at the end of "The New Breed" section
  (Conservatorium in the 1970s, orchestral arrangement, Musical Arrangers Guild of
  Australia, wrote the charts).
- **Portrait file status: PRESENT at build time.** Dexter's file arrived at repo root
  `images/personal/`; it was moved to `public/images/personal/current-portrait-allen-2026.jpg`
  so Next.js serves it. The now-empty root `images/` folder was removed.
- No existing biography paragraphs were changed.

## Change 5 — Hire page: repertoire line and diner comments
`app/hire/page.jsx`
- The "Restaurant guitarist" offer item now includes the supplied line: "Allen plays
  from more than three hundred melodies held in memory, on a solo Gibson, at dinner
  volume, and wrote many of the backing tracks himself." (The item's original "at
  dinner volume" phrase was dropped to avoid saying it twice.)
- Diner comments added as one quiet `.note` block between the offers and the booking
  block, all four verbatim: "Beautiful." "Unforgettable." "I love Al's light jazz."
  "Pour me another glass." Framed with "Heard between courses:". No cards, icons or
  carousel.

## Change 6 (optional) — Music page backing-track note
`app/music/page.jsx`
- One sentence added to the albums intro: "Many of the backing tracks are Allen's own
  arrangements, like the Desafinado backing on That's The Time." Nothing else on the
  page was touched.

## Copy adjustments beyond the brief
- Hire: removed the duplicate "at dinner volume" (see Change 5).
- Books/Plays: page metadata descriptions updated to reflect the new content.
- Diner comments: prefixed with "Heard between courses:" so the bare quotes have
  context; the quotes themselves are verbatim.

## For the next round
- Per-play age band, cast size, running time and classroom notes, once Allen supplies
  them (each play currently carries the interim line).
- Script files for the plays: when Allen supplies PDFs/DOCs, a real download or
  email-request flow can replace "get in touch".
- Where-to-buy information (if any) for the classroom textbooks.
- Re-recorded Chinese Chimes narrations: swap the video IDs and remove the
  computer-voice note when they land.
- Product decisions left with Dexter (not code): downloadable albums vs streaming;
  old Wix domains (opennow4u.com, allennann.com) as redirects; audio remastering.
