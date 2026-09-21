# Stripe catalogue

Allen Gillon's live Stripe account contains 38 active products and Payment Links:

- Four album DVDs at A$10 each.
- Five downloadable PDF plays at A$50 each.
- Twenty-nine original paintings currently marked available.

Album and painting checkouts accept Australian delivery addresses only. Each painting Payment Link is limited to one completed checkout because it is a one-off original. Sold, commissioned, not-for-sale and availability-unconfirmed paintings remain enquiry-only and were not added as purchasable products.

Live public URLs are mapped to stable website product IDs in `content/stripe-payment-links.mjs`. `STRIPE_PAYMENT_LINKS_JSON` remains available as an optional deployment override.

Stripe Checkout confirms that play PDFs will be emailed to the address used for the purchase. The private PDF files must not be moved back into `public/`.

## Changing a painting price

The website is static, so it cannot securely read live Stripe prices in a visitor's browser. Stripe Price amounts are immutable. To change a painting price:

1. Create a new Price for the existing Stripe product.
2. Update the product's Payment Link to use that Price.
3. Change the matching `priceCents` value in `content/artworks.mjs`.
4. Redeploy the site.
