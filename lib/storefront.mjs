import { coffeeLink, stripePaymentLinks } from "../content/stripe-payment-links.mjs";

const paymentLinks = (() => {
  try {
    return {
      ...stripePaymentLinks,
      ...JSON.parse(process.env.STRIPE_PAYMENT_LINKS_JSON || "{}"),
    };
  } catch {
    return stripePaymentLinks;
  }
})();

/* The play-* links in content/stripe-payment-links.mjs are the A$10 links
   (created 2026-11-02). Set this back to false to hide play checkout again. */
export const playLinksCurrent = true;

export function stripePaymentLink(productId) {
  if (typeof productId === "string" && productId.startsWith("play-") && !playLinksCurrent) return "";
  return checked(paymentLinks[productId]);
}

function checked(value) {
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com" ? url.toString() : "";
  } catch {
    return "";
  }
}

/* The "Buy me a coffee" link, through the same buy.stripe.com check. */
export function coffeeTipLink() {
  return checked(coffeeLink);
}

export const albumPrice = 1000;
export const playPrice = 1000;

export function formatAud(cents) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(cents / 100) + " AUD";
}
