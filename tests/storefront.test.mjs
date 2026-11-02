import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { albumPrice, coffeeTipLink, formatAud, playLinksCurrent, playPrice, stripePaymentLink } from "../lib/storefront.mjs";
import { artworks } from "../content/artworks.mjs";
import { stripePaymentLinks } from "../content/stripe-payment-links.mjs";

test("storefront prices match Allen's instructions", () => {
  assert.equal(albumPrice, 1000);
  assert.equal(playPrice, 1000);
  assert.equal(formatAud(albumPrice), "$10 AUD");
  assert.equal(formatAud(playPrice), "$10 AUD");
});

test("checkout accepts only configured Stripe Payment Links", () => {
  assert.match(stripePaymentLink("album-thats-the-time"), /^https:\/\/buy\.stripe\.com\//);
  assert.equal(stripePaymentLink("not-a-product"), "");
});

test("the A$10 play Payment Links are live, and none is an old A$50 link", () => {
  assert.equal(playLinksCurrent, true);
  const playIds = Object.keys(stripePaymentLinks).filter((key) => key.startsWith("play-"));
  assert.equal(playIds.length, 5);
  /* The A$50 links created on 2026-10-01, kept here so they never come back. */
  const oldA50 = [
    "https://buy.stripe.com/fZufZjbojao0f2o4A0fMA04",
    "https://buy.stripe.com/7sY4gB1NJ9jWf2o4A0fMA05",
    "https://buy.stripe.com/fZu3cxfEz3ZCbQcaYofMA06",
    "https://buy.stripe.com/3cIbJ3gID0Nq4nK9UkfMA07",
    "https://buy.stripe.com/3cI4gB8c7fIkaM8eaAfMA08",
  ];
  for (const id of playIds) {
    assert.match(stripePaymentLink(id), /^https:\/\/buy\.stripe\.com\//, id);
    assert.ok(!oldA50.includes(stripePaymentLink(id)), `${id} still uses the A$50 link`);
  }
});

test("the Stripe catalogue lists every play at A$10", async () => {
  const products = JSON.parse(await readFile(new URL("../content/stripe-products.json", import.meta.url), "utf8"));
  for (const play of products.filter((product) => product.id.startsWith("play-"))) {
    assert.equal(play.unitAmount, playPrice, play.id);
  }
});

test("the coffee link is a checked buy.stripe.com link, kept out of the catalogue", () => {
  assert.match(coffeeTipLink(), /^https:\/\/buy\.stripe\.com\//);
  assert.ok(!Object.values(stripePaymentLinks).includes(coffeeTipLink()));
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
