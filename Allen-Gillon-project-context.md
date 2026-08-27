# Allen Gillon Project — Context & Handoff

**Purpose:** Full context for the Allen Gillon build, structured so it can be dropped into a fresh chat and picked up seamlessly. Everything decided so far, what's still open, and the next actions. **This is a scaffold** — Allen-specific detail is added as it comes in from the chat. Anything marked `TBC`, `[ … ]`, or ⚠️ still needs filling.

---

## 1. Snapshot

- **Project:** A single **portfolio + online store** website for Allen, consolidating his three bodies of work (music, school plays, books) into one easy-to-maintain site. Replaces an outdated, no-longer-used Wix site (`allen0295.wixsite.com/mysite`). Domain `allengillon.com` already purchased.
- **Client:** **Allen Gillon**, 81. Approached Dexter to build a new site because his old Wix site is outdated and unused. `[exact referral path / relationship — TBC; Bribie Island local connection]`
- **Developer:** Dexter, solo developer building with Claude Code (React/JSX, Tailwind, Vercel deploys).
- **Approach:** **Custom build in Next.js** (App Router), deployed on Vercel — confirmed as the right fit for a small portfolio + light store, and chosen over a plain Vite/React SPA for its **server rendering / static generation** so the teacher-facing catalogue indexes well (see §9). One site, not three separate ones (decided: easier for Allen to maintain).
- **Status:** Requirements-gathering / **design selection**. Five homepage mockups produced; awaiting Allen's pick before V1 build.
- **Deliverables so far:** Five homepage design mockups (Small Press, The Desk, Programme, Script, Catalogue) plus a single switcher page to review them all from one link; supporting `PRODUCT.md` / `DESIGN.md` context and anti-slop design docs.

---

## 2. Client & relationship

- **Who Allen is:** 81 years old. A lifelong writer, composer and educator from the Bribie Island area (QLD), still writing. Three bodies of work:
  - **Music** — jazz standards, covers, and original compositions, studio-recorded; performs locally around Bribie Island. The old site let visitors stream the music free.
  - **School plays** — scripts written for primary-age performers (~ages 10–13), for classroom lessons and school productions.
  - **Books** — (1) classroom **communication-skills workbooks** (3 shown so far), designed to be taught from; (2) **children's storybooks**, some released years ago as YouTube "audiobooks" using early robotic text-to-speech (cowbelly-style), now dated and due for re-recording.
- **How the lead came in:** `TBC` — Allen asked Dexter directly to build the new site; referral path/relationship still to confirm (local Bribie Island connection likely).
- **Preferred contact:** `TBC`.
- **Budget posture:** `TBC` — individual, retired author; self-funded personal project with **no organisation behind it**, so infer a **community / mates-rate** posture rather than corporate market rate. Confirm the funding posture; don't ask "what's your budget" directly.
- **Tone with client:** warm, informal, professional. Lead with value, never haggle. **Note his age** — keep explanations plain, avoid jargon, and be patient with tech steps he may not be fluent in.

---

## 3. About the project / organisation (approved content)

The site presents Allen's lifetime of work as a **portfolio** and acts as a **store**: sell books and any paid scripts, with the music free to stream. One site, three clearly-signposted sections, kept up to date by Allen himself. Replaces `allen0295.wixsite.com/mysite`.

- What it's for: consolidate music + plays + books into a single, maintainable home; free music streaming (parity with old site), paid books and scripts through one cart.
- Who it serves / target audience (priority order):
  1. **Teachers / drama & English coordinators** — the commercial engine for the plays and communication books. Time-poor; judge fit fast by age band, cast/group size, run time, and classroom use.
  2. **Parents and young readers** — for the children's books.
  3. **Music listeners** — general and local; press play, free, no account.
  4. **Allen himself** (81) — must be able to operate and update it.
- Key messages / taglines: grounded, plain-spoken veteran maker, not a hard sell. Working lines from the mockups (for approval): "plays to perform, books to read, music to keep"; "free to hear, buy to keep"; "three doorways, one house."
- ⚠️ **Watch for inconsistencies:** **surname spelling** — the old site and domain use **"Gillon"** (`allengillon.com`, "© Allen Gillon"), so this file's original "Gillion" was corrected to **Gillon**; confirm canonical spelling. Also, all **titles, prices, counts and the portrait in the mockups are placeholders** and need Allen's real content before build.

---

## 4. Brand & design

- **Palette:** `TBC` — not finalised. Five directions explored, each with its own palette; Allen picks a direction first.
- **Logo / existing assets:** `TBC` — no logo yet. Old Wix site has **album-art images** (request originals). Request the **original vector/SVG** of any logo if one exists.
- **Existing materials to mine for copy/tone/layout:** old Wix site (music, album covers, short bio line), YouTube children's audiobooks, the 3 communication-skills books, the school-play scripts, and the studio music recordings.
- **Design direction / references:** five homepage mockups produced — **Small Press, The Desk, Programme, Script, Catalogue** — for Allen to choose from. Direction so far leans toward **warmth + imagery** over austere/systematic looks. Explicit anti-"AI-slop" constraints captured in `PRODUCT.md` / `DESIGN.md`.
- ⚠️ **Accessibility consideration (client + likely audience skew older):** favour large, legible type, high contrast, generous tap/click targets, simple navigation, no tiny low-contrast text. **Confirmed as a design value for this project** (Allen is 81; audience includes older visitors and teachers on school hardware): body ≥18–20px, ≥44px targets, nothing important reachable only on hover.

---

## 5. Site / product structure

**Version 1 (first invoice):**
- Homepage that **routes** to three sections (Music / Plays / Books) rather than dumping everything at once.
- The **index / listing**: every work shown with teacher-facing metadata — plays: age band, cast size (incl. flexible range), run time, classroom use; books: year level, format, length; music: tracks, length, free.
- **Free inline music player** — stream on the page, no account (parity with the old site).
- **Sample then buy** on each work; a **single cart** for paid items (books + any paid scripts).
- **About Allen** section; **contact**.
- Placeholder-friendly (not everything is digitised yet; "new recording coming" note on the old children's audio).

**Phase 2 (priced separately, built when needed):**
- Full checkout + payment provider integration.
- **Script licensing model** (per-performance / cast-size licence) if chosen, instead of a flat price.
- **Re-recorded children's audiobooks** to replace the old robotic-TTS versions.
- **Self-service admin** so Allen can update content without Dexter (Supabase + admin page, or a CMS).

---

## 6. Catalogue & store — Music, Plays, Books

The core functional area. Three content domains, one cart:

- **Music** — free streaming (jazz standards, covers, originals); track list, length, year. Always free.
- **Plays** — scripts for ~ages 10–13; teacher metadata surfaced on every entry (age band, cast size incl. flexible range, run time, classroom use); read a sample, then buy or licence.
- **Books** — (a) communication-skills workbooks (classroom; year level, format, length); (b) children's picture books (ages, pages, audio availability, with a note when new audio is coming). Buy.
- **Teacher-first metadata** on every paid item. Single cart for paid items; music never paywalled.
- **Who manages it:** Allen long-term — needs simple self-update (see Phase 2).

---

## 7. Enquiry / contact (no membership)

No user accounts or membership needed for V1. Likely light **enquiry paths**: school **licensing enquiries** for plays/books, and possibly **booking Allen for shows** locally. A simple contact form (name, email, message, enquiry type) that emails Allen. Who administers: Allen. `[confirm fields + destination email — TBC]`

---

## 8. Payments (if applicable)

- **Provider:** `TBC` — Allen sells **books and possibly paid scripts/licences**, mostly **online digital** sales; confirm whether he also sells **in person** (at shows / school visits), which changes the choice. Square is the default for an in-person + online mix; if it's purely online digital goods, Stripe or a digital-goods platform may fit better. Confirm how Allen takes money today.
- **Uses:** book sales; paid script downloads / performance licences.
- **Critical:** any payment account + linked bank account must be in **Allen's name, not Dexter's**.
- **Never** build custom payment processing (PCI / security / liability). Use a provider.
- Data pattern: a **form captures the info**, the **provider handles the money**.

---

## 9. Tech stack & architecture

- **Framework:** **Next.js (App Router), React/JSX**, deployed on **Vercel**. Chosen over a plain Vite/React SPA specifically for **SEO**: pages render to complete HTML via static generation / server rendering, so the teacher-facing content (play titles, age bands, cast sizes, descriptions) sits in the initial HTML and indexes reliably. Per-page `<title>` / meta description and **Product structured data** on the paid books and scripts are part of the build.
- **Data / self-management:** Allen will maintain the catalogue long-term, so plan for **Supabase (Postgres) + a small password-protected admin page** (or an appropriate CMS) in **Phase 2** so he can add works, prices and audio without Dexter. Next.js server components / route handlers give a natural home for server-side data access and a future admin, so this fits cleanly. V1 can ship with content sourced from one place (placeholder) so the swap to Supabase later doesn't touch the display.
- **Auth / privacy:** if any personal data is stored (enquiries, orders), protect it (RLS, no public reads of personal info).

---

## 10. Domain, hosting, contact

- **Domain:** **`allengillon.com` — already registered by Allen.** Confirm it's in **his own name/account** (not Dexter's) so ownership is unambiguous. Point DNS at Vercel.
- **Hosting:** Vercel (free tier fine for a small site; ideally on Allen's own account long-term).
- **Division of control to set with client:** who owns the domain (Allen), who self-manages content (Allen, from Phase 2), and that **design/structural/code changes go through Dexter**. Make the custom-build trade-off explicit up front.
- **Contact on site:** `TBC` — confirm which details Allen will show publicly (email likely). The `allen@allengillon.com` address used in the mockups is a **placeholder** — confirm the real one.
- ⚠️ **Privacy:** never publish a personal home address. Confirm what contact details Allen is comfortable showing publicly.

---

## 11. Commercial / pricing

- **Market-rate anchor for the scope:** `TBC` — small portfolio + light store; state a realistic AU freelancer/agency range as the anchor before any discount.
- **Actual rate offered:** `TBC` — individual retiree/author with no organisation behind it; likely a **community / mates rate**.
- **Protections (Dexter's standard practice):**
  - **50% deposit before starting.**
  - Put **total + scope + inclusions in writing** (even a text).
  - Later additions = friendly **paid** extras, not absorbed scope creep (e.g. payments/checkout, re-recorded audiobooks, and the self-service admin are all Phase 2 extras).
- **Before final quote:** understand the **funding posture** (self-funded individual) — shapes how hard to lean on any discount. Don't ask "what's your budget" directly.
- **Payment method:** `TBC`.

---

## 11b. Content recovered from the old Wix site (2026-08-27)

- **Audio:** all five albums' streams were pulled from the old site's Wix Music players into
  `audio/<album>/` (53 mp3s, ~128 MB, 128 kbps). Four albums are **full-length free streams**
  (sourced from the old "Listen FREE" page): That's The Time (12), Wonderful World (10),
  Misty (8), I Just Called (12). **Dedicated To Tim Hughes only ever had 30-second previews**
  publicly; the full files sit behind Wix's paid download and could not be pulled. Ask Allen
  for the original recordings to replace the previews (and for higher-quality masters generally).
- **Original songs:** five YouTube videos found on the old site's Originals page and embedded
  on `music.html`: Jamie (AWTyzHr4eaI), At Last I'm Free (6idFN_r1Dlw), Trippin' On My Senses
  (nqTpPzs9boQ), Travellin' Road (VnXBwH5PcxU), Taking Chances (21kIAn9ED28). Dexter may
  supply more links later.
- **Biography:** the old site's Timeline page ("A Timeless Story") was rewritten onto
  `biography.html`. The duet's current name is **Timeless**; earlier act was **Ann and Allen Ray**.
- **Contact:** the old site publicly listed TIMELESS Music **0438 747 882 / 0438 747 883**;
  these are now on `hire.html`. Email still TBC, so no email is shown anywhere yet.
- **Shows page:** old site had a Matthew Allen 5 at Chandler Theatre 1998 video (10 numbers);
  not yet used, the video itself was not recoverable as a direct link.

## 12. Outstanding items & next actions

**Waiting on the client (Allen):**
- **Pick a homepage design direction** from the five mockups.
- Confirm **canonical surname spelling** (Gillon vs Gillion).
- Provide **real content**: play titles + descriptions + teacher metadata; book titles/descriptions; music track lists; and **prices**.
- Supply **digital copies** of scripts/books as they're ready (placeholders fine meanwhile).
- Decide the **script licensing model** (flat price vs per-performance / cast-size licence).
- Confirm **public contact details** to show (email; **no home address**) and, ideally, a **portrait photo**.
- Confirm whether he **sells in person** (affects payment provider choice).
- Provide **original logo / asset files** if any exist.

**Dexter to do:**
- Fill in this context file as details arrive. *(Allen's info populated.)*
- **Deploy the 5 homepage mockups + switcher** for Allen to review from one link (Vercel, project `allengillon-mockups`).
- Once Allen picks a direction, **build V1**.
- Send a phased **quote** once scope + funding posture are clear.
- Set up **`allengillon.com` DNS → Vercel** (on Allen's own account/name).

---

## 13. About the developer (for continuity)

- **Dexter** — IT student, Brisbane / Bribie Island area, QLD, Australia. Builds full-stack apps fast with **Claude Code**.
- Building a **custom web-dev / software business**; strategy is to use client work as an on-ramp toward a productized/vertical product later.
- **Other work / proof:** South East Queensland Defence Veterans Golf Club (SEQDVGC) site — first unrelated paying client; Bribie Island Tigers FC Training Hub (his father is club president); Courageous Girls Club Leaders app (his mother's business); an electrical-company website lead; a personal-name portfolio site on Vercel.
- Allen Gillon is a **prospective paying client** — a local (Bribie Island) retired author, playwright and composer; the job is a one-site portfolio + store consolidating his life's work, and another local-creative build alongside SEQDVGC, the Tigers, and Courageous Girls.
