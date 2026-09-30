// Ann Gillon's paintings: catalogue helpers shared by /anns-art, the
// painting routes /anns-art/[id], the dialog, scripts/build-art-images.mjs
// and tests/artwork-purchase.test.mjs. No imports beyond the catalogue, so it
// runs unchanged in Node tests, the browser and the Worker.
import { artworks as catalogue } from "../content/artworks.mjs";

/* Photographs that repeat another view of the same painting byte for byte
   (the Facebook album lists them twice). They are left out, so "View 2 of 3"
   never shows the same picture twice. scripts/build-art-images.mjs hashes the
   sources and stops if a repeat appears that is not listed here. */
export const DUPLICATE_VIEWS = new Set([
  "156590929103043", // Blue Macaws: the same file as 426502619623139
  "130267801735356", // the same file as 156584235770379
]);
const viewName = (image) => image.src.split("/").pop().replace(/\.[a-z0-9]+$/i, "");

export const artworks = catalogue.map((art) => ({
  ...art,
  images: art.images.filter((image) => !DUPLICATE_VIEWS.has(viewName(image))),
}));
export const findArt = (id) => artworks.find((art) => art.id === id);
export const formatPrice = (cents) => "A" + new Intl.NumberFormat("en-AU", {
  style: "currency", currency: "AUD", currencyDisplay: "symbol", maximumFractionDigits: 0,
}).format(cents / 100);

/* The rooms of the gallery, in wall order. "All" is the whole collection. */
export const ROOMS = ["All", "Animals", "Coast & country", "Colour & imagination"];
export const inRoom = (art, room) => room === "All" || art.category === room;

/* The hallway on /anns-art. On a full page load, ART_HALL_SCRIPT runs inline
   before first paint, so the wall is laid out as the hallway from the start
   (no jump after load) when JS runs and motion is allowed. On a client-side
   visit (a nav link) that inline script never runs, so ArtWall applies the
   same test, artHallAllowed(), in a layout effect, also before paint.
   Without JS, or under prefers-reduced-motion, the class is never set and
   the index shows. */
export const ART_HALL_CLASS = "art-hall";
export const ART_HALL_SCRIPT_ID = "art-hall-script";
export function artHallAllowed() {
  try {
    return "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
export const ART_HALL_SCRIPT =
  '(function(){try{if(!("IntersectionObserver" in window))return;' +
  'if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;' +
  'document.documentElement.classList.add("art-hall")}catch(e){}})();';

/* Allen's number, for enquiries by text message. */
export const ENQUIRY_SMS = "+61438747882";

// ---------------------------------------------------------------------------
// Status: what the wall label says under the painting.

/**
 * { state, label }:
 *   for-sale      the price, e.g. "A$225"
 *   sold          "Sold"
 *   not-for-sale  "Not for sale"
 *   enquire       commissioned work: "Guide price A$250"
 */
export function artStatus(art) {
  if (art.availability === "available") return { state: "for-sale", label: formatPrice(art.priceCents) };
  const note = String(art.note || "").toLowerCase();
  if (note.includes("not for sale")) return { state: "not-for-sale", label: "Not for sale" };
  if (note.includes("sold")) return { state: "sold", label: "Sold" };
  return { state: "enquire", label: `Guide price ${formatPrice(art.priceCents)}` };
}

/** Medium and size, only the parts that are known: "Acrylic · 75 × 75 cm" or "". */
export function artDetails(art) {
  return [art.medium, art.dimensions].filter(Boolean).join(" · ");
}

/**
 * The note shown in the dialog, when it adds something the label does not
 * already say ("Ann has marked this original sold" repeats "Sold").
 */
export function artNote(art) {
  const status = artStatus(art).state;
  if (!art.note || status === "sold" || status === "not-for-sale") return "";
  return art.note;
}

// ---------------------------------------------------------------------------
// The one action per painting.

/**
 * The single action for a painting's detail view.
 * `checkoutUrl` is stripePaymentLink(`art-${art.id}`) from lib/storefront.mjs
 * (the page resolves it on the server). An available painting with a Stripe
 * link gets { kind: "buy", href: checkoutUrl, label: "Buy this painting" };
 * everything else (sold, commissioned, not for sale, or no link yet) gets an
 * enquiry by text message to Allen.
 */
export function paintingAction(art, checkoutUrl) {
  if (art.availability === "available" && checkoutUrl) {
    return { kind: "buy", href: checkoutUrl, label: "Buy this painting" };
  }
  const status = artStatus(art);
  const about = status.state === "for-sale" || status.state === "enquire"
    ? `${art.title}, listed at ${formatPrice(art.priceCents)}`
    : art.title;
  const body = `Hello Allen, I would like to ask about Ann's painting ${about}.`;
  return { kind: "enquire", href: `sms:${ENQUIRY_SMS}?&body=${encodeURIComponent(body)}`, label: "Enquire about this painting" };
}

// ---------------------------------------------------------------------------
// Responsive images, built by scripts/build-art-images.mjs.

export const ART_RESPONSIVE_DIR = "images/art-responsive";
export const ART_WIDTHS = [480, 960, 1600];

/** The file stem of a catalogue image: "/images/art/gallery/123.webp" -> "123". */
export function artImageName(image) {
  return viewName(image);
}

/**
 * Widths built for an image: 480, 960 and 1600, capped at the source width.
 * The rule is never to upscale past the photograph. Ann's Facebook
 * photographs are at most 1400px wide, so today the largest copy is the
 * source width rather than 1600. Higher-resolution originals lift the cap
 * with no code change: re-run scripts/build-art-images.mjs.
 */
export function artImageWidths(image) {
  const widths = ART_WIDTHS.filter((w) => w < image.width);
  if (image.width <= ART_WIDTHS[ART_WIDTHS.length - 1]) widths.push(image.width);
  return widths;
}

export function artImageUrl(image, width, format) {
  return `/${ART_RESPONSIVE_DIR}/${artImageName(image)}-${width}.${format}`;
}

/** A srcset string for one format: "/images/art-responsive/123-480.avif 480w, ...". */
export function artSrcSet(image, format) {
  return artImageWidths(image).map((w) => `${artImageUrl(image, w, format)} ${w}w`).join(", ");
}

/** The fallback <img src>: the 960 WebP (or the largest below it). */
export function artFallbackSrc(image) {
  const widths = artImageWidths(image);
  const width = widths.find((w) => w >= 960) || widths[widths.length - 1];
  return artImageUrl(image, width, "webp");
}

/** Width over height of a painting's first photograph. */
export function artRatio(art, index = 0) {
  const image = art.images[index] || art.images[0];
  return image.width / image.height;
}
