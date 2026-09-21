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

export function stripePaymentLink(productId) {
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
export const playPrice = 5000;

export function formatAud(cents) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(cents / 100) + " AUD";
}
