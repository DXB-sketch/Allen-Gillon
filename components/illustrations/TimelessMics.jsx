import TwoInk from "./TwoInk";

// Two club microphones on stands, leaning in to each other: the duet years
// of Ann and Allen Ray (/biography). Decorative only; see TwoInk.jsx.
function Mic() {
  return (
    <>
      <rect x="58" y="96" width="44" height="72" rx="20" />
      <path d="M58 132H102" />
      <path d="M69 102V162M80 98V166M91 102V162" opacity=".55" />
      <path d="M72 168L80 180L88 168" />
    </>
  );
}

export default function TimelessMics(props) {
  return (
    <TwoInk viewBox="0 0 260 330" {...props}>
      <g transform="rotate(-9 80 180)">
        <Mic />
      </g>
      <g transform="translate(100 0) rotate(9 80 180)">
        <Mic />
      </g>
      {/* stands and bases */}
      <path d="M80 180V302M50 318L80 302L110 318M80 302V320" />
      <path d="M180 180V302M150 318L180 302L210 318M180 302V320" />
      {/* one cable looping between the two stands */}
      <path d="M84 196C98 250 70 290 122 312C160 328 196 306 234 324" opacity=".55" />
    </TwoInk>
  );
}
