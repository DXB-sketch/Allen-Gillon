import { stripePaymentLinks } from "../content/stripe-payment-links.mjs";

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

/* The play Payment Links in content/stripe-payment-links.mjs still charge the
   old $50 price. Plays now cost A$1, so play-* links are ignored until the
   human creates the A$1 links and sets this flag to true. */
export const playLinksCurrent = false;

export function stripePaymentLink(productId) {
  if (typeof productId === "string" && productId.startsWith("play-") && !playLinksCurrent) return "";
  const value = paymentLinks[productId];
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com" ? url.toString() : "";
  } catch {
    return "";
  }
}

export const albumPrice = 1000;
export const playPrice = 100;

export function formatAud(cents) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(cents / 100) + " AUD";
}
