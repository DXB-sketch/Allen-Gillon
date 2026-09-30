import TwoInk from "./TwoInk";

// A stage curtain tied back, for the Plays shelf: rail, scalloped valance,
// folds gathered at a rope tie-back with a tassel, and the hem.
// Decorative only; see TwoInk.jsx for the rules.
export default function ShelfCurtain(props) {
  return (
    <TwoInk viewBox="0 0 170 300" {...props}>
      <path d="M8 10H162" />
      <circle cx="6" cy="10" r="5" />
      <circle cx="164" cy="10" r="5" />
      <path d="M10 14C26 36 44 36 60 14C76 36 94 36 110 14C126 36 144 36 160 14" />
      <path d="M14 16V290" />
      <path d="M158 16C150 76 82 122 46 150C80 190 118 240 132 292" />
      <path d="M40 34C40 80 38 120 38 148M72 34C70 84 56 124 42 148M108 34C102 84 70 124 46 150" opacity=".6" />
      <path d="M36 160C34 204 30 248 30 290M46 162C58 210 76 252 84 292" opacity=".6" />
      <path d="M14 292C54 286 96 298 132 292" />
      <path d="M22 154C34 144 52 146 62 156" />
      <path d="M62 156C66 166 67 174 65 182" />
      <path d="M58 182H72L76 204H54Z" />
    </TwoInk>
  );
}
