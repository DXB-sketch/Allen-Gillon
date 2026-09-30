import test from "node:test";
import assert from "node:assert/strict";
import {
  ROUTE_OWNER,
  crossSiteUrl,
  isCurrentNav,
  isPreviewEnv,
  NAV,
  resolveRequest,
  runtimeEnv,
  safeReturnTo,
  siteForHost,
  SITE_MARKER_SCRIPT,
  usesLocalLinks,
} from "../lib/sites.mjs";

const PROD = { NODE_ENV: "production" };
const DEV = { NODE_ENV: "development" };
const MAIN = "allengillon.com";
const OTHER = "other.allengillon.com";

const is3xx = (result) => result.action === "redirect" && result.status >= 300 && result.status < 400;

// [description, host, path, options, expected]
const table = [
  // www to apex
  ["www root goes to apex", "www.allengillon.com", "/", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/" }],
  ["www keeps path and query", "www.allengillon.com", "/music?x=1", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/music?x=1" }],

  // owned paths across hosts
  ["main /books goes to other", MAIN, "/books", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/books" }],
  ["main /read/slug goes to other", MAIN, "/read/little-ray", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/read/little-ray" }],
  ["other /hire goes to main", OTHER, "/hire", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/hire" }],
  ["other /music keeps query", OTHER, "/music?a=b", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/music?a=b" }],

  // owned paths stay on their own host
  ["main /hire renders", MAIN, "/hire", { env: PROD }, { action: "next" }],
  ["main / renders", MAIN, "/", { env: PROD }, { action: "next" }],
  ["other /books renders", OTHER, "/books", { env: PROD }, { action: "next" }],
  ["other /anns-art renders", OTHER, "/anns-art", { env: PROD }, { action: "next" }],

  // shared paths
  ["main /comments renders", MAIN, "/comments?subject=x", { env: PROD }, { action: "next" }],
  ["other /comments renders", OTHER, "/comments", { env: PROD }, { action: "next" }],
  ["static file on other host is not redirected", OTHER, "/images/albums/misty.webp", { env: PROD }, { action: "next" }],
  ["book asset on main host is not redirected", MAIN, "/books/little-ray/p001.webp", { env: PROD }, { action: "next" }],

  // other-site home
  ["other / rewrites to /other-home", OTHER, "/", { env: PROD }, { action: "rewrite", pathname: "/other-home" }],
  ["other /other-home returns 301 to /", OTHER, "/other-home", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/" }],
  ["main /other-home returns 301 to other /", MAIN, "/other-home", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/" }],

  // plays
  ["main /plays goes to school plays", MAIN, "/plays", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/books#school-plays" }],
  ["other /plays goes to school plays", OTHER, "/plays", { env: PROD }, { action: "redirect", status: 301, location: "https://other.allengillon.com/books#school-plays" }],

  // api is never redirected (resolveRequest ignores the method; e2e/sites.spec.mjs sends real POSTs)
  ["main /api/reviews", MAIN, "/api/reviews", { env: PROD }, { action: "next" }],
  ["other /api/reviews", OTHER, "/api/reviews", { env: PROD }, { action: "next" }],
  ["www /api/reviews", "www.allengillon.com", "/api/reviews", { env: PROD }, { action: "next" }],
  ["unknown host /api/reviews", "allen-gillon.example.workers.dev", "/api/reviews", { env: PROD }, { action: "next" }],

  // legal pages: main only once published, 404 on both while unpublished
  ["other /privacy while unpublished falls through", OTHER, "/privacy", { env: PROD }, { action: "next" }],
  ["other /privacy once published goes to main", OTHER, "/privacy", { env: PROD, legalPublished: true }, { action: "redirect", status: 301, location: "https://allengillon.com/privacy" }],
  ["main /terms once published renders", MAIN, "/terms", { env: PROD, legalPublished: true }, { action: "next" }],

  // unknown hosts
  ["unknown host in production goes to main", "allen-gillon.example.workers.dev", "/music", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/music" }],
  ["unknown host in development never redirects", "preview.example.com", "/books", { env: DEV }, { action: "next" }],
  ["unknown host with preview flag never redirects", "preview.example.com", "/books", { env: { NODE_ENV: "production", SITE_PREVIEW: "1" } }, { action: "next" }],
  ["LAN IP with preview flag (start:vinext) never redirects", "192.168.1.5:8787", "/books", { env: { NODE_ENV: "production", SITE_PREVIEW: "1" } }, { action: "next" }],
  ["LAN IP in production goes to main", "192.168.1.5:8787", "/books", { env: PROD }, { action: "redirect", status: 301, location: "https://allengillon.com/books" }],
  ["Vercel deployment never redirects", "allen-gillon.vercel.app", "/music", { env: { NODE_ENV: "production", VERCEL: "1" } }, { action: "next" }],
  ["known host still routes with preview flag", MAIN, "/books", { env: { NODE_ENV: "production", SITE_PREVIEW: "1" } }, { action: "redirect", status: 301, location: "https://other.allengillon.com/books" }],
  ["unknown other.* host in development rewrites home", "other.preview.example.com", "/", { env: DEV }, { action: "rewrite", pathname: "/other-home" }],

  // loopback and *.localhost never redirect, even in production
  ["localhost /books", "localhost:3001", "/books", { env: PROD }, { action: "next" }],
  ["127.0.0.1 /books", "127.0.0.1:8787", "/books", { env: PROD }, { action: "next" }],
  ["[::1] /books", "[::1]:8787", "/books", { env: PROD }, { action: "next" }],
  ["localhost /plays", "localhost", "/plays", { env: PROD }, { action: "next" }],
  ["localhost /other-home", "localhost:8787", "/other-home", { env: PROD }, { action: "next" }],
  ["other.localhost /hire", "other.localhost:3001", "/hire", { env: PROD }, { action: "next" }],
  ["other.localhost / rewrites to /other-home", "other.localhost:3001", "/", { env: PROD }, { action: "rewrite", pathname: "/other-home" }],
  ["other.localhost /other-home", "other.localhost:3001", "/other-home", { env: PROD }, { action: "next" }],
  ["site.test /hire", "allen.test", "/hire", { env: PROD }, { action: "next" }],
  ["empty host", "", "/books", { env: PROD }, { action: "next" }],
];

for (const [description, host, path, options, expected] of table) {
  test(`resolveRequest: ${description}`, () => {
    const result = resolveRequest(host, path, options);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(result[key], value, `${key} for ${host}${path}`);
    }
    if (expected.action !== "redirect") assert.equal(is3xx(result), false);
  });
}

test("every owned path returns 301 across hosts in production", () => {
  for (const [prefix, owner] of Object.entries(ROUTE_OWNER)) {
    const wrongHost = owner === "main" ? OTHER : MAIN;
    const rightOrigin = owner === "main" ? "https://allengillon.com" : "https://other.allengillon.com";
    for (const path of [prefix, `${prefix}/child`]) {
      const result = resolveRequest(wrongHost, path, { env: PROD, legalPublished: true });
      assert.equal(result.action, "redirect", `${wrongHost}${path}`);
      assert.equal(result.status, 301);
      assert.equal(result.location, `${rightOrigin}${path}`);
      const own = resolveRequest(owner === "main" ? MAIN : OTHER, path, { env: PROD, legalPublished: true });
      assert.notEqual(own.action, "redirect", `${path} on its own host`);
    }
  }
});

test("loopback and *.localhost hosts never redirect for any path", () => {
  const hosts = ["localhost", "localhost:3001", "localhost:8787", "127.0.0.1", "127.0.0.1:8787", "::1", "[::1]:3001", "other.localhost", "other.localhost:3101", "anything.localhost"];
  const paths = ["/", "/other-home", "/plays", "/api/reviews", ...Object.keys(ROUTE_OWNER), "/read/little-ray", "/comments"];
  for (const env of [PROD, DEV, {}]) {
    for (const host of hosts) {
      for (const path of paths) {
        const result = resolveRequest(host, path, { env, legalPublished: true });
        assert.equal(is3xx(result), false, `${host}${path} redirected to ${result.location}`);
      }
    }
  }
});

test("/api/reviews is never 3xx on either host in any environment", () => {
  for (const host of [MAIN, OTHER, "www.allengillon.com", "localhost:8787", "other.localhost:8787"]) {
    for (const env of [PROD, DEV]) {
      assert.equal(is3xx(resolveRequest(host, "/api/reviews", { env })), false, host);
    }
  }
});

test("siteForHost", () => {
  assert.equal(siteForHost(MAIN), "main");
  assert.equal(siteForHost("www.allengillon.com"), "main");
  assert.equal(siteForHost(OTHER), "other");
  assert.equal(siteForHost("other.localhost:3001"), "other");
  assert.equal(siteForHost("localhost:3001"), "main");
  assert.equal(siteForHost("127.0.0.1"), "main");
});

test("crossSiteUrl uses production, local or SITE_DEV_PORT origins", () => {
  assert.equal(crossSiteUrl("other", "/books"), "https://other.allengillon.com/books");
  assert.equal(crossSiteUrl("main", "/hire"), "https://allengillon.com/hire");
  assert.equal(crossSiteUrl("other", "/", { host: "localhost:8787" }), "http://other.localhost:8787/");
  assert.equal(crossSiteUrl("main", "/shows", { host: "other.localhost:3101" }), "http://localhost:3101/shows");
  assert.equal(crossSiteUrl("main", "/", { host: "allengillon.com" }), "https://allengillon.com/");
  assert.equal(crossSiteUrl("other", "/", { dev: true }), "http://other.localhost:3001/");
  assert.equal(crossSiteUrl("other", "/", { dev: true, env: { SITE_DEV_PORT: "8787" } }), "http://other.localhost:8787/");
});

test("preview and local-link flags", () => {
  assert.equal(isPreviewEnv(PROD), false);
  assert.equal(isPreviewEnv(DEV), true);
  assert.equal(isPreviewEnv({}), true);
  assert.equal(isPreviewEnv({ NODE_ENV: "production", SITE_PREVIEW: "1" }), true);
  assert.equal(isPreviewEnv({ NODE_ENV: "production", VERCEL: "1" }), true);
  // Local links in dev and in the local Worker preview, not on Vercel or in production.
  assert.equal(usesLocalLinks(PROD), false);
  assert.equal(usesLocalLinks(DEV), true);
  assert.equal(usesLocalLinks({ NODE_ENV: "production", SITE_PREVIEW: "1" }), true);
  assert.equal(usesLocalLinks({ NODE_ENV: "production", VERCEL: "1" }), false);
});

test("runtimeEnv reads the routing variables from process.env", () => {
  const saved = { SITE_PREVIEW: process.env.SITE_PREVIEW, VERCEL: process.env.VERCEL };
  process.env.SITE_PREVIEW = "1";
  delete process.env.VERCEL;
  try {
    const env = runtimeEnv();
    assert.equal(env.SITE_PREVIEW, "1");
    assert.equal(env.VERCEL, undefined);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("the html data-site script uses the siteForHost rule", () => {
  for (const [hostname, site] of [["other.allengillon.com", "other"], ["other.localhost", "other"], ["allengillon.com", "main"], ["localhost", "main"]]) {
    const attrs = {};
    const document = { documentElement: { setAttribute: (name, value) => { attrs[name] = value; } } };
    new Function("document", "location", SITE_MARKER_SCRIPT)(document, { hostname });
    assert.equal(attrs["data-site"], site, hostname);
    assert.equal(siteForHost(hostname), site, hostname);
  }
});

test("other Home link is current on / and on /other-home", () => {
  const home = NAV.other[0];
  assert.equal(isCurrentNav(home, "/"), true);
  assert.equal(isCurrentNav(home, "/other-home"), true);
  assert.equal(isCurrentNav(home, "/books"), false);
  assert.equal(isCurrentNav(NAV.other[2], "/books"), true);
  assert.equal(isCurrentNav(NAV.main[0], "/other-home"), false);
});

test("comment returnTo is whitelisted per host", () => {
  assert.equal(safeReturnTo("main", "/music#originals"), "/music#originals");
  assert.equal(safeReturnTo("main", "/books#stories"), "/shows");
  assert.equal(safeReturnTo("other", "/books#stories"), "/books#stories");
  assert.equal(safeReturnTo("other", "/read/little-ray"), "/read/little-ray");
  assert.equal(safeReturnTo("other", "/music"), "/books");
  assert.equal(safeReturnTo("other", "https://evil.example/"), "/books");
  assert.equal(safeReturnTo("main", "//evil.example"), "/shows");
});
