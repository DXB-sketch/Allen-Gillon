import assert from "node:assert/strict";
import test from "node:test";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { stripePaymentLinks } from "../content/stripe-payment-links.mjs";
import { stripePaymentLink } from "../lib/storefront.mjs";
import {
  artworks, artStatus, artDetails, artImageUrl, artImageWidths, paintingAction, ART_HALL_SCRIPT,
} from "../lib/art-catalog.mjs";

// /anns-art/[id] renders exactly one action per painting: PaintingDetail
// passes paintingAction(art, stripePaymentLink(`art-${id}`)) to PurchaseLink
// ("Buy this painting") or to one "Enquire about this painting" link.

const routeSource = await readFile(new URL("../app/(other)/anns-art/[id]/page.jsx", import.meta.url), "utf8");

// PaintingDetail is JSX, which Node cannot import directly: bundle it with
// react-dom/server (esbuild, already installed by the build toolchain) into a
// temporary module and render it for real with renderToStaticMarkup.
async function loadDetailRenderer() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const dir = await mkdtemp(path.join(tmpdir(), "art-detail-"));
  const outfile = path.join(dir, "render.mjs");
  try {
    await build({
      stdin: {
        contents: [
          'import { createElement } from "react";',
          'import { renderToStaticMarkup } from "react-dom/server";',
          'import PaintingDetail from "./components/art/PaintingDetail.jsx";',
          "export const render = (art, checkoutUrl) => renderToStaticMarkup(createElement(PaintingDetail, { art, checkoutUrl, Heading: \"h1\" }));",
        ].join("\n"),
        resolveDir: root,
        loader: "js",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      jsx: "automatic",
      loader: { ".jsx": "jsx" },
      define: { "process.env.NODE_ENV": '"production"' },
      banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
      logLevel: "error",
      outfile,
    });
    return (await import(pathToFileURL(outfile).href)).render;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

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

test("the detail view, rendered, has exactly one action: that painting's own Stripe link, or one enquiry", async () => {
  const renderDetail = await loadDetailRenderer();
  let buys = 0;
  for (const art of artworks) {
    const html = renderDetail(art, stripePaymentLink(`art-${art.id}`));
    const doc = new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
    const actions = [...doc.querySelectorAll("a")].filter((a) => /^(Buy this painting|Enquire about this painting)$/.test(a.textContent.trim()));
    assert.equal(actions.length, 1, `${art.id}: one Buy or Enquire link`);
    const stripeHrefs = [...doc.querySelectorAll("a")].map((a) => a.getAttribute("href")).filter((href) => href.startsWith("https://buy.stripe.com"));
    const raw = stripePaymentLinks[`art-${art.id}`];
    if (raw && art.availability === "available") {
      buys += 1;
      assert.equal(actions[0].textContent.trim(), "Buy this painting", art.id);
      assert.equal(actions[0].getAttribute("href"), raw, `${art.id} must link to its own Payment Link`);
      assert.deepEqual(stripeHrefs, [raw], `${art.id}: no other checkout link on the page`);
    } else {
      assert.equal(actions[0].textContent.trim(), "Enquire about this painting", art.id);
      assert.deepEqual(stripeHrefs, [], `${art.id}: no checkout link`);
    }
    assert.ok(doc.querySelector('a[href="/delivery"]'), `${art.id}: delivery link`);
  }
  assert.equal(buys, 29);
});

test("the painting route passes each painting its own Stripe link and lists every painting", () => {
  assert.match(routeSource, /checkoutUrl=\{stripePaymentLink\(`art-\$\{art\.id\}`\)\}/);
  assert.match(routeSource, /generateStaticParams/);
});

test("no painting shows the same photograph twice", async () => {
  for (const art of artworks) {
    const hashes = await Promise.all(art.images.map(async (image) =>
      createHash("sha256").update(await readFile(new URL(`../public${image.src}`, import.meta.url))).digest("hex")));
    assert.equal(new Set(hashes).size, hashes.length, art.title);
  }
  assert.equal(artworks.find((a) => a.title === "Blue Macaws").images.length, 3);
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

test("every responsive image exists at 480/720/960/1600 (capped at the source width) in AVIF and WebP", async () => {
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
