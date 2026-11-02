# Stripe catalogue

Allen Gillon's live Stripe account contains these products and Payment Links:

- Four album DVDs at A$10 each (not shown on the site: albums are free).
- Five downloadable PDF plays at A$10 each. The A$10 Prices and Payment Links
  were created on 2026-11-02 and are each product's default price. The
  original A$50 Prices and Payment Links (created 2026-10-01) are still
  active in Stripe: the site no longer links to them, but anyone holding an
  old URL could still pay A$50. Deactivate them in the Stripe Dashboard.
- Twenty-nine original paintings currently marked available.
- "Buy Allen a coffee": a pay-what-you-like Price (A$5 suggested, A$2 to
  A$500) shown beside the album track lists on /music. Its link is
  `coffeeLink` in `content/stripe-payment-links.mjs`, kept out of the
  product catalogue because it is a thank-you, not a sale.

Album and painting checkouts accept Australian delivery addresses only. Each painting Payment Link is limited to one completed checkout because it is a one-off original. Sold, commissioned, not-for-sale and availability-unconfirmed paintings remain enquiry-only and were not added as purchasable products.

Live public URLs are mapped to stable website product IDs in `content/stripe-payment-links.mjs`. `STRIPE_PAYMENT_LINKS_JSON` remains available as an optional deployment override.

Stripe Checkout confirms that play PDFs will be emailed to the address used for the purchase. The private PDF files must not be moved back into `public/`.

## Changing a painting price

The website is static, so it cannot securely read live Stripe prices in a visitor's browser. Stripe Price amounts are immutable. To change a painting price:

1. Create a new Price for the existing Stripe product.
2. Update the product's Payment Link to use that Price.
3. Change the matching `priceCents` value in `content/artworks.mjs`.
4. Redeploy the site.
