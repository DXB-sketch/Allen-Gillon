import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import legalConfig from "../content/legal.config.json" with { type: "json" };
import {
  EMAIL,
  FORBIDDEN_TYPES,
  IDS,
  MAIN,
  OTHER,
  artwork,
  book,
  bookingService,
  breadcrumbs,
  collectionPage,
  isoDuration,
  jsonLdProps,
  jsonLdScript,
  musicAlbum,
  personAllen,
  personAnn,
  siteGraph,
  timelessGroup,
  videoObject,
  websiteSchema,
} from "../lib/schema.mjs";
import { artworks } from "../content/artworks.mjs";
import { playLinksCurrent } from "../lib/storefront.mjs";

const booksConfig = JSON.parse(await readFile(new URL("../content/books.config.json", import.meta.url), "utf8"));

const album = {
  id: "thats-the-time",
  title: "That's The Time",
  meta: "Allen Gillon Guitarist · 12 tracks",
  cover: "/images/albums/album-thats-the-time.jpg",
  tracks: [
    { src: "/audio/thats-the-time/01-that-s-the-time.mp3", name: "That's The Time", time: "2:26" },
    { src: "/audio/thats-the-time/02-you-don-t-know-me.mp3", name: "You Don't Know Me", time: "3:53" },
  ],
};
const misty = { id: "misty", title: "Misty", meta: "Ann & Allen Gillon · 8 tracks", cover: "/images/personal/album-misty-PHOTO-of-ann.jpg", tracks: [] };

const bySlug = Object.fromEntries(booksConfig.map((b) => [b.slug, b]));
const playNode = book({ ...bySlug["melting-pot"], pageCount: 47, cover: "/books/melting-pot/p001.webp", audio: "/audio/school-play-previews/melting-pot.mp3" });
const storyNode = book({ ...bySlug["little-ray"], pageCount: 19, cover: "/books/little-ray/p001.webp", audio: { src: "/audio/chinese-chimes-audiobooks/little-ray.mp3", duration: "6:10" } });
const textbookNode = book({ ...bySlug["riddled-with-language"], downloadUrl: "/books/riddled-with-language/riddled-with-language.pdf" });

const forSale = artworks.find((a) => a.availability === "available");
const enquiry = artworks.find((a) => a.availability !== "available");

/** Every node the site can emit, for the deep scans. */
function everything() {
  return [
    websiteSchema("main"),
    websiteSchema("other"),
    personAllen(),
    personAnn(),
    timelessGroup(),
    bookingService(),
    musicAlbum(album),
    musicAlbum(misty),
    ...booksConfig.map((b) => book(b)),
    playNode,
    storyNode,
    textbookNode,
    ...artworks.map(artwork),
    collectionPage([{ url: "/anns-art/x", name: "X", image: "/images/x.webp" }], { url: "/anns-art", name: "Ann Gillon", site: "other" }),
    breadcrumbs([{ name: "Stories", url: "/books" }, { name: "Little Ray" }], "other"),
    videoObject({ name: "Masquerade", thumbnailUrl: "/images/x.jpg", uploadDate: "2024-05-01", contentUrl: "/videos/timeless-masquerade.mp4" }),
  ].filter(Boolean);
}

function walk(value, visit, path = "$") {
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, visit, `${path}[${i}]`));
  else if (value && typeof value === "object") {
    visit(value, path);
    for (const [k, v] of Object.entries(value)) walk(v, visit, `${path}.${k}`);
  }
}

const typesOf = (node) => [].concat(node["@type"] || []);

test("websiteSchema: one WebSite per host with the right names", () => {
  const main = websiteSchema("main");
  const other = websiteSchema("other");
  assert.equal(main["@type"], "WebSite");
  assert.equal(main["@id"], IDS.mainWebsite);
  assert.equal(main.url, `${MAIN}/`);
  assert.equal(main.name, "Allen Gillon");
  assert.equal(other["@id"], IDS.otherWebsite);
  assert.equal(other.url, `${OTHER}/`);
  assert.equal(other.name, "More on Allen");
  assert.equal(main.inLanguage, "en-AU");
  assert.equal(main.publisher["@id"], IDS.allen);
  assert.equal(other.publisher["@id"], IDS.allen);
});

test("personAllen and personAnn: contact email, locality only, cross-host sameAs", () => {
  const allen = personAllen();
  const ann = personAnn();
  for (const p of [allen, ann]) {
    assert.equal(p["@type"], "Person");
    assert.equal(p.email, EMAIL);
    assert.equal(p.contactPoint.email, EMAIL);
    assert.equal(p.address.addressLocality, "Bribie Island");
    assert.equal(p.address.addressRegion, "QLD");
    assert.equal(p.address.addressCountry, "AU");
    assert.equal(p.address.streetAddress, undefined, "no street address");
    assert.equal(p.memberOf["@id"], IDS.timeless);
  }
  assert.equal(allen.name, "Allen Gillon");
  assert.ok(allen["@id"].startsWith(MAIN));
  assert.ok(allen.sameAs.some((u) => u.startsWith(OTHER)), "Allen's sameAs points at the other host");
  assert.deepEqual(allen.subjectOf.map((s) => s["@id"]).sort(), [IDS.mainWebsite, IDS.otherWebsite].sort());
  assert.equal(ann.name, "Ann Gillon");
  assert.ok(ann["@id"].startsWith(OTHER));
  assert.ok(ann.sameAs.includes("https://www.facebook.com/artbyanngillon"));
  assert.equal(allen.spouse["@id"], IDS.ann);
  assert.equal(ann.spouse["@id"], IDS.allen);
});

test("timelessGroup: MusicGroup with Allen and Ann as members", () => {
  const t = timelessGroup();
  assert.equal(t["@type"], "MusicGroup");
  assert.equal(t["@id"], IDS.timeless);
  assert.deepEqual(t.member.map((m) => m["@id"]), [IDS.allen, IDS.ann]);
  assert.equal(t.email, EMAIL);
});

test("bookingService: Service with areaServed and no street address", () => {
  const s = bookingService();
  assert.equal(s["@type"], "Service");
  assert.equal(s.url, `${MAIN}/hire`);
  assert.equal(s.provider["@id"], IDS.allen);
  assert.ok(Array.isArray(s.areaServed) && s.areaServed.length >= 3);
  assert.ok(s.areaServed.some((a) => /Bribie Island/.test(a.name)));
  assert.ok(s.areaServed.some((a) => /Moreton Bay/.test(a.name)));
  assert.equal(JSON.stringify(s).includes("streetAddress"), false);
  assert.equal(s.offers, undefined, "no invented prices for bookings");
});

test("musicAlbum: MusicRecording tracks and a free Offer from Allen", () => {
  const a = musicAlbum(album);
  assert.equal(a["@type"], "MusicAlbum");
  assert.equal(a.name, "That's The Time");
  assert.equal(a.image, `${MAIN}/images/albums/album-thats-the-time.jpg`);
  assert.equal(a.numTracks, 2);
  assert.equal(a.track[0]["@type"], "MusicRecording");
  assert.equal(a.track[0].duration, "PT2M26S");
  assert.equal(a.track[0].url, `${MAIN}/audio/thats-the-time/01-that-s-the-time.mp3`);
  assert.equal(a.track[1].position, 2);
  assert.equal(a.track[0].inAlbum["@id"], a["@id"]);
  assert.equal(Number(a.offers.price), 0);
  assert.equal(a.offers.priceCurrency, "AUD");
  assert.equal(a.offers.seller["@id"], IDS.allen);
  assert.equal(a.byArtist["@id"], IDS.allen);
  const m = musicAlbum(misty);
  assert.deepEqual(m.byArtist.map((p) => p["@id"]), [IDS.allen, IDS.ann], "Misty is Ann and Allen");
});

test("book: plays cost A$1.00 from Allen, preview audio, teacher audience", () => {
  assert.equal(playNode["@type"], "Book");
  assert.equal(playNode.url, `${OTHER}/read/melting-pot`);
  assert.equal(playNode.offers.price, "1.00");
  assert.equal(playNode.offers.priceCurrency, "AUD");
  assert.equal(playNode.offers.seller["@id"], IDS.allen);
  assert.equal(playNode.offers.seller.name, "Allen Gillon");
  assert.equal(
    playNode.offers.availability,
    playLinksCurrent ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    "no in-stock claim while the A$1 play links are not live",
  );
  assert.equal(playNode.isAccessibleForFree, false);
  assert.equal(playNode.audience.suggestedMinAge, 10);
  assert.equal(playNode.audience.suggestedMaxAge, 13);
  assert.equal(playNode.audio["@type"], "AudioObject");
  assert.match(playNode.audio.name, /preview/);
  assert.equal(playNode.audio.contentUrl, `${OTHER}/audio/school-play-previews/melting-pot.mp3`);
  assert.equal(playNode.image, `${OTHER}/books/melting-pot/p001.webp`);
  assert.equal(playNode.numberOfPages, 47);
  assert.equal(playNode.encoding, undefined, "no download link for paid plays");
});

test("book: stories and textbooks are free, with audiobook or PDF download", () => {
  assert.equal(Number(storyNode.offers.price), 0);
  assert.equal(storyNode.offers.seller["@id"], IDS.allen);
  assert.equal(storyNode.isAccessibleForFree, true);
  assert.equal(storyNode.audio["@type"], "AudioObject");
  assert.equal(storyNode.audio.duration, "PT6M10S");
  assert.match(storyNode.audio.name, /audiobook/);
  assert.equal(storyNode.audience["@type"], "PeopleAudience");

  assert.equal(Number(textbookNode.offers.price), 0);
  assert.equal(textbookNode.author.name, "A. R. Gillon");
  assert.equal(textbookNode.author["@id"], IDS.allen);
  assert.equal(textbookNode.audience["@type"], "EducationalAudience");
  assert.equal(textbookNode.audience.educationalRole, "teacher");
  assert.equal(textbookNode.encoding.encodingFormat, "application/pdf");
  assert.equal(textbookNode.audio, undefined, "no AudioObject without audio");

  for (const slug of ["practice-in-communication-book-1", "practice-in-communication-book-2", "riddled-with-language"]) {
    const node = book(bySlug[slug]);
    assert.equal(node.genre, "Textbook");
    assert.equal(node.isAccessibleForFree, true);
  }
});

test("book: never an ISBN", () => {
  for (const b of booksConfig) {
    const node = book({ ...b, isbn: "978-0-00-000000-0" });
    walk(node, (obj) => assert.equal("isbn" in obj, false));
  }
});

test("artwork: VisualArtwork + Product sold by Ann, free AU shipping, no change-of-mind returns", () => {
  const a = artwork(forSale);
  assert.deepEqual(a["@type"], ["VisualArtwork", "Product"]);
  assert.equal(a.url, `${OTHER}/anns-art/${forSale.id}`);
  assert.equal(a.creator["@id"], IDS.ann);
  assert.equal(a.artform, "Painting");
  assert.ok(a.image.every((u) => u.startsWith(`${OTHER}/images/art/`)));
  assert.equal(a.offers["@type"], "Offer");
  assert.equal(a.offers.price, (forSale.priceCents / 100).toFixed(2));
  assert.equal(a.offers.priceCurrency, "AUD");
  assert.equal(a.offers.seller["@id"], IDS.ann);
  assert.equal(a.offers.seller.name, "Ann Gillon");
  const ship = a.offers.shippingDetails;
  assert.equal(ship["@type"], "OfferShippingDetails");
  assert.equal(ship.shippingRate.value, 0);
  assert.equal(ship.shippingRate.currency, "AUD");
  assert.equal(ship.shippingDestination.addressCountry, "AU");
  const ret = a.offers.hasMerchantReturnPolicy;
  assert.equal(ret["@type"], "MerchantReturnPolicy");
  assert.equal(ret.returnPolicyCategory, "https://schema.org/MerchantReturnNotPermitted");
  assert.equal(ret.applicableCountry, "AU");
  assert.equal(ret.returnPolicyCountry, "AU");
  // The terms link waits for the legal pages (content/legal.config.json).
  assert.equal(ret.merchantReturnLink, legalConfig.published ? `${MAIN}/terms` : undefined);

  for (const art of artworks.filter((x) => x.availability === "available")) {
    const node = artwork(art);
    const cents = Number(node.offers.price) * 100;
    assert.ok(cents >= 10000 && cents <= 25000, `${art.id} priced A$100-250`);
    assert.equal(node.offers.seller["@id"], IDS.ann);
  }
});

test("artwork: enquiry-only works have no Offer", () => {
  const a = artwork(enquiry);
  assert.equal(a["@type"], "VisualArtwork");
  assert.equal(a.offers, undefined);
});

test("collectionPage: ItemList with absolute URLs", () => {
  const items = artworks.slice(0, 3).map((art) => ({ url: `/anns-art/${art.id}`, name: art.title, image: art.images[0].src }));
  const page = collectionPage(items, { url: "/anns-art", name: "Ann Gillon's art", site: "other" });
  assert.equal(page["@type"], "CollectionPage");
  assert.equal(page.url, `${OTHER}/anns-art`);
  assert.equal(page.isPartOf["@id"], IDS.otherWebsite);
  assert.equal(page.mainEntity["@type"], "ItemList");
  assert.equal(page.mainEntity.numberOfItems, 3);
  assert.equal(page.mainEntity.itemListElement[0].position, 1);
  assert.equal(page.mainEntity.itemListElement[2].url, `${OTHER}/anns-art/${artworks[2].id}`);
  assert.ok(page.mainEntity.itemListElement[0].image.startsWith(OTHER));
  // Nodes from the other builders work as items too.
  const fromNodes = collectionPage([musicAlbum(album)], { url: "/music", name: "Albums" });
  assert.equal(fromNodes.mainEntity.itemListElement[0].url, `${MAIN}/music#thats-the-time`);
});

test("breadcrumbs: positions and absolute items, last crumb may omit url", () => {
  const b = breadcrumbs([{ name: "More on Allen", url: "/" }, { name: "Stories", url: "/books" }, { name: "Little Ray" }], "other");
  assert.equal(b["@type"], "BreadcrumbList");
  assert.deepEqual(b.itemListElement.map((i) => i.position), [1, 2, 3]);
  assert.equal(b.itemListElement[1].item, `${OTHER}/books`);
  assert.equal(b.itemListElement[2].item, undefined);
});

test("videoObject: only with a known upload date", () => {
  const base = { name: "Unforgettable", thumbnailUrl: "/images/personal/duo-live-on-stage.jpg", contentUrl: "/videos/timeless-unforgettable.mp4", site: "other" };
  assert.equal(videoObject(base), null);
  assert.equal(videoObject({ ...base, uploadDate: "" }), null);
  assert.equal(videoObject({ ...base, uploadDate: "sometime" }), null);
  assert.equal(videoObject({ ...base, uploadDate: "2024-13-45" }), null);
  assert.equal(videoObject({ ...base, uploadDate: "2024-05-01", thumbnailUrl: "" }), null);
  const v = videoObject({ ...base, uploadDate: "2024-05-01", duration: "3:02" });
  assert.equal(v["@type"], "VideoObject");
  assert.equal(v.uploadDate, "2024-05-01");
  assert.equal(v.contentUrl, `${OTHER}/videos/timeless-unforgettable.mp4`);
  assert.equal(v.duration, "PT3M2S");
});

test("isoDuration", () => {
  assert.equal(isoDuration("2:26"), "PT2M26S");
  assert.equal(isoDuration("1:02:03"), "PT1H2M3S");
  assert.equal(isoDuration(65), "PT1M5S");
  assert.equal(isoDuration("x"), undefined);
  assert.equal(isoDuration(undefined), undefined);
});

test("no forbidden types or properties anywhere (deep scan)", () => {
  const forbidden = new Set(FORBIDDEN_TYPES);
  walk(everything(), (obj, path) => {
    for (const type of typesOf(obj)) {
      assert.equal(forbidden.has(type), false, `${type} at ${path}`);
      assert.equal(/Event$/.test(type), false, `${type} at ${path}`);
    }
    for (const key of ["review", "reviews", "aggregateRating", "event", "events", "isbn"]) {
      assert.equal(key in obj, false, `${key} at ${path}`);
    }
  });
});

test("every URL is absolute https on an allengillon.com host, schema.org or Facebook", () => {
  walk(everything(), (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v !== "string" || k === "@context") continue;
      if (/^(https?:)?\/\//.test(v) || v.startsWith("/")) {
        assert.match(v, /^https:\/\/((other\.)?allengillon\.com|schema\.org|www\.facebook\.com)\//, `${path}.${k} = ${v}`);
      }
    }
  });
});

test("@id cross-references resolve to defined nodes across both hosts", () => {
  const nodes = everything();
  const defined = new Set();
  walk(nodes, (obj) => {
    if (obj["@id"] && Object.keys(obj).some((k) => !["@id", "@type", "name"].includes(k))) defined.add(obj["@id"]);
  });
  const refs = [];
  walk(nodes, (obj, path) => {
    if (obj["@id"] && Object.keys(obj).every((k) => ["@id", "@type", "name"].includes(k))) refs.push([obj["@id"], path]);
  });
  assert.ok(refs.length > 10);
  for (const [id, path] of refs) assert.ok(defined.has(id), `unresolved @id ${id} at ${path}`);

  // Main points at other and other points at main.
  const mainIds = siteGraph("main").flatMap((n) => JSON.stringify(n).match(/https:\/\/other\.allengillon\.com[^"]*/g) || []);
  const otherIds = siteGraph("other").flatMap((n) => JSON.stringify(n).match(/https:\/\/allengillon\.com[^"]*/g) || []);
  assert.ok(mainIds.length > 0, "main graph references the other host");
  assert.ok(otherIds.length > 0, "other graph references the main host");
});

test("siteGraph: layout graphs per host", () => {
  assert.deepEqual(siteGraph("main").map((n) => n["@type"]), ["WebSite", "Person", "Service"]);
  assert.deepEqual(siteGraph("other").map((n) => n["@type"]), ["WebSite", "Person", "Person", "MusicGroup"]);
});

test("jsonLdScript: escapes </script> and friends, graphs arrays", () => {
  const hostile = book({ slug: "x", title: "</script><script>alert(1)</script> & \u2028", section: "childrens" });
  const out = jsonLdScript(hostile);
  assert.equal(out.includes("</"), false);
  assert.equal(out.includes("<"), false);
  assert.equal(out.includes(">"), false);
  assert.equal(out.includes("\u2028"), false);
  assert.ok(out.includes("\\u003c/script\\u003e"));
  assert.equal(JSON.parse(out).name, hostile.name, "round-trips to the same data");

  const graph = JSON.parse(jsonLdScript([...siteGraph("other"), null]));
  assert.equal(graph["@context"], "https://schema.org");
  assert.equal(graph["@graph"].length, 4);
  assert.ok(graph["@graph"].every((n) => !("@context" in n)));

  const props = jsonLdProps(personAllen());
  assert.equal(props.type, "application/ld+json");
  assert.equal(JSON.parse(props.dangerouslySetInnerHTML.__html).name, "Allen Gillon");
});
