/*
 * TwoInk: the house line-art style for both sites (DESIGN.md, Illustration).
 *
 * Every decorative drawing is a hand-authored inline SVG wrapped in <TwoInk>.
 * It renders the strokes twice in one <svg>:
 *   1. the second ink, offset about 3px down and right at 30% opacity
 *      (the misregistration), and
 *   2. the lead ink on top: 2.75px stroke, round caps and joins, no fill.
 * Stroke width does not scale with the drawing (vector-effect), so a drawing
 * reads as the same pen at 375px and at 1920px.
 *
 * Colours come from app/illustrations.css, set by data-site:
 *   main  = red-led  (lead --red, second --blue): music and performance
 *   other = blue-led (lead --blue, second --red): the written work
 * lead="red" | "blue" forces an ink (a book drawing on the main site is blue,
 * because blue means the written work). ground="ink" is for drawings on a dark
 * ink band (lead paper, second red).
 *
 * Usage (see Record.jsx, Headstock.jsx, OpenBook.jsx):
 *
 *   import TwoInk from "../../components/illustrations/TwoInk";
 *   export default function Kettle(props) {
 *     return (
 *       <TwoInk viewBox="0 0 200 160" {...props}>
 *         <path d="M20 140 C 40 60, 160 60, 180 140" />
 *         <circle cx="100" cy="40" r="12" />
 *       </TwoInk>
 *     );
 *   }
 *   <Kettle className="kettle" draw />
 *
 * Props: viewBox (required), className, children (the strokes: path, line,
 * polyline, polygon, circle, ellipse, rect, g), draw (draw-on once when it
 * scrolls into view), delay (ms, staggers a draw), lead, ground, offset
 * (misregistration in viewBox units, default 3: author the viewBox close to
 * the size it usually renders at so 3 units is about 3px). Any other prop
 * (id, data-*, width, height) goes on the <svg>. Size the drawing from its
 * className in your route CSS (width, max-width, grid placement); the svg has
 * no intrinsic size beyond its viewBox.
 *
 * Rules (the plan's anti-pattern list applies):
 * - Always decorative: TwoInk sets aria-hidden="true", focusable="false" and
 *   pointer-events:none. Never put meaning in a drawing; say it in text.
 * - Never under text. Drawings live in margins, gutters or their own grid
 *   cell, not as a background behind copy (contrast for older readers).
 * - Budget: at most 40KB of decorative SVG per page, counted as rendered
 *   (both copies). Keep paths hand-simplified: round coordinates to integers,
 *   a few dozen nodes per drawing.
 * - Hand-authored only: no AI rasters, no traced photos, no icon sets, no
 *   fills, no gradients, no filters.
 * - Motion: only draw (stroke-dashoffset) through data-motion, once, handled
 *   by MotionObserver. Drawings already on screen at load stay static.
 */
export { default } from "./two-ink.mjs";
