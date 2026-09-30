/* Text clean-up for the page reader (speechSynthesis). Visible text and
   formatAud stay as they are; only the words handed to the voice change.

   normaliseForSpeech("$50 AUD")        -> "50 Australian dollars"
   normaliseForSpeech("A$100-250")      -> "100 to 250 Australian dollars"
   normaliseForSpeech("1968–1972")      -> "1968 to 1972"
   normaliseForSpeech("Oil · framed")   -> "Oil, framed"
   normaliseForSpeech("Ann & Allen")    -> "Ann and Allen" */

const DASH = "[-‐‑‒–—−]";
/* An amount: "1,250.50" or "50". A comma counts only before three digits, so
   the comma in "$50, $60" stays a pause. */
const NUM = "\\d{1,3}(?:,\\d{3})+(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?";
/* Currency prefix: "AUD $", "AUD$", "A$", "AU$" or a bare "$". A "$" straight
   after other letters ("US$", "NZ$") is another currency and is left alone. */
const PREFIX = "(?:\\bAUD\\s*\\$|\\bAU?\\$|(?<![A-Za-z])\\$)";
/* Optional "AUD" after the amount. */
const SUFFIX = "(?:\\s*AUD\\b)?";

function amountWords(raw) {
  const clean = raw.replace(/,/g, "");
  const [dollarsText, centsText] = clean.split(".");
  const dollars = Number(dollarsText);
  const cents = centsText ? Number(centsText.padEnd(2, "0")) : 0;
  if (!cents) return { number: String(dollars), dollars, cents: 0 };
  return { number: String(dollars), dollars, cents };
}

function spokenPrice(raw) {
  const { number, dollars, cents } = amountWords(raw);
  const centWords = cents ? `${cents} ${cents === 1 ? "cent" : "cents"}` : "";
  if (!dollars && cents) return centWords;
  const dollarWords = `${number} Australian ${dollars === 1 ? "dollar" : "dollars"}`;
  return cents ? `${dollarWords} and ${centWords}` : dollarWords;
}

function spokenRange(low, high) {
  const lowNumber = low.replace(/,/g, "");
  const highNumber = high.replace(/,/g, "");
  return `${lowNumber} to ${highNumber} Australian dollars`;
}

const rangePattern = new RegExp(
  `${PREFIX}\\s*(${NUM})${SUFFIX}\\s*${DASH}\\s*(?:${PREFIX}\\s*)?(${NUM})${SUFFIX}`,
  "g"
);
const pricePattern = new RegExp(`${PREFIX}\\s*(${NUM})${SUFFIX}`, "g");
const numberRangePattern = new RegExp(`(\\d)\\s*${DASH}\\s*(?=\\d)`, "g");

export function normaliseForSpeech(text) {
  if (typeof text !== "string" || !text) return "";
  return text
    .replace(rangePattern, (_, low, high) => spokenRange(low, high))
    .replace(pricePattern, (_, amount) => spokenPrice(amount))
    .replace(numberRangePattern, "$1 to ")
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const ACCENTS = {
  "en-au": "Australian",
  "en-gb": "British",
  "en-us": "American",
  "en-nz": "New Zealand",
  "en-ie": "Irish",
  "en-in": "Indian",
  "en-za": "South African",
  "en-ca": "Canadian",
  "en-sg": "Singaporean",
  "en-ph": "Filipino",
  "en-hk": "Hong Kong",
  "en-ke": "Kenyan",
  "en-ng": "Nigerian",
  "en-tz": "Tanzanian",
};

/* A short, friendly name for a speechSynthesis voice, e.g.
   "Microsoft Natasha Online (Natural) - English (Australia)" -> "Natasha, Australian"
   "Google UK English Female" -> "Female voice, British" */
export function friendlyVoiceLabel(voice) {
  const lang = String(voice?.lang || "").replace("_", "-").toLowerCase();
  const accent = ACCENTS[lang] || (lang.startsWith("en") ? "English" : "");
  let name = String(voice?.name || "")
    .replace(/\s+-\s+.*$/, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(Microsoft|Google|Apple|Online|Natural|Neural|Enhanced|Premium|Desktop|Compact)\b/gi, "")
    .replace(/\b(UK|US|AU|English|United States|United Kingdom|Australia)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (/^(male|female)$/i.test(name)) name = `${name[0].toUpperCase()}${name.slice(1).toLowerCase()} voice`;
  if (!name) name = "Standard voice";
  return accent ? `${name}, ${accent}` : name;
}
