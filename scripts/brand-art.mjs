// Shared drawing helpers for the build-time image scripts (build-icons.mjs,
// build-og.mjs). Node only: never import this from app code.
//
// The palette is read from the OKLCH tokens in app/site.css and converted to
// sRGB hex, because librsvg (sharp's SVG renderer) does not understand oklch().
// If a token cannot be read, the fallback below (same OKLCH values as DESIGN.md)
// is used. Nothing here is ever #000 or #fff.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FALLBACK_OKLCH = {
  paper: [0.972, 0.01, 92],
  "paper-2": [0.955, 0.012, 92],
  ink: [0.22, 0.02, 300],
  red: [0.615, 0.195, 33],
  "red-deep": [0.5, 0.17, 33],
  blue: [0.455, 0.15, 262],
  soft: [0.4, 0.03, 300],
  on: [0.975, 0.012, 92],
};

/** OKLCH (L 0..1, C, h degrees) to an sRGB hex string, gamut-clipped. */
export function oklchToHex(L, C, h) {
  const rad = (h * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const enc = (x) => {
    const v = Math.min(1, Math.max(0, x));
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(g * 255);
  };
  return `#${lin.map((x) => enc(x).toString(16).padStart(2, "0")).join("")}`;
}

function readTokens() {
  const tokens = { ...FALLBACK_OKLCH };
  try {
    const css = readFileSync(path.join(ROOT, "app", "site.css"), "utf8");
    const root = css.match(/:root\s*\{([\s\S]*?)\}/);
    if (root) {
      for (const m of root[1].matchAll(/--([a-z0-9-]+)\s*:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/gi)) {
        tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
      }
    }
  } catch {
    // fall back silently; the values are the same as DESIGN.md
  }
  return tokens;
}

export const PALETTE = Object.fromEntries(
  Object.entries(readTokens()).map(([name, [L, C, h]]) => [name, oklchToHex(L, C, h)]),
);

for (const [name, hex] of Object.entries(PALETTE)) {
  if (hex === "#000000" || hex === "#ffffff") throw new Error(`palette token ${name} resolved to ${hex}`);
}

/** Lead ink and second (misregistered) ink per host. Red leads main, blue leads other. */
export function inksFor(site) {
  return site === "other"
    ? { lead: PALETTE.blue, second: PALETTE.red }
    : { lead: PALETTE["red-deep"], second: PALETTE.blue };
}

// The "AG" monogram, hand-drawn as strokes on a 64 x 64 grid. No text, no
// fonts: the A is two legs and a crossbar, the G an open ellipse with a bar.
// Each is drawn once in the lead ink and once, offset, in the second ink at
// 30% opacity: the two-ink overprint from DESIGN.md.
export const MONOGRAM_PATHS = [
  // A: left leg, apex with a slight hand-drawn overshoot, right leg
  "M6.5 54 L18.6 10.2 Q19.4 8.6 20.2 10.2 L31.5 54",
  // A crossbar, a touch long on the right like a pen stroke
  "M11.2 38.5 L27.6 38.2",
  // G: open ellipse from upper right, round the left, back up the right side
  "M54.6 17.2 C51.8 11.9 48.8 10 45.6 10 C38.9 10 34.4 19.6 34.4 32 C34.4 44.4 38.9 54 45.6 54 C51.4 54 56.8 48.4 57.6 38.6 L57.6 36.4",
  // G bar
  "M57.6 36.4 L47.4 36.4",
];

/**
 * The monogram as an SVG group, drawn in a `size` px square at (x, y).
 * `offset` is the misregistration in px at the rendered size (default ~3px
 * at 64px, scaled down a little for tiny favicons so the letters stay crisp).
 */
export function monogramGroup({ site = "main", x = 0, y = 0, size = 64, stroke = 5.2, offset } = {}) {
  const { lead, second } = inksFor(site);
  const scale = size / 64;
  const shift = (offset ?? 3) / scale;
  const d = MONOGRAM_PATHS.join(" ");
  const common = `fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return [
    `<g transform="translate(${x} ${y}) scale(${scale})">`,
    shift > 0
      ? `<path d="${d}" ${common} stroke="${second}" stroke-opacity="0.3" transform="translate(${shift.toFixed(3)} ${(shift * 0.66).toFixed(3)})"/>`
      : "",
    `<path d="${d}" ${common} stroke="${lead}"/>`,
    `</g>`,
  ].join("");
}

/** A complete square monogram SVG. `pad` is the fraction of the side left empty on each edge. */
export function monogramSvg({ site = "main", size = 512, pad = 0.12, background = true, stroke, offset } = {}) {
  const inner = size * (1 - 2 * pad);
  const bg = background ? `<rect width="${size}" height="${size}" fill="${PALETTE.paper}"/>` : "";
  // At 16-48px the stroke is thickened so it survives downsampling.
  const w = stroke ?? (size <= 32 ? 7 : size <= 48 ? 6.2 : size <= 128 ? 5.2 : 4.4);
  // At 16px the misregistered copy only muddies the letters, so it is left out.
  const off = offset ?? (size <= 16 ? 0 : Math.max(1, (3 * inner) / 64));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`,
    bg,
    monogramGroup({ site, x: size * pad, y: size * pad, size: inner, stroke: w, offset: off }),
    `</svg>`,
  ].join("");
}

export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Greedy word wrap using an average Times New Roman advance of ~0.47em.
 * Returns at most `maxLines` lines; the last one gets an ellipsis if cut.
 */
export function wrapText(text, fontSize, maxWidth, maxLines = 3) {
  const perChar = fontSize * 0.47;
  const maxChars = Math.max(4, Math.floor(maxWidth / perChar));
  // Split on ordinary spaces only, so no-break spaces keep initials together.
  const words = String(text).split(/[ \t\n]+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[,.;:]?$/, "")}…`;
    return kept;
  }
  return lines;
}
