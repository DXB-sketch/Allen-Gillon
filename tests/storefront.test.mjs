import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { albumPrice, formatAud, playPrice, stripePaymentLink } from "../lib/storefront.mjs";
import { artworks } from "../content/artworks.mjs";
import { stripePaymentLinks } from "../content/stripe-payment-links.mjs";

test("storefront prices match Allen's instructions", () => {
  assert.equal(albumPrice, 1000);
  assert.equal(playPrice, 5000);
  assert.equal(formatAud(albumPrice), "$10 AUD");
  assert.equal(formatAud(playPrice), "$50 AUD");
});

test("checkout accepts only configured Stripe Payment Links", () => {
  assert.match(stripePaymentLink("album-thats-the-time"), /^https:\/\/buy\.stripe\.com\//);
  assert.equal(stripePaymentLink("not-a-product"), "");
});

test("Stripe catalogue covers every item currently offered for sale", async () => {
  const products = JSON.parse(await readFile(new URL("../content/stripe-products.json", import.meta.url), "utf8"));
  const productIds = new Set(products.map((product) => product.id));
  const availablePaintings = artworks.filter((art) => art.availability === "available");

  assert.equal(products.filter((product) => product.id.startsWith("album-")).length, 4);
  assert.equal(products.filter((product) => product.id.startsWith("play-")).length, 5);
  assert.equal(products.filter((product) => product.id.startsWith("art-")).length, availablePaintings.length);

  for (const art of availablePaintings) {
    assert.ok(productIds.has(`art-${art.id}`), `${art.title} is missing from the Stripe catalogue`);
  }

  for (const art of artworks.filter((item) => item.availability !== "available")) {
    assert.ok(!productIds.has(`art-${art.id}`), `${art.title} must remain enquiry-only`);
  }

  assert.deepEqual(new Set(Object.keys(stripePaymentLinks)), productIds);
});
