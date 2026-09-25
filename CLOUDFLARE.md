# Cloudflare deployment

The site runs on Cloudflare Workers through vinext. Visitor reviews are stored in the `allen-gillon-reviews` D1 database.

## First deployment

1. Build the Worker with `npm run build:vinext`.
2. Deploy it with `npm run deploy:vinext`. Wrangler provisions the D1 database declared in `wrangler.jsonc` when it does not already exist.
3. Apply the database schema with `npm run reviews:migrate:remote`.
4. Open `/reviews` on the deployed Worker and submit a test review.

The existing Next.js build remains available through `npm run build` while the Cloudflare migration is being completed.

## Review moderation

New visitor reviews are saved as `pending`, so nothing appears publicly without approval.

List pending reviews:

```sh
npm run reviews:pending
```

Approve a review after copying its ID from that list:

```sh
npx wrangler d1 execute allen-gillon-reviews --remote --command "UPDATE reviews SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = 'REVIEW_ID'"
```

Reject a review:

```sh
npx wrangler d1 execute allen-gillon-reviews --remote --command "UPDATE reviews SET status = 'rejected' WHERE id = 'REVIEW_ID'"
```

The public API returns approved reviews only. The form also includes a hidden honeypot and a minimum completion time to block basic automated submissions without interrupting visitors.
