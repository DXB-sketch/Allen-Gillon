// JSON-LD (schema.org) builders for both hosts.
//
// Every function is pure: it takes plain data and returns a plain object, so it
// runs unchanged in Node tests, at build time and in the Cloudflare Worker.
// Render the result with jsonLdScript() / jsonLdProps() below.
//
// House rules (redesign plan W6 and DECISIONS):
// - Plays: A$10.00, sold by Allen Gillon. Albums: free (price 0). Everything
//   else that is not a painting: sold (or given away) by Allen Gillon.
// - Paintings: sold by Ann Gillon, A$100-250, free delivery in Australia,
//   no change-of-mind returns (ACL remedies still apply, see artwork()).
// - No ABN, no street address. Contact: support@allengillon.com.
// - Never emit Review, AggregateRating, FAQPage or any Event type.
// - Never invent an ISBN. Book() has no isbn field on purpose.
// - Main and other reference the same entities by @id (Allen lives on main,
//   Ann and Timeless live on other) and Allen's Person lists both hosts in sameAs.

import { SITES } from "./sites.mjs";
import legalConfig from "../content/legal.config.json" with { type: "json" };
import { playLinksCurrent } from "./storefront.mjs";

export const CONTEXT = "https://schema.org";
export const MAIN = SITES.main.origin;
export const OTHER = SITES.other.origin;
export const EMAIL = "support@allengillon.com";
export const CURRENCY = "AUD";

/** A$10 per play (lib/storefront.mjs playPrice = 1000 cents, per the DECISIONS). */
export const PLAY_PRICE_CENTS = 1000;

export const IDS = {
  mainWebsite: `${MAIN}/#website`,
  otherWebsite: `${OTHER}/#website`,
  allen: `${MAIN}/#allen-gillon`,
  ann: `${OTHER}/anns-art#ann-gillon`,
  timeless: `${OTHER}/biography#timeless`,
  booking: `${MAIN}/hire#booking`,
};

/** Types that must never appear in this site's structured data. */
export const FORBIDDEN_TYPES = ["Review", "AggregateRating", "FAQPage", "Event"];

const IN_STOCK = "https://schema.org/InStock";
const PRE_ORDER = "https://schema.org/PreOrder";

// Bribie Island, QLD. Locality only: Allen has no public street address.
const BRIBIE_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Bribie Island",
  addressRegion: "QLD",
  addressCountry: "AU",
};

const originFor = (site) => (site === "other" ? OTHER : MAIN);

/** Absolute URL for a path on a host. Absolute URLs pass through untouched. */
export function absoluteUrl(pathOrUrl, site = "main") {
  if (!pathOrUrl) return undefined;
  const value = String(pathOrUrl);
  if (/^https?:\/\//i.test(value)) return value;
  return `${originFor(site)}${value.startsWith("/") ? "" : "/"}${value}`;
}

const price = (cents) => (Math.round(Number(cents) || 0) / 100).toFixed(2);

const allenRef = (name = "Allen Gillon") => ({ "@type": "Person", "@id": IDS.allen, name });
const annRef = () => ({ "@type": "Person", "@id": IDS.ann, name: "Ann Gillon" });

const contactPoint = (contactType) => ({
  "@type": "ContactPoint",
  contactType,
  email: EMAIL,
  areaServed: "AU",
  availableLanguage: "en",
});

/** Drops undefined, null, empty-string and empty-array values (shallow). */
function clean(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  );
}

/** "2:26" or "1:02:03" to ISO 8601 "PT2M26S". Returns undefined when unparseable. */
export function isoDuration(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    const s = Math.round(value);
    return `PT${Math.floor(s / 60) ? `${Math.floor(s / 60)}M` : ""}${s % 60}S`;
  }
  const parts = String(value).split(":").map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n) || n < 0)) return undefined;
  const [h, m, s] = parts.length === 3 ? parts : parts.length === 2 ? [0, ...parts] : [0, 0, parts[0]];
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s}S`;
}

// ---------------------------------------------------------------------------
// Sites and people

/** WebSite for one host ("main" or "other"). */
export function websiteSchema(site = "main") {
  if (site === "other") {
    return {
      "@context": CONTEXT,
      "@type": "WebSite",
      "@id": IDS.otherWebsite,
      url: `${OTHER}/`,
      name: SITES.other.name,
      description: "Allen and Ann Gillon's creative side: stories and school plays, the Timeless story of Allen and Ann, and Ann Gillon's original paintings.",
      inLanguage: "en-AU",
      publisher: allenRef(),
      about: [allenRef(), annRef(), { "@type": "MusicGroup", "@id": IDS.timeless, name: "Timeless" }],
    };
  }
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": IDS.mainWebsite,
    url: `${MAIN}/`,
    name: SITES.main.name,
    description: "Allen Gillon, guitarist on Bribie Island: bookings around Moreton Bay, albums to play or download, plus original songs.",
    inLanguage: "en-AU",
    publisher: allenRef(),
    about: allenRef(),
  };
}

/** Allen Gillon. His canonical @id lives on the main host. */
export function personAllen() {
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": IDS.allen,
    name: "Allen Gillon",
    alternateName: "A. R. Gillon",
    url: `${MAIN}/`,
    image: `${MAIN}/images/personal/current-portrait-allen-2026.jpg`,
    jobTitle: "Guitarist",
    description: "Guitarist, playwright and author on Bribie Island, Queensland. Allen writes school plays, children's stories and classroom textbooks, and plays with Ann Gillon as Timeless.",
    email: EMAIL,
    contactPoint: contactPoint("bookings and enquiries"),
    address: BRIBIE_ADDRESS,
    memberOf: { "@type": "MusicGroup", "@id": IDS.timeless, name: "Timeless" },
    spouse: annRef(),
    // The same person is described on both hosts.
    sameAs: [`${OTHER}/`, `${OTHER}/biography`],
    subjectOf: [
      { "@type": "WebSite", "@id": IDS.mainWebsite },
      { "@type": "WebSite", "@id": IDS.otherWebsite },
    ],
  };
}

/** Ann Gillon. Her canonical @id lives on the other host (her art page). */
export function personAnn() {
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": IDS.ann,
    name: "Ann Gillon",
    url: `${OTHER}/anns-art`,
    jobTitle: "Painter and singer",
    description: "Stage and restaurant singer, pianist and painter on Bribie Island, Queensland. Ann sells her original paintings in Ann's Art Room.",
    email: EMAIL,
    contactPoint: contactPoint("painting enquiries"),
    address: BRIBIE_ADDRESS,
    memberOf: { "@type": "MusicGroup", "@id": IDS.timeless, name: "Timeless" },
    spouse: allenRef(),
    sameAs: ["https://www.facebook.com/artbyanngillon", `${OTHER}/biography`],
  };
}

/** Timeless, Ann and Allen's duet. Lives on the other host (/biography). */
export function timelessGroup() {
  return {
    "@context": CONTEXT,
    "@type": "MusicGroup",
    "@id": IDS.timeless,
    name: "Timeless",
    url: `${OTHER}/biography`,
    description: "Ann and Allen Gillon's duet. Allen plays his Trini Lopez Gibson; Ann sings lead and plays piano. They play for diners around Bribie Island.",
    genre: ["Jazz", "Easy listening"],
    member: [allenRef(), annRef()],
    email: EMAIL,
    location: { "@type": "Place", name: "Bribie Island", address: BRIBIE_ADDRESS },
    // Timeless is booked through Allen's bookings page on the main host
    // (bookingService() names Timeless as its brand by this @id).
  };
}

/** Live music bookings (/hire on main). Service area only, no street address. */
export function bookingService() {
  return {
    "@context": CONTEXT,
    "@type": "Service",
    "@id": IDS.booking,
    name: "Book Allen Gillon, guitarist",
    serviceType: "Live guitar music",
    description: "Allen Gillon plays weddings, anniversaries, club nights, restaurants and private parties around Bribie Island, Brisbane and the Sunshine Coast. Ann joins him as the duet Timeless.",
    url: `${MAIN}/hire`,
    provider: allenRef(),
    brand: { "@type": "MusicGroup", "@id": IDS.timeless, name: "Timeless" },
    areaServed: [
      { "@type": "Place", name: "Bribie Island, Queensland" },
      { "@type": "AdministrativeArea", name: "City of Moreton Bay, Queensland" },
      { "@type": "City", name: "Brisbane" },
      { "@type": "AdministrativeArea", name: "Sunshine Coast, Queensland" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${MAIN}/hire`,
      availableLanguage: "en",
    },
  };
}

// ---------------------------------------------------------------------------
// Albums, books, artworks

/**
 * MusicAlbum with MusicRecording tracks. Takes the album objects used on
 * /music: { id, title, meta?, cover, tracks: [{ src, name, time }] }.
 * Optional: byAnnAndAllen (defaults to true when meta mentions Ann), datePublished.
 * Albums are free, so the Offer price is 0.
 */
export function musicAlbum(album) {
  const url = `${MAIN}/music#${album.id}`;
  const id = `${MAIN}/music#album-${album.id}`;
  const duo = album.byAnnAndAllen ?? /\bAnn\b/.test(String(album.meta || ""));
  const byArtist = duo ? [allenRef(), annRef()] : allenRef();
  const tracks = (album.tracks || []).map((track, i) =>
    clean({
      "@type": "MusicRecording",
      name: track.name,
      position: i + 1,
      duration: isoDuration(track.time ?? track.duration),
      url: absoluteUrl(track.src, "main"),
      byArtist,
      inAlbum: { "@id": id },
    }),
  );
  return clean({
    "@context": CONTEXT,
    "@type": "MusicAlbum",
    "@id": id,
    name: album.title,
    url,
    image: absoluteUrl(album.cover, "main"),
    byArtist,
    datePublished: album.datePublished,
    albumProductionType: "https://schema.org/StudioAlbum",
    albumReleaseType: "https://schema.org/AlbumRelease",
    numTracks: tracks.length,
    track: tracks,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: price(0),
      priceCurrency: CURRENCY,
      availability: IN_STOCK,
      url,
      seller: allenRef(),
    },
    isPartOf: { "@id": IDS.mainWebsite },
  });
}

const BOOK_KINDS = {
  plays: {
    genre: "School play",
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Primary school performers and their teachers",
      suggestedMinAge: 10,
      suggestedMaxAge: 13,
    },
    priceCents: PLAY_PRICE_CENTS,
    free: false,
  },
  childrens: {
    genre: "Children's story",
    audience: { "@type": "PeopleAudience", audienceType: "Young readers, parents and teachers" },
    priceCents: 0,
    free: true,
  },
  teaching: {
    genre: "Textbook",
    audience: { "@type": "EducationalAudience", educationalRole: "teacher", audienceType: "Classroom teachers" },
    priceCents: 0,
    free: true,
  },
};

/**
 * Book for a play, a Chinese Chimes story or a textbook (a books.config.json /
 * manifest entry). Fields used: slug, title, section ("plays" | "childrens" |
 * "teaching"), author, blurb, pageCount, cover, audio, downloadUrl,
 * availability. `audio` is a path or { src, name?, duration?, preview? }.
 * Plays: A$10.00 from Allen, preview only online. Stories and textbooks: free.
 */
export function book(bookMeta) {
  const kind = BOOK_KINDS[bookMeta.section] || BOOK_KINDS.childrens;
  const url = `${OTHER}/read/${bookMeta.slug}`;
  const id = `${url}#book`;
  const isPlay = bookMeta.section === "plays";
  const audioInput = typeof bookMeta.audio === "string" ? { src: bookMeta.audio } : bookMeta.audio;
  const preview = audioInput && (audioInput.preview ?? isPlay);
  const audio = audioInput?.src
    ? clean({
        "@type": "AudioObject",
        name: audioInput.name || (preview ? `${bookMeta.title}, recording preview` : `${bookMeta.title}, audiobook`),
        contentUrl: absoluteUrl(audioInput.src, "other"),
        encodingFormat: "audio/mpeg",
        duration: isoDuration(audioInput.duration),
        description: preview ? "A short preview of the recording." : undefined,
      })
    : undefined;
  const download =
    kind.free && bookMeta.downloadUrl
      ? { "@type": "MediaObject", contentUrl: absoluteUrl(bookMeta.downloadUrl, "other"), encodingFormat: "application/pdf" }
      : undefined;
  return clean({
    "@context": CONTEXT,
    "@type": "Book",
    "@id": id,
    name: bookMeta.title,
    url,
    description: bookMeta.blurb,
    author: allenRef(bookMeta.author || "Allen Gillon"),
    image: absoluteUrl(bookMeta.cover, "other"),
    genre: kind.genre,
    bookFormat: "https://schema.org/EBook",
    numberOfPages: Number.isInteger(bookMeta.pageCount) ? bookMeta.pageCount : undefined,
    inLanguage: "en",
    audience: kind.audience,
    learningResourceType: bookMeta.section === "teaching" ? "Textbook" : undefined,
    educationalUse: bookMeta.section === "teaching" ? "Classroom activities" : undefined,
    isAccessibleForFree: kind.free,
    audio,
    encoding: download,
    offers: {
      "@type": "Offer",
      price: price(kind.priceCents),
      priceCurrency: CURRENCY,
      // Plays cannot be bought until the A$10 Payment Links exist
      // (lib/storefront.mjs playLinksCurrent), so the offer says PreOrder.
      availability: bookMeta.availability || (isPlay && !playLinksCurrent ? PRE_ORDER : IN_STOCK),
      url,
      seller: allenRef(),
    },
    isPartOf: { "@id": IDS.otherWebsite },
  });
}

/**
 * One of Ann's paintings (content/artworks.mjs entry).
 * Available works are VisualArtwork + Product with an Offer sold by Ann Gillon,
 * free Australian delivery and a return policy. Enquiry-only works (sold,
 * commissioned, not for sale) are VisualArtwork only, with no Offer.
 */
export function artwork(art) {
  const url = `${OTHER}/anns-art/${art.id}`;
  const forSale = art.availability === "available" && Number(art.priceCents) > 0;
  const images = (art.images || []).map((img) => absoluteUrl(img.src, "other"));
  const node = clean({
    "@context": CONTEXT,
    "@type": forSale ? ["VisualArtwork", "Product"] : "VisualArtwork",
    "@id": `${url}#artwork`,
    name: art.title,
    url,
    image: images,
    description: art.note || `${art.title}, an original painting by Ann Gillon.`,
    artform: "Painting",
    artMedium: art.medium,
    creator: annRef(),
    isPartOf: { "@id": IDS.otherWebsite },
  });
  if (!forSale) return node;
  return {
    ...node,
    sku: art.id,
    category: "Original paintings",
    offers: {
      "@type": "Offer",
      price: price(art.priceCents),
      priceCurrency: art.currency || CURRENCY,
      availability: IN_STOCK,
      itemCondition: "https://schema.org/NewCondition",
      url,
      seller: annRef(),
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: CURRENCY },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "AU" },
      },
      // No change-of-mind returns. This is NOT a "no refunds" statement: under
      // the Australian Consumer Law, Ann still repairs, replaces or refunds when
      // a painting is damaged or destroyed in transit, faulty, or not as
      // described. schema.org has no category for "statutory remedies only", so
      // MerchantReturnNotPermitted describes the voluntary (change-of-mind)
      // policy and merchantReturnLink points to the terms that state the ACL
      // guarantee in full.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "AU",
        returnPolicyCountry: "AU",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        // Only once /terms is live (W7 flips content/legal.config.json), so
        // the link never points at a 404.
        ...(legalConfig.published ? { merchantReturnLink: `${MAIN}/terms` } : {}),
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Pages and navigation

/**
 * CollectionPage with an ItemList. `items` are { url, name, image? } (paths
 * are made absolute on `page.site`); nodes from book()/artwork()/musicAlbum()
 * work too. `page` is { url, name, description?, site? }.
 */
export function collectionPage(items, page = {}) {
  const site = page.site === "other" ? "other" : "main";
  const pageUrl = absoluteUrl(page.url || "/", site);
  return clean({
    "@context": CONTEXT,
    "@type": "CollectionPage",
    "@id": `${pageUrl}#page`,
    url: pageUrl,
    name: page.name,
    description: page.description,
    inLanguage: "en-AU",
    isPartOf: { "@id": site === "other" ? IDS.otherWebsite : IDS.mainWebsite },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) =>
        clean({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(item.url, site),
          name: item.name,
          image: Array.isArray(item.image) ? item.image[0] : absoluteUrl(item.image, site),
        }),
      ),
    },
  });
}

/** BreadcrumbList from [{ name, url }]. The last crumb may omit url. */
export function breadcrumbs(list, site = "main") {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: list.map((crumb, i) =>
      clean({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.url, site),
      }),
    ),
  };
}

/**
 * VideoObject, only when the upload date is known. Returns null otherwise
 * (and when name or thumbnail is missing, which search engines require).
 * v: { name, description?, thumbnailUrl, uploadDate, contentUrl?, embedUrl?, duration?, site? }
 */
export function videoObject(v) {
  if (!v || !v.name || !v.thumbnailUrl) return null;
  const date = String(v.uploadDate || "");
  if (!/^\d{4}-\d{2}-\d{2}/.test(date) || Number.isNaN(Date.parse(date))) return null;
  const site = v.site === "other" ? "other" : "main";
  return clean({
    "@context": CONTEXT,
    "@type": "VideoObject",
    name: v.name,
    description: v.description || v.name,
    thumbnailUrl: absoluteUrl(v.thumbnailUrl, site),
    uploadDate: date,
    contentUrl: absoluteUrl(v.contentUrl, site),
    embedUrl: v.embedUrl,
    duration: isoDuration(v.duration),
  });
}

/** The site-wide graph for a host's layout. */
export function siteGraph(site = "main") {
  return site === "other"
    ? [websiteSchema("other"), personAllen(), personAnn(), timelessGroup()]
    : [websiteSchema("main"), personAllen(), bookingService()];
}

// ---------------------------------------------------------------------------
// Serialisation

/**
 * JSON for a <script type="application/ld+json"> body. An array (nulls are
 * dropped) becomes one { "@context", "@graph" } document. Characters that
 * could end the script element or break a JS parser are escaped, so "</script>"
 * inside a title can never close the tag.
 */
// U+2028 / U+2029 are legal in JSON but end a line in older JS parsers.
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function jsonLdScript(obj) {
  let doc = obj;
  if (Array.isArray(obj)) {
    doc = {
      "@context": CONTEXT,
      "@graph": obj.filter(Boolean).map(({ "@context": _drop, ...rest }) => rest),
    };
  }
  return JSON.stringify(doc)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

/** Props for a React <script>: <script {...jsonLdProps(data)} /> */
export function jsonLdProps(obj) {
  return { type: "application/ld+json", dangerouslySetInnerHTML: { __html: jsonLdScript(obj) } };
}
