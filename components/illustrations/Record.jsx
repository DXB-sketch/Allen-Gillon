import TwoInk from "./TwoInk";

// A line-drawn vinyl record: rim, broken grooves, label and spindle hole.
// For the Albums doorway. Decorative only; see TwoInk.jsx for the rules.
export default function Record(props) {
  return (
    <TwoInk viewBox="0 0 240 240" {...props}>
      <circle cx="120" cy="120" r="110" />
      <path d="M26 120A94 94 0 0 1 120 26M150 31A94 94 0 0 1 214 120M205 160A94 94 0 0 1 120 214M84 207A94 94 0 0 1 28 140" />
      <path d="M44 106A77 77 0 0 1 106 44M140 46A77 77 0 0 1 196 120M188 156A77 77 0 0 1 134 196M98 194A77 77 0 0 1 46 144" />
      <path d="M64 120A56 56 0 0 1 120 64M162 83A56 56 0 0 1 172 142M147 169A56 56 0 0 1 72 150" />
      <circle cx="120" cy="120" r="36" />
      <path d="M100 108C106 98 118 94 128 96" />
      <circle cx="120" cy="120" r="4" />
      <path d="M170 54C184 62 194 72 202 86" opacity=".55" />
    </TwoInk>
  );
}
