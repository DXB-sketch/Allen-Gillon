# Legal TODO

The legal pages (/privacy, /terms, /accessibility) are written but unpublished.
`content/legal.config.json` is `{"published": false}`, so the routes 404 on both
hosts, the footer legal links are hidden and the sitemap leaves them out. Flip
it to `true` only after the human signs off the wording below, or approves a
visible "draft pending sign-off" note.

Every item here is a fact the pages state or rely on that has not been checked
by a person who can confirm it. None of this is legal advice; a lawyer or the
relevant regulator's guidance should settle anything marked "legal check".

## Sign-off needed before publishing

- [ ] The final wording of /privacy, /terms and /accessibility (legal check).
- [ ] The play performance licence. /terms has a placeholder: buying a script
      lets you read and print it for your own school, class or group, and
      performances need an email to support@ first. Allen must decide the real
      terms (for example, whether a school may stage the play for an audience
      for the A$1 price, and whether admission may be charged).
- [ ] The Australian Consumer Law wording in /terms quotes the standard
      "Our goods come with guarantees..." text. Confirm it is the right form for
      sellers who are private individuals with no ABN (legal check).
- [ ] The damage-claim request: photos within 7 days of delivery. It is worded as
      a request that does not remove ACL rights. Confirm Ann and Allen agree.
- [ ] Governing law: "the law of Queensland, Australia" (legal check).

## Business and seller facts

- [ ] Sellers: Ann Gillon sells the paintings; Allen Gillon sells the play PDFs
      and everything else. Confirm both are happy to be named as sellers.
- [ ] No ABN and no GST registration. The terms say only "All prices are in
      Australian dollars". Confirm no GST statement is needed (legal check).
- [ ] Whether either seller is covered by the Privacy Act 1988. /privacy says we
      "follow" the Australian Privacy Principles without claiming the Act
      applies (small business exemption; legal check).

## Delivery and digital files

- [ ] Play PDFs: "Allen emails the PDF ... If it has not arrived within two
      days ..., email support@". Confirm the two-day window suits Allen.
- [ ] Remedy for a corrupt or undelivered PDF: a working copy, or a refund if
      Allen cannot send one. Confirm.
- [ ] Paintings: delivery within Australia is included in the price and the
      checkout accepts Australian addresses only (matches STRIPE-SETUP.md).
      Confirm the carrier and whether paintings are insured in transit.
- [ ] "The painting is your responsibility once it has been delivered" (risk
      passes on delivery; legal check).
- [ ] "If a painting sells to someone else at the same moment you pay, we will
      refund you in full." Stripe limits each painting link to one completed
      checkout, so this should be rare. Confirm the refund promise.

## Privacy facts to verify

- [ ] Reviews are stored in Cloudflare D1 (`allen-gillon-reviews`). Confirm the
      D1 location (jurisdiction or region) for the APP 8 list.
- [ ] Rejected reviews stay in D1 with status `rejected`. /privacy says "We keep a
      review until you ask us to remove it". Decide whether rejected reviews
      should be deleted instead.
- [ ] Workers observability (logs and traces) is enabled in wrangler.jsonc.
      /privacy says "short-lived technical logs". Confirm the retention period
      and whether IP addresses are logged.
- [ ] Cloudflare may set a strictly necessary security cookie (for example
      `__cf_bm`) if bot protection is on. Confirm which Cloudflare features are
      enabled on the zone.
- [ ] Email: support@allengillon.com forwards through Cloudflare Email Routing
      to Allen's Gmail. This is not set up yet (human TODO). /privacy names
      Google as the email provider; confirm once routing is live.
- [ ] Stripe: the entity (Stripe Payments Australia Pty Ltd) and that Stripe
      shares name, email and delivery address with the seller. Confirm what the
      Stripe dashboard actually shows.
- [ ] Order records: "for as long as Australian tax law requires" (the ATO's
      usual period is five years; legal check).
- [ ] "Your player position is remembered only while the page is open." True for
      the albums player today (no localStorage). Re-check after the W4 reader
      merge, in case the reader stores a page position.
- [ ] "Listen to this page" uses the browser's speech voice. Some browsers send
      text to online voices; /privacy says so. Confirm the wording.
- [ ] YouTube embeds use youtube-nocookie.com and load only after a click
      (LiteYouTube). If /read or any other page embeds YouTube differently after
      W4, update /privacy.
- [ ] Under-15 note: asks under-15s to get a parent, guardian or teacher's OK
      before reviewing or buying, and promises deletion on request. Confirm.
- [ ] Reply time for access and correction requests: "within 30 days".
- [ ] OAIC link (oaic.gov.au) for complaints.

## Copyright

- [ ] Allen's words, music, recordings, stories and plays are (c) Allen Gillon;
      Ann's paintings and photos of them are (c) Ann Gillon. The footer says
      "© {year} Allen Gillon · Paintings © Ann Gillon".
- [ ] The cover recordings on the albums need APRA AMCOS clearance (human TODO
      from the plan). The terms say the free albums are "for your own
      listening"; confirm once licensing is sorted.
- [ ] The ElevenLabs licence for the audiobook narration (human TODO from the plan).
- [ ] Photos of Allen and Ann (some from Facebook or event photographers):
      confirm the right to publish each.

## Accessibility statement

- [ ] Claims to aim for WCAG 2.2 AA. The known-limits list names: YouTube
      captions on the original songs, the Timeless video captions (sung words
      not confirmed), low-resolution photos and scans. Keep it current.
- [ ] The Timeless video captions (public/videos/timeless-*.en.vtt) describe
      the music; faster-whisper found no intelligible words. Allen or Ann should
      confirm the song names and whether any words should be captioned.

## Contact details

- [ ] support@allengillon.com must work before publishing (Cloudflare Email Routing).
- [ ] Text number 0438 747 882 (sms: link). Add a tel: link only if Allen accepts calls.
- [ ] Locality shown as "Bribie Island QLD". No street address is published.
