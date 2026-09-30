import TwoInk from "./TwoInk";

// A cup of coffee on its saucer, steam rising: the cafe where the featured
// /reviews quote was heard. Decorative only; see TwoInk.jsx for the rules.
export default function ReviewsCup(props) {
  return (
    <TwoInk viewBox="0 0 220 180" {...props}>
      <ellipse cx="104" cy="154" rx="94" ry="16" />
      <path d="M44 150C52 158 156 158 164 150" opacity=".55" />
      <ellipse cx="104" cy="76" rx="58" ry="10" />
      <path d="M46 76C46 118 66 146 104 146C142 146 162 118 162 76" />
      <path d="M160 90C188 84 196 112 176 122C170 125 160 127 152 126" />
      <path d="M62 80C84 86 124 86 146 80" opacity=".55" />
      <path d="M84 56C74 44 94 36 84 20M104 52C94 38 114 28 104 10M124 56C114 44 134 36 124 20" />
    </TwoInk>
  );
}
