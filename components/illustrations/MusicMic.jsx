import TwoInk from "./TwoInk";

// A stage microphone on a boom stand (Ann sings in Timeless). The boom
// reaches left, so the stand can stand at the right-hand page edge.
// Decorative only; see TwoInk.jsx.
export default function MusicMic(props) {
  return (
    <TwoInk viewBox="0 0 260 520" {...props}>
      {/* tripod and tube */}
      <path d="M190 466L126 512M190 466L254 512M190 466L193 516" />
      <path d="M186 336V466M194 336V466M190 322V230" />
      <rect x="183" y="322" width="14" height="14" rx="3" />
      <circle cx="190" cy="221" r="9" />
      {/* boom and counterweight */}
      <path d="M236 250L70 142" />
      <circle cx="245" cy="256" r="11" />
      {/* clip, microphone body and grille */}
      <path d="M70 142L66 146" />
      <path d="M82 131L47 151L55 162L86 137Z" />
      <circle cx="40" cy="164" r="13" />
      <path d="M31 155L49 173M31 173L49 155" opacity=".55" />
      {/* cable */}
      <path d="M86 134C116 120 120 230 168 262C190 276 180 300 186 320" />
    </TwoInk>
  );
}
