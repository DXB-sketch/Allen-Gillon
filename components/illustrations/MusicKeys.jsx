import TwoInk from "./TwoInk";

// A strip of piano keys, two octaves from C. The black keys are drawn as
// hatched outlines (the house style has no fills). Decorative only; see
// TwoInk.jsx.
const BLACK = [40, 80, 160, 200, 240, 320, 360, 440, 480, 520];

export default function MusicKeys(props) {
  return (
    <TwoInk viewBox="0 0 560 116" {...props}>
      <rect x="2" y="2" width="556" height="112" rx="3" />
      <path d="M120 2V114M280 2V114M400 2V114" />
      <path d={BLACK.map((b) => `M${b} 70V114`).join("")} />
      {BLACK.map((b) => (
        <rect key={b} x={b - 12} y="2" width="24" height="68" rx="2" />
      ))}
      <path d={BLACK.map((b) => `M${b - 4} 10V62M${b + 4} 10V62`).join("")} opacity=".55" />
    </TwoInk>
  );
}
