GOAL
Restructure all five existing homepage mockups to match Allen's own hand-drawn
layout, keeping each design's visual identity intact, and add a live image-swapper
so I can change which photo shows in any image slot — in front of Allen, in the
browser, without editing code. This is review material for a meeting today, so it
must run by just opening the files. Do not start a build or change the stack.

CONTEXT
The five files are self-contained HTML homepage mockups, each a distinct design:
  allengillon-smallpress.html  — bold two-ink overprint, warmest
  allengillon-desk.html        — his work laid out on a writing desk
  allengillon-programme.html   — theatre programme, running order
  allengillon-script.html      — stage-script typography
  allengillon-catalogue.html   — systematic library index
There is also a switcher (the file with an <iframe> that loads all five). Keep the
five filenames EXACTLY as they are so the switcher keeps working.

First, do two things before changing anything:
  1. List the files in this folder and confirm all five mockups + the switcher exist.
  2. List the contents of ./images/personal and ./images/albums and print the actual
     filenames you find. Build the image pools from those real files — do not invent
     filenames. If either folder is empty or missing, tell me and use labelled
     placeholders.

THE NEW LAYOUT (from Allen's drawing — apply to every mockup, in that mockup's own
style, palette, and type; do NOT flatten them into one look):
  1. A large hero PHOTO of Allen ("Pic of Allen" in the sketch), prominent, with the
     site title near it. Do NOT put the URL/domain anywhere on the page.
  2. A heading "The Life of Allen" with the instruction "Click on your interest".
  3. A NUMBERED index (1–10), each row a clickable link with a small image slot beside
     it. Exact wording from Allen's sketch:
       1. Restaurant Guitarist — plays jazz
       2. Three Popular Albums — Click & Listen (free to stream)
       3. Professional Duet "Timeless" — with Ann
       4. Original Songs by Allen Gillon
       5. Bandleader — The New Breed & Page One Revue (Elvis Across America)
       6. Author — Children's Books
       7. Playwright — 5 Plays written & performed
       8. School Text Books
       9. Family Man — "You may like to read"
       10. [PLACEHOLDER — Allen's #10 is illegible; render a clearly-labelled empty row]
  Interpret each design idiomatically: Programme = these are the "running order";
  Script = numbered script lines; Catalogue = index rows; Desk = index cards;
  Small Press = a bold printed contents list. Keep each mockup's existing lower
  sections (music player, sample/buy, contact) beneath the index — don't delete work.
  Do NOT add any closing tagline or sign-off line.

THE IMAGE SWAPPER (the "website builder" part — build ONCE, include in all five):
  - Create a shared gallery.js and a small shared CSS block, included by all five files.
  - Every image on the page is a swap slot. Default: shows one image.
  - On hover AND on tap/focus (I may present on a tablet), reveal a left ‹ and right ›
    arrow over the image plus a small counter like "3 / 6" and the image's short label.
  - Arrows cycle the slot through its POOL (see below), so I can change any photo live.
  - Arrows are real, keyboard-focusable buttons, minimum 44px, high contrast.
  - State is in-memory for the session (no localStorage). If a file is missing, show a
    labelled grey placeholder box, never a broken image.

IMAGE POOLS (build from the real filenames you listed above):
  - PERSONAL pool = every file in ./images/personal (photos of Allen, and the one of Ann).
  - ALBUMS pool  = every file in ./images/albums (album covers).
  - HERO slot: pool = PERSONAL, default = whichever file reads as the best solo shot of
    Allen (pick one and tell me which; I can change it live anyway). This is the key slot —
    make sure hovering the hero lets me cycle through ALL of him.
  - Row image slots for music/duet/albums (rows 2, 3, 4): pool = ALBUMS by default, except
    any row clearly about Ann or the duo should default to a personal photo if a fitting one
    exists. Use judgement, and tell me the defaults you chose.
  - Any other row image slots: pool = PERSONAL.
  (If I later want every slot to cycle both pools combined, that should be a one-line change —
  structure it so pools are easy to swap.)

CONSTRAINTS
  - Keep each mockup's palette, fonts, and character. No new "look".
  - Accessibility (Allen is 81, audience skews older): body type ≥18px, high contrast,
    large tap targets, nothing important on hover-only (arrows must also work on tap).
  - No AI-slop tells: avoid gratuitous cards/borders, avoid em-dash overuse, no emoji.
  - Self-contained; must work by opening the file. No build step, no new dependencies.
  - Don't rename the five files. Update the switcher only if needed to keep it working.

ACCEPTANCE CRITERIA
  [ ] All five mockups open and show the numbered "Life of Allen" index in their own style.
  [ ] Hovering/tapping the HERO photo shows arrows that cycle through every personal photo of Allen.
  [ ] Album/row slots cycle their pool the same way.
  [ ] #10 renders as a clearly-labelled placeholder. No tagline. No URL on the page.
  [ ] The switcher still loads all five.
  [ ] Nothing is a broken image; missing files show labelled placeholders.

When done, print the local preview command (or the Vercel deploy command for the
allengillon-mockups project) on its own line so I can open it. If you're short on time,
do Catalogue, Programme and Small Press first and tell me, then finish the other two.