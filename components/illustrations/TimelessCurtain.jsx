import TwoInk from "./TwoInk";

// The stage pelmet over the Timeless title (/biography). A scalloped valance
// runs edge to edge; under each end hangs a drape, gathered to the side with
// a tie-back. It sits in its own band ABOVE the h1 and never covers it.
//
// Motion: the parted state is the drawing. With motion allowed the drapes
// part once (app/(other)/biography/biography.css, keyed on the motion
// system's .is-static / .is-in classes); without JS or under reduced motion
// they simply render parted. Decorative only; see TwoInk.jsx for the rules.

// Twelve scallops across a 1200-wide valance, stretched to the band width.
const SCALLOPS = Array.from({ length: 12 }, (_, i) => `Q${i * 100 + 50} 62 ${i * 100 + 100} 38`).join("");
const TRIM = Array.from({ length: 12 }, (_, i) => `Q${i * 100 + 50} 50 ${i * 100 + 100} 28`).join("");
const DROPS = Array.from({ length: 11 }, (_, i) => `M${i * 100 + 100} 38V50`).join("");

function Drape() {
  return (
    <>
      {/* outer edge, and the leading edge swept back to the tie-back */}
      <path d="M5 0V196" />
      <path d="M296 0C262 54 150 110 46 128" />
      {/* folds gathered into the tie-back */}
      <path d="M64 0C62 48 54 94 42 126M124 0C118 52 86 100 44 127M186 0C172 52 124 102 45 128M244 0C222 54 156 106 46 128" opacity=".55" />
      {/* the tail below the tie-back and its hem */}
      <path d="M46 128C60 150 72 174 78 196" />
      <path d="M36 134C42 158 40 178 34 196" opacity=".55" />
      <path d="M5 196C28 191 56 191 78 196" />
      {/* tie-back cord and tassel */}
      <ellipse cx="40" cy="129" rx="17" ry="7" transform="rotate(-14 40 129)" />
      <path d="M26 135C22 146 24 154 28 160" />
      <polygon points="22 160 34 160 32 178 24 178" />
    </>
  );
}

export default function TimelessCurtain({ className = "" }) {
  return (
    <div className={`curtain ${className}`.trim()} aria-hidden="true" data-motion="part">
      <TwoInk className="curtain-drape curtain-drape--l" viewBox="0 0 300 200">
        <Drape />
      </TwoInk>
      <TwoInk className="curtain-drape curtain-drape--r" viewBox="0 0 300 200">
        <g transform="matrix(-1 0 0 1 300 0)">
          <Drape />
        </g>
      </TwoInk>
      <TwoInk className="curtain-pelmet" viewBox="0 0 1200 64" preserveAspectRatio="none">
        <path d="M0 4H1200" />
        <path d={`M0 38${SCALLOPS}`} />
        <path d={`M0 28${TRIM}`} opacity=".55" />
        <path d={DROPS} />
      </TwoInk>
    </div>
  );
}
