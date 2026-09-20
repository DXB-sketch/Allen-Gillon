# Stripe handoff

The site is ready for Stripe Payment Links. No Stripe secret keys are required in the repository or browser.

1. Create the nine products listed in `content/stripe-products.json` in Allen's Stripe account.
2. Create one Payment Link for each product. Collect a delivery address for the four physical DVD products. Do not collect one for the five digital play files.
3. In Vercel, add a sensitive environment variable named `STRIPE_PAYMENT_LINKS_JSON`. Its value is a JSON object that maps each catalogue `id` to its `https://buy.stripe.com/...` Payment Link.
4. Redeploy and confirm that every album and play shows a working buy button.
5. Configure Stripe's receipt or post-payment message to supply the purchased play file. The play PDFs must not be restored as public download links.

Example shape:

```json
{
  "album-thats-the-time": "https://buy.stripe.com/...",
  "play-melting-pot": "https://buy.stripe.com/..."
}
```

Use Stripe test mode first. Check each item, amount, receipt and delivery flow before creating live Payment Links.
