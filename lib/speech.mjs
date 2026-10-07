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

/* The page reader only ever speaks in a woman's voice. Browsers give no
   gender for a speechSynthesis voice, so it is read from the voice's name:
   the Apple (Siri-family), Microsoft and Google English voices below.

   readerVoices(voices) -> the English voices the listener may choose from:
     1. the known women's voices, best first;
     2. if the device has none of those, every English voice that is not a
        known man's voice;
     3. if that is empty too, [] (the reader then leaves the voice unset and
        the device speaks with its default). */
const FEMALE = new RegExp(
  "\\b(" +
    [
      // Apple (macOS, iOS, iPadOS)
      "samantha", "karen", "catherine", "moira", "tessa", "fiona", "serena", "kate", "victoria",
      "allison", "ava", "susan", "zoe", "nicky", "veena", "kathy", "vicki", "agnes", "isha",
      "sandy", "shelley", "flo", "grandma", "martha", "stephanie", "princess", "siri female",
      // Microsoft (Windows, Edge)
      "zira", "hazel", "natasha", "annette", "carly", "elsie", "freya", "joanne", "kim", "tina",
      "jenny", "aria", "michelle", "sara", "sonia", "libby", "clara", "emily", "molly", "maisie",
      "abbi", "bella", "hollie", "olivia", "ana", "ashley", "cora", "elizabeth", "jane", "nancy",
      "amber", "emma", "heera", "neerja", "leah", "luna", "rosa", "imani", "asilia", "ezinne",
      "linda", "heather", "hayley", "yan", "mia",
      // Generic labels (Google "UK English Female", eSpeak "+f" variants)
      "female", "woman",
    ].join("|") +
    ")\\b",
  "i"
);
/* Google's plain "Google US English" voice is a woman's voice. */
const FEMALE_EXACT = /^google (us english|español|english)$/i;
const MALE = new RegExp(
  "\\b(" +
    [
      "male", "man", "daniel", "alex", "fred", "gordon", "lee", "oliver", "rishi", "tom", "aaron",
      "arthur", "evan", "nathan", "reed", "rocko", "grandpa", "eddy", "albert", "bruce", "ralph",
      "junior", "jamie", "david", "mark", "george", "james", "ryan", "guy", "william", "liam",
      "thomas", "christopher", "eric", "roger", "steffan", "brian", "andrew", "ken", "darren",
      "duncan", "neil", "connor", "prabhat", "mitchell", "ravi", "chilemba", "elliot", "noah",
      "ethan", "alfie", "oscar", "kenneth", "jason", "tony", "davis", "brandon", "christian",
      "steve", "paul", "richard", "sean", "luke", "abeo", "wayne",
    ].join("|") +
    ")\\b",
  "i"
);

export function isFemaleVoice(voice) {
  const name = String(voice?.name || "");
  if (/\bmale\b/i.test(name) && !/\bfemale\b/i.test(name)) return false;
  return FEMALE_EXACT.test(name.trim()) || FEMALE.test(name);
}

export function isMaleVoice(voice) {
  const name = String(voice?.name || "");
  return !isFemaleVoice(voice) && MALE.test(name);
}

function voiceQuality(voice) {
  const name = String(voice?.name || "");
  return (
    (/natural|neural|enhanced|premium|online|siri/i.test(name) ? 10 : 0) +
    (/en[-_]AU/i.test(String(voice?.lang || "")) ? 3 : 0) +
    (/google|microsoft|apple/i.test(name) ? 1 : 0)
  );
}

export function readerVoices(voices) {
  const english = (voices || []).filter((voice) => String(voice?.lang || "").toLowerCase().startsWith("en"));
  const women = english.filter(isFemaleVoice);
  const pool = women.length ? women : english.filter((voice) => !isMaleVoice(voice));
  return [...pool].sort((a, b) => voiceQuality(b) - voiceQuality(a));
}
