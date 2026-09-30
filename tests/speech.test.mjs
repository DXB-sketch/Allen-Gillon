import assert from "node:assert/strict";
import test from "node:test";
import { friendlyVoiceLabel, normaliseForSpeech } from "../lib/speech.mjs";
import { formatAud } from "../lib/storefront.mjs";
import { formatPrice } from "../lib/art-catalog.mjs";

test("single prices are spoken as Australian dollars", () => {
  assert.equal(normaliseForSpeech("$50 AUD"), "50 Australian dollars");
  assert.equal(normaliseForSpeech("A$50"), "50 Australian dollars");
  assert.equal(normaliseForSpeech("AUD $50"), "50 Australian dollars");
  assert.equal(normaliseForSpeech("AUD$50"), "50 Australian dollars");
  assert.equal(normaliseForSpeech("$1"), "1 Australian dollar");
  assert.equal(normaliseForSpeech("Guide price: A$1,250"), "Guide price: 1250 Australian dollars");
});

test("price ranges are spoken with 'to'", () => {
  assert.equal(normaliseForSpeech("$100–$250"), "100 to 250 Australian dollars");
  assert.equal(normaliseForSpeech("A$100-250"), "100 to 250 Australian dollars");
  assert.equal(normaliseForSpeech("AUD $100–$250"), "100 to 250 Australian dollars");
  assert.equal(normaliseForSpeech("A$100 - A$250"), "100 to 250 Australian dollars");
});

test("cents are spoken", () => {
  assert.equal(normaliseForSpeech("$12.50"), "12 Australian dollars and 50 cents");
  assert.equal(normaliseForSpeech("A$0.99"), "99 cents");
  assert.equal(normaliseForSpeech("$3.5 AUD"), "3 Australian dollars and 50 cents");
  assert.equal(normaliseForSpeech("$2.00"), "2 Australian dollars");
});

test("dashes between numbers, middle dots and ampersands", () => {
  assert.equal(normaliseForSpeech("1968–1972"), "1968 to 1972");
  assert.equal(normaliseForSpeech("pages 3-6"), "pages 3 to 6");
  assert.equal(normaliseForSpeech("Oil on canvas · 40 × 50 cm"), "Oil on canvas, 40 × 50 cm");
  assert.equal(normaliseForSpeech("Ann & Allen Gillon"), "Ann and Allen Gillon");
  assert.equal(normaliseForSpeech("Hi-Doh and Low-Doh"), "Hi-Doh and Low-Doh");
});

test("real site strings", () => {
  assert.equal(
    normaliseForSpeech("Original paintings · AUD $100–$250 · Free delivery in Australia"),
    "Original paintings, 100 to 250 Australian dollars, Free delivery in Australia"
  );
  assert.equal(
    normaliseForSpeech(`Each script costs ${formatAud(5000)} as a PDF.`),
    "Each script costs 50 Australian dollars as a PDF."
  );
  assert.equal(normaliseForSpeech(`Guide price: ${formatPrice(25000)}`), "Guide price: 250 Australian dollars");
  assert.equal(normaliseForSpeech("Text Allen on 0438 747 882"), "Text Allen on 0438 747 882");
});

test("a comma after a price stays a pause, and other currencies are left alone", () => {
  assert.equal(
    normaliseForSpeech("Tickets $50, $60 at the door"),
    "Tickets 50 Australian dollars, 60 Australian dollars at the door"
  );
  assert.equal(normaliseForSpeech("A$1,250.50"), "1250 Australian dollars and 50 cents");
  assert.equal(normaliseForSpeech("$1,000-2,000"), "1000 to 2000 Australian dollars");
  assert.equal(normaliseForSpeech("US$20"), "US$20");
  assert.equal(normaliseForSpeech("NZ$20"), "NZ$20");
});

test("empty input", () => {
  assert.equal(normaliseForSpeech(""), "");
  assert.equal(normaliseForSpeech(undefined), "");
});

test("friendly voice labels", () => {
  assert.equal(
    friendlyVoiceLabel({ name: "Microsoft Natasha Online (Natural) - English (Australia)", lang: "en-AU" }),
    "Natasha, Australian"
  );
  assert.equal(friendlyVoiceLabel({ name: "Google UK English Female", lang: "en-GB" }), "Female voice, British");
  assert.equal(friendlyVoiceLabel({ name: "Google US English", lang: "en-US" }), "Standard voice, American");
  assert.equal(friendlyVoiceLabel({ name: "Karen", lang: "en-AU" }), "Karen, Australian");
  assert.equal(friendlyVoiceLabel({ name: "Microsoft David - English (United States)", lang: "en-US" }), "David, American");
});
