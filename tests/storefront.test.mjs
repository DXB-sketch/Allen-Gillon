import assert from "node:assert/strict";
import test from "node:test";
import { albumPrice, formatAud, playPrice, stripePaymentLink } from "../lib/storefront.mjs";

test("storefront prices match Allen's instructions", () => {
  assert.equal(albumPrice, 1000);
  assert.equal(playPrice, 5000);
  assert.equal(formatAud(albumPrice), "$10 AUD");
  assert.equal(formatAud(playPrice), "$50 AUD");
});

test("checkout stays closed when no Stripe Payment Link exists", () => {
  assert.equal(stripePaymentLink("album-thats-the-time"), "");
});
