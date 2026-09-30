import TwoInk from "./TwoInk";

// Allen's Trini Lopez Gibson, bought in Parramatta in 1967 (/biography):
// a double-cutaway semi-hollow body with the model's diamond soundholes and
// its six-in-line headstock. Drawn from the photos in public/images/personal.
// Decorative only; see TwoInk.jsx for the rules.
export default function TimelessGibson(props) {
  return (
    <TwoInk viewBox="0 0 200 480" {...props}>
      {/* body */}
      <path d="M86 270C80 258 62 246 46 252C30 258 28 280 36 298C26 318 18 340 18 368C18 430 56 472 100 472C144 472 182 430 182 368C182 340 174 318 164 298C172 280 170 258 154 252C138 246 120 258 114 270" />
      {/* neck and fingerboard end */}
      <path d="M86 96V296H114V96" />
      <path d="M86 122H114M86 148H114M86 172H114M86 194H114M86 214H114M86 232H114M86 250H114" opacity=".55" />
      {/* six-in-line headstock with tuners */}
      <path d="M86 96C82 70 82 40 88 14C108 6 128 12 132 30C134 60 124 80 114 96" />
      <path d="M131 26H142M132 40H143M132 54H143M130 68H141M126 80H137" />
      <circle cx="146" cy="26" r="4" />
      <circle cx="147" cy="40" r="4" />
      <circle cx="147" cy="54" r="4" />
      <circle cx="145" cy="68" r="4" />
      <circle cx="141" cy="80" r="4" />
      {/* diamond soundholes */}
      <polygon points="54 316 64 342 54 368 44 342" />
      <polygon points="146 316 156 342 146 368 136 342" />
      {/* pickups, bridge, trapeze tailpiece, knobs */}
      <rect x="84" y="304" width="32" height="16" />
      <rect x="84" y="346" width="32" height="16" />
      <path d="M84 390H116" />
      <path d="M92 420H108L104 454H96Z" />
      <circle cx="136" cy="404" r="6" />
      <circle cx="154" cy="388" r="6" />
      <circle cx="132" cy="430" r="6" />
      <circle cx="152" cy="418" r="6" />
      {/* strings */}
      <path d="M95 18V420M100 16V420M105 14V420" opacity=".4" />
    </TwoInk>
  );
}
