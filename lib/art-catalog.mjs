import { artworks } from "../content/artworks.mjs";

export { artworks };
export const findArt = (id) => artworks.find((art) => art.id === id);
export const formatPrice = (cents) => "A" + new Intl.NumberFormat("en-AU", {
  style: "currency", currency: "AUD", currencyDisplay: "symbol", maximumFractionDigits: 0,
}).format(cents / 100);
