import TwoInk from "./TwoInk";

// The sideboard on the other-site home: a long low cabinet, top plank
// overhanging, a pair of doors, a stack of three drawers and a single door,
// on four tapered legs. The three doorways (book, painting, photo) stand on
// its top edge at y=4. Decorative only; see TwoInk.jsx for the rules.
export default function Sideboard(props) {
  return (
    <TwoInk viewBox="0 0 1200 200" preserveAspectRatio="xMidYMin meet" {...props}>
      {/* top plank */}
      <path d="M2 4H1198V22H2Z" />
      <path d="M40 13H250M520 13H700M930 13H1150" opacity=".45" />
      {/* carcase */}
      <path d="M26 22V158H1174V22" />
      <path d="M26 150H1174" opacity=".55" />
      {/* left pair of doors */}
      <path d="M470 22V150M248 30V142" />
      <rect x="46" y="38" width="184" height="96" />
      <rect x="266" y="38" width="186" height="96" />
      <circle cx="234" cy="88" r="5" />
      <circle cx="262" cy="88" r="5" />
      {/* three drawers */}
      <path d="M790 22V150M470 64H790M470 107H790" />
      <path d="M602 43H658M602 86H658M602 129H658" />
      {/* single door with a keyhole */}
      <rect x="808" y="38" width="348" height="96" />
      <circle cx="826" cy="82" r="4" />
      <path d="M826 86V96" />
      {/* tapered legs */}
      <path d="M52 158L62 196H76L84 158M1116 158L1124 196H1138L1148 158" />
      <path d="M452 158L458 190H470L476 158M724 158L730 190H742L748 158" opacity=".55" />
    </TwoInk>
  );
}
