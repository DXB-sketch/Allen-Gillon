import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { ogEntry, ogImages, ogManifest } from "../lib/og.mjs";
import { artworks } from "../content/artworks.mjs";

const root = new URL("../", import.meta.url);
const books = JSON.parse(readFileSync(new URL("content/books.config.json", root), "utf8"));

const MAIN_ROUTES = ["/", "/hire", "/music", "/reviews", "/shows", "/privacy", "/terms", "/accessibility"];
const OTHER_ROUTES = ["/", "/biography", "/books", "/anns-art", "/delivery"];

test("every page, painting, album and book has a 1200x630 OG image on disk", () => {
  const expected = [
    ...MAIN_ROUTES.map((r) => ["main", r]),
    ...["thats-the-time", "wonderful-world", "misty", "i-just-called"].map((id) => ["main", `/music#${id}`]),
    ...OTHER_ROUTES.map((r) => ["other", r]),
    ...artworks.map((a) => ["other", `/anns-art/${a.id}`]),
    ...books.flatMap((b) => [["other", `/read/${b.slug}`], ["other", `/read/${b.slug}/text`]]),
  ];
  for (const [site, route] of expected) {
    const entry = ogManifest[site][route];
    assert.ok(entry, `${site} ${route} has an entry`);
    assert.equal(entry.width, 1200);
    assert.equal(entry.height, 630);
    assert.match(entry.url, new RegExp(`^/og/${site}/.+\\.jpg$`));
    assert.ok(existsSync(new URL(`public${entry.url}`, root)), `${entry.url} exists`);
    assert.ok(entry.alt && entry.alt.length > 3);
  }
});

test("ogImages returns absolute URLs on the right host and falls back to the home image", () => {
  const [img] = ogImages("other", "/books");
  assert.equal(img.url, "https://other.allengillon.com/og/other/books.jpg");
  assert.equal(img.width, 1200);
  assert.equal(ogImages("main", "/")[0].url, "https://allengillon.com/og/main/home.jpg");
  assert.equal(ogEntry("main", "/no-such-page").url, "/og/main/home.jpg");
});
