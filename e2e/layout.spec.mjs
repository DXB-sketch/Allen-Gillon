import { test, expect } from "@playwright/test";

// W3 layout gate, on both hosts.
// 1. No horizontal scroll at any tested width.
// 2. At 1440 and 1920 the mast, the first band and the page's main content
//    band span the viewport minus --gutter on each side (within 2px).
// waitUntil "load": /reviews keeps a request open and never reaches networkidle.

const port = Number(process.env.SITE_DEV_PORT || 3001);
const HOSTS = {
  main: `http://localhost:${port}`,
  other: `http://other.localhost:${port}`,
};

const WIDTHS = [320, 375, 768, 1024, 1280, 1440, 1920, 2560];
const SPAN_WIDTHS = [1440, 1920];

// Per route: [first band, main content band]. A selector matching several
// elements is measured as their union (leftmost left edge to rightmost right
// edge), which is how a two-column band is checked. The mast is always checked.
const ROUTES = {
  main: {
    "/": [".home-hero > h1", ".home-photos, .home-doors"],
    "/hire": [".pagehead > h1", ".book-band > h2, .book-band .phones", ".offer, .hire-offers .gx-hero"],
    "/music": [".pagehead > h1", ".albums"],
    "/reviews": [".reviewsHead > h1", ".featuredReview"],
    "/shows": [".pagehead > h1", ".show-list, .show-photo"],
  },
  other: {
    "/": [".sideboard-head", ".doorways"],
    "/biography": [".pagehead > h1", ".bio .prose, .bio aside"],
    "/books": [".writing-head > h1", ".audiobook-list"],
    "/read/little-ray": [".pagehead > h1", ".read-reader"],
    "/read/melting-pot": [".pagehead > h1", ".read-reader"],
    "/anns-art": [".pagehead > h1", ".artgrid"],
    "/delivery": [".pagehead > h1"],
  },
};

const SPAN_HEIGHT = 900;

async function measure(page, selectors) {
  return page.evaluate((sels) => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;width:var(--gutter);height:0";
    document.body.appendChild(probe);
    const gutter = parseFloat(getComputedStyle(probe).width);
    probe.remove();
    const viewport = document.documentElement.clientWidth;
    const contentBox = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const px = (p) => parseFloat(cs[p]) || 0;
      return {
        left: r.left + px("paddingLeft") + px("borderLeftWidth"),
        right: r.right - px("paddingRight") - px("borderRightWidth"),
      };
    };
    const spans = sels.map((sel) => {
      const els = [...document.querySelectorAll(sel)].filter((el) => el.getClientRects().length);
      if (!els.length) return { sel, missing: true };
      const boxes = els.map(contentBox);
      const left = Math.min(...boxes.map((b) => b.left));
      const right = Math.max(...boxes.map((b) => b.right));
      return { sel, left, right, width: right - left };
    });
    return { gutter, viewport, spans };
  }, selectors);
}

for (const [site, routes] of Object.entries(ROUTES)) {
  const origin = HOSTS[site];
  test.describe(`${site} layout`, () => {
    for (const [path, bands] of Object.entries(routes)) {
      test(`${path}: no horizontal scroll at any width; bands span the gutters`, async ({ page }) => {
        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: SPAN_HEIGHT });
          await page.goto(`${origin}${path}`, { waitUntil: "load" });
          await page.evaluate(() => document.fonts.ready);
          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(scrollWidth, `${site} ${path} at ${width}px: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`).toBeLessThanOrEqual(clientWidth);

          if (!SPAN_WIDTHS.includes(width)) continue;
          const { gutter, viewport, spans } = await measure(page, [".mast", ...bands]);
          const expected = viewport - 2 * gutter;
          for (const span of spans) {
            expect(span.missing, `${site} ${path}: "${span.sel}" not found`).toBeFalsy();
            const label = `${site} ${path} at ${width}px: "${span.sel}" spans ${span.left.toFixed(1)}..${span.right.toFixed(1)} (${span.width.toFixed(1)}px), expected ${gutter}..${viewport - gutter} (${expected}px)`;
            expect(Math.abs(span.width - expected), label).toBeLessThanOrEqual(2);
            expect(Math.abs(span.left - gutter), label).toBeLessThanOrEqual(2);
          }
        }
      });
    }
  });
}
