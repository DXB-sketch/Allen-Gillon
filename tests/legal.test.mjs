// The legal publishing gate (W7): flipping content/legal.config.json's
// "published" flag shows or hides the footer links and the routes, on both
// hosts. The functions take the config, so the flag is flipped here without
// touching the file.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  copyrightLine,
  isLegalPublished,
  legalLinks,
  legalRouteVisible,
  SUPPORT_EMAIL,
} from "../lib/legal.mjs";
import { LEGAL_PATHS, MISSING_PATH, resolveRequest } from "../lib/sites.mjs";

const PROD = { NODE_ENV: "production" };
const UNPUBLISHED = { published: false };
const PUBLISHED = { published: true };
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("only an explicit published: true publishes the legal pages", () => {
  assert.equal(isLegalPublished(PUBLISHED), true);
  for (const config of [UNPUBLISHED, {}, null, undefined, { published: "true" }, { published: 1 }]) {
    assert.equal(isLegalPublished(config), false, JSON.stringify(config));
  }
});

test("the repo ships with the legal pages unpublished until sign-off", () => {
  assert.equal(JSON.parse(read("content/legal.config.json")).published, false);
});

test("footer legal links are hidden on both sites while unpublished", () => {
  assert.deepEqual(legalLinks("main", UNPUBLISHED), []);
  assert.deepEqual(legalLinks("other", UNPUBLISHED), []);
});

test("flipping the flag shows the footer legal links: local on main, absolute to main on other", () => {
  const main = legalLinks("main", PUBLISHED);
  const other = legalLinks("other", PUBLISHED);
  assert.deepEqual(main.map((l) => l.path), LEGAL_PATHS);
  assert.deepEqual(other.map((l) => l.path), LEGAL_PATHS);
  assert.ok(main.every((l) => l.crossSite === false && l.site === "main"));
  assert.ok(other.every((l) => l.crossSite === true && l.site === "main"));
  assert.ok(main.every((l) => l.label && !/here|click|more/i.test(l.label)));
});

test("flipping the flag shows the legal routes", () => {
  for (const path of LEGAL_PATHS) {
    assert.equal(legalRouteVisible(path, UNPUBLISHED), false, `${path} hidden`);
    assert.equal(legalRouteVisible(path, PUBLISHED), true, `${path} visible`);
  }
  assert.equal(legalRouteVisible("/hire", PUBLISHED), false);
});

test("unpublished legal routes are not redirected on either host, so both 404", () => {
  for (const path of LEGAL_PATHS) {
    const opts = { env: PROD, legalPublished: isLegalPublished(UNPUBLISHED) };
    // main: the page's notFound() (the (main) group's not-found).
    assert.equal(resolveRequest("allengillon.com", path, opts).action, "next", `allengillon.com${path}`);
    // other: rewritten to a path with no route, so global-not-found renders
    // the 404 with the More on Allen chrome.
    assert.deepEqual(resolveRequest("other.allengillon.com", path, opts), { site: "other", action: "rewrite", pathname: MISSING_PATH });
  }
});

test("published legal routes render on main and move from other to main", () => {
  for (const path of LEGAL_PATHS) {
    const opts = { env: PROD, legalPublished: isLegalPublished(PUBLISHED) };
    assert.deepEqual(resolveRequest("allengillon.com", path, opts), { site: "main", action: "next" });
    assert.deepEqual(resolveRequest("other.allengillon.com", path, opts), {
      site: "other",
      action: "redirect",
      status: 301,
      location: `https://allengillon.com${path}`,
    });
  }
});

test("every legal page calls notFound() behind the gate", () => {
  for (const path of LEGAL_PATHS) {
    const src = read(`app/(main)${path}/page.jsx`);
    assert.match(src, /legalRouteVisible\(\s*"\/[a-z]+"\s*,\s*legal\s*\)/, `${path} checks the gate`);
    assert.match(src, /notFound\(\)/, `${path} calls notFound()`);
  }
});

test("the footer copyright names both Allen and Ann", () => {
  assert.equal(copyrightLine(2026), "© 2026 Allen Gillon · Paintings © Ann Gillon");
});

test("the terms carry the ACL sentence, the sellers, the refund policy and the support address", () => {
  const terms = read("app/(main)/terms/page.jsx");
  assert.match(terms, /Our goods come with guarantees that cannot be excluded under the Australian Consumer Law/);
  assert.match(terms, /Ann Gillon/);
  assert.match(terms, /Allen Gillon/);
  assert.match(terms, /change of mind/i);
  assert.match(terms, /7 days/);
  assert.match(terms, /SUPPORT_EMAIL|support@allengillon\.com/);
  assert.equal(SUPPORT_EMAIL, "support@allengillon.com");
});

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(jsx?|mjs|json|css|md|txt)$/.test(name)) out.push(full);
  }
  return out;
}

test('no page or content file says "no refunds", and there is no ABN', () => {
  const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  for (const file of [...walk(join(root, "app")), ...walk(join(root, "content")), ...walk(join(root, "components"))]) {
    const text = readFileSync(file, "utf8");
    assert.doesNotMatch(text, /no refunds/i, file);
    assert.doesNotMatch(text, /\bABN\b/, file);
  }
});
