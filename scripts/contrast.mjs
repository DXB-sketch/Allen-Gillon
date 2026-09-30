// WCAG contrast of the site palette (app/site.css :root tokens).
// OKLCH -> linear sRGB (Björn Ottosson's matrices), clamped to gamut, then
// the WCAG 2 relative-luminance ratio. Run: node scripts/contrast.mjs
// The numbers are recorded in DESIGN.md (Color).

const TOKENS = {
  paper: [0.972, 0.01, 92],
  "paper-2": [0.955, 0.012, 92],
  ink: [0.22, 0.02, 300],
  soft: [0.4, 0.03, 300],
  red: [0.615, 0.195, 33],
  "red-deep": [0.5, 0.17, 33],
  blue: [0.455, 0.15, 262],
  on: [0.975, 0.012, 92],
  "footer-text": [0.8, 0.02, 92],
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

function luminance(token) {
  const [r, g, b] = oklchToLinearSrgb(...TOKENS[token]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS = [
  ["ink", "paper"],
  ["ink", "paper-2"],
  ["soft", "paper"],
  ["soft", "paper-2"],
  ["blue", "paper"],
  ["blue", "paper-2"],
  ["red-deep", "paper"],
  ["red", "paper"],
  ["on", "ink"],
  ["footer-text", "ink"],
  ["on", "blue"],
  ["on", "red"],
  ["on", "red-deep"],
];

{
  for (const [fg, bg] of PAIRS) {
    console.log(`${fg.padEnd(12)} on ${bg.padEnd(8)} ${contrast(fg, bg).toFixed(2)}:1`);
  }
}
