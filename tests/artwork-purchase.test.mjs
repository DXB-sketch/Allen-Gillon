import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";
import { stripePaymentLinks } from "../content/stripe-payment-links.mjs";
import { stripePaymentLink } from "../lib/storefront.mjs";
import {
  artworks, artStatus, artDetails, artImageUrl, artImageWidths, paintingAction, ART_HALL_SCRIPT,
} from "../lib/art-catalog.mjs";

// /anns-art/[id] renders exactly one action per painting: PaintingDetail
// passes paintingAction(art, stripePaymentLink(`art-${id}`)) to PurchaseLink
// ("Buy this painting") or to one "Enquire about this painting" link.

const detailSource = await readFile(new URL("../components/art/PaintingDetail.jsx", import.meta.url), "utf8");
const routeSource = await readFile(new URL("../app/(other)/anns-art/[id]/page.jsx", import.meta.url), "utf8");

test("every artwork with a Stripe link gets exactly that link as its one Buy action", () => {
  let withLinks = 0;
  for (const art of artworks) {
    const raw = stripePaymentLinks[`art-${art.id}`];
    const action = paintingAction(art, stripePaymentLink(`art-${art.id}`));
    if (raw && art.availability === "available") {
      withLinks += 1;
      assert.equal(action.kind, "buy", art.id);
      assert.equal(action.href, raw, `${art.id} must use its own Payment Link`);
      assert.equal(action.label, "Buy this painting");
    } else {
      assert.equal(action.kind, "enquire", art.id);
      assert.match(action.href, /^sms:\+61438747882\?&body=/);
      assert.ok(!Object.values(stripePaymentLinks).includes(action.href));
    }
  }
  assert.equal(withLinks, 29, "29 available paintings have Payment Links today");
});

test("no two paintings share a Payment Link", () => {
  const hrefs = artworks.map((art) => paintingAction(art, stripePaymentLink(`art-${art.id}`))).filter((a) => a.kind === "buy").map((a) => a.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
});

test("sold, commissioned and not-for-sale works never offer checkout, even with a link", () => {
  for (const art of artworks.filter((a) => a.availability !== "available")) {
    assert.equal(paintingAction(art, "https://buy.stripe.com/test").kind, "enquire", art.id);
  }
});

test("the detail view renders one action: PurchaseLink with the action href, or one enquiry link", () => {
  assert.match(detailSource, /<PurchaseLink href=\{action\.href\}>\{action\.label\}<\/PurchaseLink>/);
  assert.equal((detailSource.match(/<PurchaseLink\b/g) || []).length, 1);
  assert.equal((detailSource.match(/href=\{action\.href\}/g) || []).length, 2, "one branch each: buy or enquire");
  assert.match(routeSource, /checkoutUrl=\{stripePaymentLink\(`art-\$\{art\.id\}`\)\}/);
  assert.match(routeSource, /generateStaticParams/);
});

test("wall labels: the price, or Sold", () => {
  const labels = Object.fromEntries(artworks.map((art) => [art.title, artStatus(art).label]));
  assert.equal(labels["Blue Macaws"], "A$225");
  assert.equal(labels["The Old Holden Ute"], "Sold");
  assert.equal(labels["Wild and Free"], "Sold");
  assert.equal(labels["Little Ace"], "Not for sale");
  assert.equal(labels["African Wild Dog"], "Guide price A$250");
  assert.equal(artDetails(artworks.find((a) => a.title === "Mare and Foal")), "", "unknown medium and size stay out");
});

test("every responsive image exists at 480/960/1600 (capped at the source width) in AVIF and WebP", async () => {
  for (const art of artworks) {
    for (const image of art.images) {
      const widths = artImageWidths(image);
      assert.ok(widths.length >= 2 && widths.every((w) => w <= Math.max(1600, image.width)), image.src);
      for (const w of widths) {
        for (const format of ["avif", "webp"]) {
          await access(new URL(`../public${artImageUrl(image, w, format)}`, import.meta.url));
        }
      }
    }
  }
});

test("the hallway script never runs under reduced motion", () => {
  assert.match(ART_HALL_SCRIPT, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(ART_HALL_SCRIPT, /wheel/);
});
