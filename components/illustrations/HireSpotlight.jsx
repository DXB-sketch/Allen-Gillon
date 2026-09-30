import TwoInk from "./TwoInk";

// A theatre spotlight for the Bookings ink band (/hire): a lantern hung from a
// lighting bar on a clamp and yoke, barn doors open, its beam thrown toward
// the phone number. The lantern and its beam are drawn pointing straight
// right and turned together about the pivot, so the light always leaves the
// lens. The beam is broken into rays so it reads as light, and it stops at
// the drawing's own cell, never under text. Decorative only; see TwoInk.jsx.
//
// aim="across" (desktop): tilted 8 degrees, the lamp sits left of the number
//   and the beam runs right, into the column that holds it.
// aim="down" (phones): tilted 35 degrees and mirrored, for a lamp hung at the
//   right above the number, the light falling down and to the left. The
//   mirror is inside the strokes, so the second ink still sits down and right.
const AIMS = {
  across: { tilt: 8, reach: 292, spread: 34, viewBox: "0 0 320 200" },
  down: { tilt: 35, reach: 226, spread: 30, viewBox: "0 0 250 236", mirror: 250 },
};

// One broken stroke from (x1,y1) to (x2,y2), with a gap at 55 to 62 percent.
function ray(x1, y1, x2, y2) {
  const at = (t) => `${Math.round(x1 + (x2 - x1) * t)} ${Math.round(y1 + (y2 - y1) * t)}`;
  return `M${at(0)}L${at(0.55)}M${at(0.62)}L${at(1)}`;
}

export default function HireSpotlight({ aim = "across", ...props }) {
  const { tilt, reach: r, spread: s, viewBox, mirror } = AIMS[aim] || AIMS.across;
  return (
    <TwoInk viewBox={viewBox} {...props}>
      <g transform={mirror ? `translate(${mirror} 0) scale(-1 1)` : undefined}>
        {/* The lighting bar and the clamp. */}
        <path d="M8 20H176" />
        <path d="M64 12V28H76V12" />
        <path d="M70 28V74" />
        <g transform={`rotate(${tilt} 70 80)`}>
          {/* Lantern body, rounded at the back, with cooling fins on top. */}
          <path d="M42 58H116V102H42C30 102 26 90 26 80C26 70 30 58 42 58Z" />
          <path d="M116 54V106" />
          <path d="M54 58V50M64 58V50M88 58V50M98 58V50" />
          <circle cx="70" cy="80" r="6" />
          {/* Lens and barn doors. */}
          <ellipse cx="122" cy="80" rx="6" ry="24" />
          <path d="M126 58L146 44M126 102L146 116" />
          {/* The beam: two edges and three rays, then the edge of the pool. */}
          <path d={ray(152, 50, r, 50 - s)} />
          <path d={ray(152, 110, r, 110 + s)} />
          <path d={ray(164, 66, r - 26, 66 - s / 2)} />
          <path d={ray(170, 80, r - 18, 80)} />
          <path d={ray(164, 94, r - 26, 94 + s / 2)} />
          <path d={`M${r} ${50 - s}C${r + 14} ${60 - s / 2} ${r + 14} ${100 + s / 2} ${r} ${110 + s}`} />
        </g>
      </g>
    </TwoInk>
  );
}
