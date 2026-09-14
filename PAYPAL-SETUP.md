# PayPal setup for Ann's paintings

The gallery and checkout code are prepared. **No PayPal account is connected and no real payments have been tested or taken.** Checkout defaults to off and the gallery offers text enquiries until the configuration below is complete.

## What Allen needs to provide

1. **The PayPal account that should receive the money.** Use Allen or Ann's verified Australian PayPal Business account, with its email confirmed and PayPal's account checks completed. Link the withdrawal bank account inside PayPal. The website does not need the PayPal login password, bank details, card details or identity documents.
2. **Sandbox Client ID and Secret**, plus the sandbox seller's **Merchant ID**, for testing with a separate sandbox buyer. Then provide the corresponding **Live Client ID, Live Secret and Live Merchant ID** for that same receiving business account. Create/select a REST app in PayPal Developer Dashboard → Apps & Credentials. A PayPal email address alone is not sufficient for this integration.
3. **Confirmation that the 29 originals currently marked available are still available**, including any displayed at the Bribie Island Arts Centre. Seven works marked sold, not for sale or commissioned remain enquiry-only. The prices have already been selected within Allen's authorised A$100–A$250 range; no new price decisions are needed unless Allen wants to change them.
4. **Delivery and customer service details:** confirm who will pack and send the paintings, expected dispatch time, whether framing is included for each work, and the contact/return address and returns process. Free delivery is already set for Australia. Confirm whether the advertised prices need any tax treatment; the code charges the displayed total with no added tax or postage.

Put secrets directly in Vercel environment settings or an approved secret manager, not an email, chat message or repository file. The developer needs access to configure the Vercel project and database, not Allen's PayPal password.

## Developer configuration

Create a TLS-enabled PostgreSQL database and use its pooled connection URL. A database is necessary to persist sales and prevent two buyers from purchasing the same original across Vercel instances. This implementation uses ordinary Postgres and does not require a particular vendor. Use separate sandbox and production databases; the schema additionally separates their stock by environment.

Copy `.env.example` to ignored `.env.local` for local setup, or add the values to the appropriate Vercel environment:

| Variable | Value |
| --- | --- |
| `PAYPAL_CHECKOUT_ENABLED` | `false` until setup and stock review are complete; `true` to enable |
| `PAYPAL_ENV` | `sandbox` for testing; `live` for real payments |
| `PAYPAL_CLIENT_ID` | Client ID from the matching PayPal REST app |
| `PAYPAL_CLIENT_SECRET` | Secret from that same app; server-only |
| `PAYPAL_MERCHANT_ID` | Secure Merchant ID of the receiving seller; sandbox and live differ |
| `PAYPAL_WEBHOOK_ID` | ID returned when registering the webhook below, in the same PayPal app/environment |
| `SITE_URL` | Exact canonical HTTPS origin, e.g. `https://allengillon.com` if that is the production domain; no path or trailing slash. Sandbox localhost can use `http://localhost:3101`. |
| `DATABASE_URL` | TLS-enabled pooled Postgres connection string |

Run `npm run shop:setup` with `.env.local` configured. This creates the private `art_shop` schema and seeds one item per available original. Rerunning it does not overwrite sold/held stock. Use a server-only database role with access to this schema; do not expose it through browser credentials or a public data API.

Register this webhook in the matching PayPal REST app:

`https://YOUR-CANONICAL-DOMAIN/api/paypal/webhook`

Subscribe to `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`, and `PAYMENT.CAPTURE.REVERSED`. Set `PAYPAL_WEBHOOK_ID` to the registration's ID. The handler verifies the signature with PayPal and reconciles the current capture; it never initiates a payment. The webhook endpoint must be publicly reachable over HTTPS, including on a test deployment. A protected Vercel preview or localhost without HTTPS forwarding cannot receive PayPal webhooks.

Keep the production deployment set to `PAYPAL_CHECKOUT_ENABLED=false` while sandbox testing on a separate deployment. Do not use live credentials in preview builds. All PayPal secrets stay server-side; no `NEXT_PUBLIC_` credentials are used. After adding or changing Vercel variables, redeploy.

## Buyer flow

1. Choose one painting and review the fixed AUD total with free Australian delivery.
2. Continue to PayPal and choose the delivery address and funding method.
3. Return to the site. The server checks the PayPal order, expected seller, artwork, quantity, total and Australian delivery address.
4. Select **Confirm and pay**. The server atomically claims the one original, then captures payment using a stable idempotency key.
5. Only a verified completed capture displays a receipt and marks the original sold. Pending or uncertain captures keep stock held. Refunds do not automatically put the physical artwork back on sale.

The checkout cookie ties order review to the buyer's browser. PayPal holds buyer/payment/delivery details; the database stores only order/product references, a hashed session identifier, amount and status. Fulfil from the delivery address shown in PayPal's confirmed transaction. Transaction receipts and seller payment alerts come from PayPal; this repo does not contain an email service. Check that seller notifications are enabled and monitored, and check PayPal Activity before dispatch.

## Checks before enabling live payments

- Run `npm test` and `npm run build`.
- In PayPal sandbox, use a **separate personal buyer account**, not the receiving business account. Complete an Australian-address purchase, confirm the capture in both PayPal and the local order record, then check the gallery shows sold.
- Exercise cancel/back navigation, non-Australian address rejection before capture, refresh/retry, two buyers for one original, pending/failed payment handling, refund handling, webhook signature rejection and delivery retries.
- Confirm seller notifications and the complete delivery address in PayPal. Supply actual dispatch/returns details before launch; do not invent a delivery promise.
- Switch to matching live credentials, merchant ID, webhook ID, production database and canonical domain. Then enable checkout and redeploy. Allen can make the final real test purchase using a separate buyer account if the receiving account is his own. Any live test charges actual money and incurs PayPal's applicable fees; Allen/user performs that purchase.

The local tests use mocked PayPal HTTP responses and an in-memory Postgres (PGlite) engine. They exercise SQL stock claims and payment validation but do not replace a real sandbox round trip or multi-instance production database testing.

## Held payments and stock maintenance

Run `npm run shop:reconcile` to re-read PayPal's status for `CAPTURING`/`PENDING` orders. It never initiates a capture. An unresolved unpaid capture attempt stays held for manual review; there is deliberately no time-based release that could oversell a painting after a delayed payment.

For an unpaid order stuck in `CAPTURING`, inspect its PayPal order, capture history and server logs. Only after confirming that no capture exists or can still complete should an operator clear its claim. Completed/refunded works remain sold until Allen confirms the physical original is available again. Any stock edit must target the exact product and environment.

Maintain titles, prices and enquiry flags in `content/artworks.mjs`. Source links are stored alongside each photo. `ARTWORK-CATALOGUE.md` records the reconciliation of the source gallery and the price list.

## References

- [PayPal API credentials and sandbox accounts](https://developer.paypal.com/api/get-started/)
- [Move a PayPal app to production](https://developer.paypal.com/api/rest/production/)
- [Find the Secure Merchant ID](https://www.paypal.com/au/cshelp/article/how-do-i-find-my-secure-merchant-id-in-my-paypal-account-help538)
- [Orders API and shipping preferences](https://developer.paypal.com/api/rest/integration/orders-api/api-use-cases/standard/)
- [Webhook registration and verification](https://developer.paypal.com/api/rest/webhooks/rest/)
