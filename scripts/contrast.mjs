// WCAG contrast of the site palette and the colour pairs the pages actually use.
//
// The :root tokens are read from app/site.css, so the numbers follow the CSS.
// OKLCH -> linear sRGB (Björn Ottosson's matrices), clamped to gamut, then
// the WCAG 2 relative-luminance ratio.
//
// Thresholds (redesign plan W7 and DESIGN.md):
//   body   7:1    running body text (the site's own AAA rule)
//   text   4.5:1  other normal-size text and links (WCAG 1.4.3)
//   large  3:1    text at 24px or larger, e.g. Dynalight titles (WCAG 1.4.3)
//   ui     3:1    focus rings, control borders and icons (WCAG 1.4.11)
//
// Run: node scripts/contrast.mjs        (exits 1 if any pair fails)
// The numbers are recorded in DESIGN.md (Color).

import { readFileSync } from "node:fs";

const THRESHOLDS = { body: 7, text: 4.5, large: 3, ui: 3 };

/** The `--name: oklch(L C H)` tokens in the first :root block of a stylesheet. */
export function readTokens(css) {
  const root = css.match(/:root\s*\{([\s\S]*?)\}/);
  const tokens = {};
  if (!root) return tokens;
  for (const m of root[1].matchAll(/--([a-z0-9-]+)\s*:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/gi)) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

// Colours written inline in the CSS rather than as tokens.
const LITERALS = {
  "footer-text": [0.8, 0.02, 92], // footer p (site.css)
  "footer-hover": [0.78, 0.13, 33], // footer link hover (site.css)
  "ink-band-text": [0.86, 0.015, 92], // textbook band copy (books.css)
  "ink-band-hover": [0.8, 0.13, 33], // textbook band link hover (books.css)
};

function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

function luminance(lch) {
  const [r, g, b] = oklchToLinearSrgb(...lch);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastOf(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, threshold, where it is used]
export const PAIRS = [
  ["ink", "paper", "body", "body text"],
  ["ink", "paper-2", "body", "body text on the second paper"],
  ["soft", "paper", "body", "ledes and secondary text"],
  ["soft", "paper-2", "body", "secondary text on the second paper"],
  ["blue", "paper", "text", "links, blue headings and the cross-site link"],
  ["blue", "paper-2", "text", "links on the second paper"],
  ["red-deep", "paper", "text", "links in paragraphs, current nav item"],
  ["red", "paper", "large", "Dynalight titles (2rem and up) and the logo"],
  ["red", "ink", "large", "Dynalight name in the footer"],
  ["on", "ink", "body", "text on ink bands, the footer and the now-playing bar"],
  ["footer-text", "ink", "body", "footer contact and copyright text"],
  ["footer-hover", "ink", "text", "footer link hover"],
  ["ink-band-text", "ink", "body", "textbook band copy"],
  ["ink-band-hover", "ink", "text", "textbook band link hover"],
  ["on", "blue", "text", "button text on blue"],
  ["on", "red-deep", "text", "button text on deep red"],
  ["blue", "paper", "ui", "focus ring on paper (3px blue)"],
  ["blue", "paper-2", "ui", "focus ring on the second paper"],
  ["paper", "ink", "ui", "focus ring on ink bands, footer and now-playing bar"],
  ["on", "ink", "ui", "now-playing button borders"],
  ["ink", "paper", "ui", "track play button border"],
];

export function checkPalette(css) {
  const colours = { ...readTokens(css), ...LITERALS };
  return PAIRS.map(([fg, bg, level, use]) => {
    if (!colours[fg] || !colours[bg]) throw new Error(`Unknown colour ${colours[fg] ? bg : fg}`);
    const ratio = contrastOf(colours[fg], colours[bg]);
    return { fg, bg, level, use, ratio, min: THRESHOLDS[level], pass: ratio >= THRESHOLDS[level] };
  });
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, "/").replace(/^\//, "")}`) {
  const css = readFileSync(new URL("../app/site.css", import.meta.url), "utf8");
  const rows = checkPalette(css);
  for (const r of rows) {
    console.log(
      `${r.pass ? "pass" : "FAIL"}  ${r.fg.padEnd(15)} on ${r.bg.padEnd(8)} ${r.ratio.toFixed(2).padStart(5)}:1  (${r.level} ${r.min}:1)  ${r.use}`,
    );
  }
  const failed = rows.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`${failed.length} pair(s) under threshold`);
    process.exit(1);
  }
}
