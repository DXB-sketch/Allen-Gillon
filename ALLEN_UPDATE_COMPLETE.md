# Allen site update complete (2026-09-20)

## Home page

- Removed boxes 3, 4 and 5.
- Moved the introduction beside the remaining Albums and Bookings links.
- Added two more photographs of Allen in an overlapping collage.
- Changed the home page `Allen Gillon` title to blue.

## Site reader

- Photo captions are no longer read aloud.
- Album track lists and painting catalogue text are skipped.
- Pause, Resume and Stop remain available while the reader is speaking.

## Allen's requested copy

- Added Ann's singing, piano, flute and solo-gig introduction to her page.
- Changed the booking prompt to ask for the date and venue.
- Removed the YouTube link and icon from the footer.
- Reworked visible copy to remove em dashes and formulaic promotional phrasing.

## Sales and Stripe handoff

- Every album is marked as a DVD copy for $10 AUD.
- Every play is marked as a PDF download for $50 AUD.
- Removed the old free play download links and moved the five PDFs out of `public/`.
- Removed the unused PayPal checkout, API routes, database schema and configuration.
- Added stable product data in `content/stripe-products.json`.
- Added Payment Link mapping through `STRIPE_PAYMENT_LINKS_JSON`. Until links are configured, the site clearly says that Stripe checkout is coming soon.
- Added `STRIPE-SETUP.md` with the account handoff steps.

## Verification

- `node --test`: 2 tests passed.
- `next build`: successful, 25 pages generated.
- Checked the home, music and plays pages in a browser at desktop and mobile widths.
- Confirmed that the footer has no YouTube link and the paid play catalogue has no public PDF links.

Stripe account work is intentionally still outstanding. Create the nine products and Payment Links in Allen's account, add the resulting JSON mapping to Vercel, test in Stripe test mode, then switch to live links.
