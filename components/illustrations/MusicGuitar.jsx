import TwoInk from "./TwoInk";

// The phone and tablet guitar on /music: a whole double-cutaway electric
// guitar (after Allen's Gibson, simplified) small enough to sit beside the
// title. Body, two pickups, bridge, two knobs, a short fretted neck and a
// headstock with three tuners a side, tilted a little, neck to the right.
// Drawn near the size it renders at, so the line stays bold. Decorative
// only; see TwoInk.jsx. Laptops and up show the long MusicGibson instead.
export default function MusicGuitar(props) {
  return (
    <TwoInk viewBox="0 4 200 104" {...props}>
      <g transform="rotate(-12 100 50)">
        {/* body */}
        <path d="M80 44C84 34 87 26 90 19C85 12 76 12 69 16C64 20 60 24 55 24C50 24 44 13 30 13C14 13 4 30 4 50C4 70 14 87 30 87C44 87 50 76 55 76C60 76 64 80 69 84C76 88 85 88 90 81C87 74 84 66 80 56" />
        {/* neck, frets and nut */}
        <path d="M80 44L160 45M80 56L160 55M160 45V55" />
        <path d="M96 44V56M110 44V56M123 45V55M135 45V55M147 45V55" opacity=".55" />
        {/* headstock and tuners */}
        <path d="M160 45C168 41 176 38 190 37C196 37 197 63 190 63C176 62 168 59 160 55" />
        <path d="M168 41L167 34M178 39L177 31M188 37L188 30M168 59L167 66M178 61L177 69M188 63L188 70" />
        <circle cx="167" cy="32" r="2" />
        <circle cx="177" cy="29" r="2" />
        <circle cx="188" cy="28" r="2" />
        <circle cx="167" cy="68" r="2" />
        <circle cx="177" cy="71" r="2" />
        <circle cx="188" cy="72" r="2" />
        {/* pickups, bridge and knobs */}
        <rect x="44" y="38" width="8" height="24" rx="2" />
        <rect x="62" y="38" width="8" height="24" rx="2" />
        <rect x="26" y="40" width="5" height="20" rx="1.5" />
        <circle cx="22" cy="71" r="3.5" />
        <circle cx="34" cy="77" r="3.5" />
      </g>
    </TwoInk>
  );
}
