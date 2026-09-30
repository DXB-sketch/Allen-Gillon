// pa11y-ci config (W7): every route of both hosts, against a running dev server.
//
//   npm run dev:vinext                      (or: SITE_DEV_PORT=3910 npx vinext dev --port 3910)
//   SITE_DEV_PORT=3910 npm run a11y:pa11y
//
// It is a .cjs module rather than plain JSON so the port, the Playwright
// Chromium (pa11y's own Puppeteer browser download is skipped), the book
// slugs and the legal publishing gate all come from the repo.
// Standard: WCAG 2 AA, with both the HTML_CodeSniffer and axe runners.

const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.SITE_DEV_PORT || 3001);
const MAIN = `http://localhost:${port}`;
const OTHER = `http://other.localhost:${port}`;

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
const legal = readJson("content/legal.config.json");
const books = readJson("public/books/index.json");

function chromePath() {
  if (process.env.PA11Y_CHROME) return process.env.PA11Y_CHROME;
  try {
    // Playwright is already a devDependency, and its Chromium is installed for the e2e specs.
    const { chromium } = require("playwright-core");
    return chromium.executablePath();
  } catch {
    return undefined;
  }
}

// One painting page stands for all 36 (they share one template).
const SAMPLE_PAINTING = "ann-426502619623139";

// Each host's not-found page stands for every 404 (one template per host).
const NOT_FOUND = "/no-such-page";

const mainRoutes = ["/", "/hire", "/music", "/reviews", "/shows", "/comments", NOT_FOUND];
if (legal.published === true) mainRoutes.push("/privacy", "/terms", "/accessibility");

const otherRoutes = [
  "/",
  "/biography",
  "/books",
  "/anns-art",
  `/anns-art/${SAMPLE_PAINTING}`,
  "/delivery",
  "/comments",
  ...books.map((b) => `/read/${b.slug}`),
  // The plain-text routes of the stories and textbooks (plays are preview only).
  ...books.filter((b) => b.status === "free").map((b) => `/read/${b.slug}/text`),
  NOT_FOUND,
];

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    runners: ["htmlcs", "axe"],
    timeout: 60000,
    wait: 500,
    concurrency: 1,
    // pa11y reports axe's "needs review" results as errors. Every text element
    // sits on the body's paper-grain background image, so axe cannot compute
    // the colour behind it and returns color-contrast "needs review" (not a
    // violation) for all of them. Contrast is still enforced three ways: the
    // HTML_CodeSniffer contrast checks here, the @axe-core/playwright specs
    // (where real color-contrast violations fail), and scripts/contrast.mjs
    // with tests/contrast.test.mjs for every palette pair.
    ignore: ["color-contrast"],
    chromeLaunchConfig: {
      executablePath: chromePath(),
      args: ["--no-sandbox"],
    },
  },
  urls: [...mainRoutes.map((r) => `${MAIN}${r}`), ...otherRoutes.map((r) => `${OTHER}${r}`)],
};
