import TwoInk from "./TwoInk";

// Allen's Trini Lopez Gibson, drawn from his photos (public/images/personal:
// the waterfront, stage and promo shots): a thinline double-cutaway body with
// pointed horns, slashed-diamond soundholes, two humbuckers, a Bigsby
// vibrato, split-diamond inlays and the six-in-line headstock. Neck to the
// right, as it faces the audience. Decorative only; see TwoInk.jsx.
export default function MusicGibson(props) {
  return (
    <TwoInk viewBox="0 0 750 300" {...props}>
      {/* body */}
      <path d="M285 131C281 100 292 70 330 44C308 26 282 22 262 26C240 30 224 46 205 46C180 46 160 16 110 16C55 16 20 70 20 150C20 230 55 284 110 284C160 284 180 254 205 254C224 254 240 270 262 274C282 278 308 274 330 256C292 230 281 200 285 169" />
      {/* soundholes */}
      <path d="M150 70L196 58L242 68L196 80ZM150 230L196 242L242 232L196 220Z" />
      {/* neck and fretboard */}
      <path d="M245 131L600 136M245 169L600 164M245 131V169M600 136V164" />
      <path d="M573 136V164M547 135V165M523 135V165M500 135V165M478 134V166M458 134V166M439 134V166M421 133V167M403 133V167M387 133V167M372 133V167M358 133V167M344 132V168M331 132V168M319 132V168M307 132V168M297 132V168M286 132V168M277 131V169M268 131V169M259 131V169M251 131V169" opacity=".55" />
      <path d="M529 150L535 144L541 150L535 156ZM483 150L489 144L495 150L489 156ZM442 150L448 144L454 150L448 156ZM406 150L412 144L418 150L412 156ZM359 150L365 145L371 150L365 155ZM320 150L325 145L330 150L325 155Z" />
      {/* headstock: six tuners in a line along the top */}
      <path d="M600 136C640 128 690 114 736 102C746 100 749 111 740 119C716 142 660 168 600 164" />
      <circle cx="616" cy="143" r="3" />
      <circle cx="636" cy="138" r="3" />
      <circle cx="656" cy="133" r="3" />
      <circle cx="676" cy="128" r="3" />
      <circle cx="696" cy="124" r="3" />
      <circle cx="716" cy="119" r="3" />
      <path d="M614 131L611 121M634 126L631 116M654 121L651 111M674 117L671 107M694 112L691 102M714 107L711 97" />
      <ellipse cx="610" cy="113" rx="5" ry="7" />
      <ellipse cx="630" cy="108" rx="5" ry="7" />
      <ellipse cx="650" cy="103" rx="5" ry="7" />
      <ellipse cx="670" cy="99" rx="5" ry="7" />
      <ellipse cx="690" cy="94" rx="5" ry="7" />
      <ellipse cx="710" cy="89" rx="5" ry="7" />
      {/* pickups, bridge, Bigsby and its arm */}
      <rect x="132" y="128" width="28" height="44" rx="3" />
      <rect x="205" y="128" width="28" height="44" rx="3" />
      <rect x="111" y="133" width="9" height="34" rx="2" />
      <path d="M36 126H82L88 150L82 174H36L30 150Z" />
      <path d="M62 132V168M84 170C100 184 118 190 140 188" />
      <circle cx="143" cy="188" r="4" />
      {/* controls */}
      <circle cx="72" cy="206" r="7" />
      <circle cx="110" cy="215" r="7" />
      <circle cx="78" cy="238" r="7" />
      <circle cx="116" cy="247" r="7" />
      <path d="M264 54L272 42" />
      <circle cx="264" cy="56" r="4" />
      {/* strings */}
      <path d="M62 138H600L616 143M62 143H600L636 138M62 148H600L656 133M62 152H600L676 128M62 157H600L696 124M62 162H600L716 119" opacity=".55" />
    </TwoInk>
  );
}
