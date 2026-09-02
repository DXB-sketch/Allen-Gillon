Read Allen-Gillon-project-context.md, PRODUCT.md and DESIGN.md before doing anything else.

This is a CONTENT and STRUCTURE update to an existing, working Next.js (App Router)
site. The site already builds and deploys. Do not restyle, rebuild, or "improve" any
page that is not listed below. In particular, do not touch the music player
(components/Player.jsx, components/Album.jsx), the album data, or the biography prose
that is already written. Reuse the existing CSS tokens and classes in app/site.css
(.wrap, .pagehead, .plain, .script, .ruled, .note, .videos/.video/.frame, .prose,
.gx-hero, .btn). Do NOT introduce new colour values, new fonts, Tailwind, or any
component library. Follow DESIGN.md: no em dashes in any visible copy (use commas,
colons, periods or parentheses), body stays large and high-contrast, tap targets stay
>= 44px, red is the music/performance accent and blue is the written-work accent.

Make each change in the order listed. After all changes, confirm what you changed for
each numbered item and run npm run build.

---

CONTEXT: WHAT PROMPTED THIS

Allen (the client, 81) sent a marked-up PDF and two emails with content, links and
corrections. Most of the music side of his brief is already live, so this update is
mainly the two placeholder pages (Plays, Books) plus small additions elsewhere, and
one asset to add. His real, supplied content is used verbatim where given.

---

CHANGE 1 - Plays page: real titles and the free-script model
File: app/plays/page.jsx

Observed: the page shows five unnamed placeholders ("Play one" ... "Play five") and
the surrounding copy implies the plays are purchased or licensed.

Root cause / decision: Allen has now named all five plays and stated they are to be
given away "free of charge and copyright," downloaded by contacting him. This overrides
the earlier paid/licensing framing for plays. Rewrite the page around free scripts by
request. Do not add a cart or a price.

Do this:
- Replace the five placeholder <li> items with Allen's real titles, keeping the same
  ruled numbered list markup (.ruled .plays, .pno). The five plays, in this order:
    1. Melting Pot
    2. The Other Man's Grass
    3. Tribute to Calamity Jane
    4. Three Heroes of Sherwood
    5. Breakout
- Under each title keep one plain line. Allen has not yet supplied per-play age band,
  cast size or run time, so use this line on every play for now:
  "Written for a primary-school end-of-year production, and performed on school stages.
   Age band, cast size and running time to be listed here."
- Update the page intro paragraph (.plain) to state the plays were written in the 1980s
  for primary-school end-of-year productions, all have been performed on school stages,
  and the scripts are offered free of charge and free of copyright.
- Replace the existing .note block with a free-by-request note. Use this copy:
  "Teachers: Allen gives these scripts away free, in electronic form, to any school that
   would like to perform them. Age band, cast size, running time and classroom notes
   will be added here as Allen supplies them. To request a script now, get in touch."
  Keep the existing Link to /hire on the words "get in touch".

Guardrail: do not build a download button that points at a file yet (no script files
exist in the repo). "Get in touch" is the acquire action for V1.

---

CHANGE 2 - Plays page: real classroom textbook titles
File: app/plays/page.jsx (the "Classroom Textbooks" section at the foot of the page)

Observed: the Classroom Textbooks section is a single placeholder paragraph.

Do this: replace the placeholder paragraph with Allen's real published texts, presented
as published works (these were issued by third-party publishers, so do not add prices or
buy buttons). Use a simple ruled list (.ruled) or plain paragraphs, consistent with the
page. Content:
- "Riddled with Language" (a comprehension book, published by Modern Teaching Aids).
- "Practice in Communication," Book 1 and Book 2 (classroom discussion, published by
  Primary Education Publications Pty Ltd).
Intro line for the section: "Alongside the plays, Allen wrote classroom texts used by
teachers and pupils across twenty-five years of teaching. These titles were published by
educational publishers."

Guardrail: keep it factual and short. Where-to-buy links for these are not yet supplied;
do not invent them.

---

CHANGE 3 - Books page: real children's storybooks with YouTube read-alongs
File: app/books/page.jsx

Observed: the Books page shows three unnamed placeholder "storybook" rows.

Root cause / content: Allen's children's stories are the "Chinese Chimes" series of
short stories with a moral, released as ebooks and narrated on YouTube. The existing
YouTube narrations use early robotic text-to-speech and are due to be re-recorded.

Do this:
- Rewrite the intro (.plain) to introduce the "Chinese Chimes" stories: short stories
  for young readers, each with a gentle moral, written by Allen the teacher. Add one
  honest line that the current YouTube recordings use an older computer voice and that
  fresh recordings are on the way.
- Replace the three placeholder rows with a video grid of the four stories, reusing the
  existing global classes .videos / .video / .frame exactly as the music page does for
  its Originals section (privacy-friendly embeds via https://www.youtube-nocookie.com/embed/VIDEO_ID,
  loading="lazy", allow="encrypted-media; picture-in-picture", allowFullScreen, a
  <figcaption> with the story title). The four stories and their CORRECT video IDs:
    - "Funny Fah Learns When to Stop"  ->  OAu1PmILqeA
    - "Imaginative Little Mee"         ->  ZwzVEIQp3Cw
    - "Hi Doh"                         ->  Ynu-5Rt7Vyw
    - "Little Ray"                     ->  cEuPWVPPN0o
  IMPORTANT: use cEuPWVPPN0o for "Little Ray". Allen's PDF listed the wrong link for it
  (it duplicated the "Hi Doh" link Ynu-5Rt7Vyw); his follow-up email gave the correct
  one: https://www.youtube.com/watch?v=cEuPWVPPN0o.

Guardrail: the .videos/.video/.frame CSS already lives in app/site.css and is global, so
no new CSS is needed. Match the music page's iframe markup pattern.

---

CHANGE 4 - Biography page: add Allen's current portrait and his musical training
File: app/biography/page.jsx

Observed: the biography is complete and well written, but there is no recent close-up
portrait of Allen, and his formal musical training is not mentioned.

Do this:
- Add a new photo of Allen as the FIRST figure in the <aside> photo column, above the
  existing three. Also add a matching inline <figure className="inline"> near the top of
  the prose (the page already uses this pattern to show each aside photo inline on
  phones). Image path and caption:
    src="/images/personal/current-portrait-allen-2026.jpg"
    alt="Allen Gillon at Bribie Island"
    caption: "Allen today, Bribie Island."
  (The file is supplied separately, see WORKING NOTES. Add the <img> references now; the
  file will be placed at that path.)
- Add one short paragraph about his training, in the early era of the story (inside or
  just after "The New Breed" section is fine). Copy:
  "Allen trained at the Sydney Conservatorium of Music in the 1970s, passing orchestral
   musical arrangement, and became a member of the Musical Arrangers Guild of Australia.
   In the club and hotel bands of the day, every musician on stage needed a written
   chart, and Allen wrote them."

Guardrail: do not rewrite the existing biography paragraphs. Only add the portrait
references and the one training paragraph.

---

CHANGE 5 - Hire page: add diners' comments and the memorised repertoire
File: app/hire/page.jsx

Observed: the Hire page has no social proof, and does not mention Allen's repertoire size.

Do this:
- Add a short line to the intro or the "Restaurant guitarist" offer item stating that
  Allen plays from more than three hundred melodies he keeps by memory, and wrote many
  of the backing tracks himself. Suggested line:
  "Allen plays from more than three hundred melodies held in memory, on a solo Gibson,
   at dinner volume, and wrote many of the backing tracks himself."
- Add a small set-off block of real diner comments Allen supplied. Present them as plain
  quoted lines, not as pill cards or an icon grid (see DESIGN.md anti-references). The
  four comments, verbatim:
    "Beautiful."   "Unforgettable."   "I love Al's light jazz."   "Pour me another glass."
  A .note block, or a simple styled <blockquote> row using existing tokens, is fine.

Guardrail: no new card component, no star icons, no testimonial carousel. Keep it quiet.

---

CHANGE 6 (OPTIONAL, low priority) - Music page: note Allen's own backing tracks
File: app/music/page.jsx

If time allows, add one sentence near the albums intro or the "That's The Time" context
noting that many backing tracks are Allen's own arrangements, for example the Desafinado
backing on "That's The Time." Skip if it does not sit cleanly. Do not restructure the
albums or the Originals section, both of which are already correct and complete.

---

ACCEPTANCE CRITERIA

[ ] Plays page shows the five real titles in order: Melting Pot; The Other Man's Grass;
    Tribute to Calamity Jane; Three Heroes of Sherwood; Breakout.
[ ] Plays page presents scripts as free of charge and free of copyright, by request, with
    no cart or price, and no dead download link.
[ ] Classroom Textbooks section lists "Riddled with Language" and "Practice in
    Communication" Book 1 and Book 2, with publishers, and no prices.
[ ] Books page shows four "Chinese Chimes" story videos with correct IDs, and "Little Ray"
    uses cEuPWVPPN0o (not the duplicated Ynu-5Rt7Vyw).
[ ] Books page notes the old computer-voice narration and that new recordings are coming.
[ ] Biography page shows current-portrait-allen-2026.jpg as the first aside photo and
    inline on phones, and includes the Conservatorium / MAGA paragraph.
[ ] Hire page shows the four diner comments (quiet, no cards) and the 300-melodies line.
[ ] No em dashes in any visible copy.
[ ] No new colour values, fonts, Tailwind, or component libraries introduced.
[ ] npm run build completes without errors.

---

WORKING NOTES

Asset to add (do this as part of the change, or confirm Dexter has):
- A new photo file must be placed at public/images/personal/current-portrait-allen-2026.jpg
  before Change 4 will render. Dexter is supplying this file. If it is not present in the
  repo when you run, still add the <img> references (Change 4) so they light up once the
  file lands, and note it in your summary.

Do NOT touch:
- components/Player.jsx, components/Album.jsx (working audio player).
- The albums array and Originals embeds in app/music/page.jsx (already correct: all five
  albums stream free, all five original songs are embedded).
- The existing biography prose (only ADD the portrait and the training paragraph).
- app/site.css, except that you may add small, scoped, token-based rules if a new block
  genuinely needs them. Prefer reusing existing classes over writing new CSS.

Surname is confirmed: Gillon (Allen's own PDF and the domain use Gillon). No change needed.

Two items are intentionally NOT in this prompt because they are decisions or external
tasks for Dexter, not code:
- Whether albums should be downloadable (Allen's wording says "download"; the site
  currently streams). Left as a product decision.
- Re-establishing the old Wix domains (opennow4u.com, allennann.com) as redirects, and
  any audio remastering. External / non-repo tasks.

When the changes are complete, write ALLEN_UPDATE_COMPLETE.md at the project root
covering: what was changed per numbered item, any copy you adjusted, whether the portrait
file was present at build time, and anything the next round should pick up (for example,
per-play teacher metadata once Allen supplies it).
