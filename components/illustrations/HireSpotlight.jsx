import TwoInk from "./TwoInk";

// A theatre spotlight for the Bookings ink band (/hire): a lantern hung from a
// lighting bar on a clamp and yoke, barn doors open, its beam falling down and
// to the right, toward the phone number. The lantern is drawn pointing right
// and tilted 35 degrees about its pivot. The beam is broken into rays so it
// reads as light, and it stops at the drawing's own cell, never under text.
// Decorative only; see TwoInk.jsx for the rules.
export default function HireSpotlight(props) {
  return (
    <TwoInk viewBox="0 0 330 300" {...props}>
      {/* The lighting bar and the clamp. */}
      <path d="M8 20H176" />
      <path d="M64 12V28H76V12" />
      <path d="M70 28V74" />
      <g transform="rotate(35 70 80)">
        {/* Lantern body, rounded at the back, with cooling fins on top. */}
        <path d="M42 58H116V102H42C30 102 26 90 26 80C26 70 30 58 42 58Z" />
        <path d="M116 54V106" />
        <path d="M54 58V50M64 58V50M88 58V50M98 58V50" />
        <circle cx="70" cy="80" r="6" />
        {/* Lens and barn doors. */}
        <ellipse cx="122" cy="80" rx="6" ry="24" />
        <path d="M126 58L146 44M126 102L146 116" />
      </g>
      {/* The beam: two broken edges and three rays between them. */}
      <path d="M153 94L220 117M236 122L296 143" />
      <path d="M112 153L150 200M162 215L204 267" />
      <path d="M150 120L196 148M212 158L262 188" />
      <path d="M136 132L170 170M182 184L226 234" />
      {/* The edge of the pool of light. */}
      <path d="M316 150C300 214 264 262 222 290" />
    </TwoInk>
  );
}
