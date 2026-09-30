import TwoInk from "./TwoInk";

// A concert flute (Ann also plays flute): head joint with its lip plate,
// the body's ring keys and rod, and the foot joint. Decorative only; see
// TwoInk.jsx.
export default function MusicFlute(props) {
  return (
    <TwoInk viewBox="0 0 620 64" {...props}>
      <path d="M16 26C8 26 8 38 16 38M16 26H604V38H16M24 25V39" />
      <ellipse cx="66" cy="24" rx="16" ry="5" />
      <ellipse cx="66" cy="24" rx="5" ry="2" />
      <rect x="132" y="23" width="8" height="18" rx="2" />
      <rect x="474" y="23" width="8" height="18" rx="2" />
      <circle cx="196" cy="31" r="6.5" />
      <circle cx="222" cy="31" r="6.5" />
      <circle cx="248" cy="31" r="6.5" />
      <circle cx="298" cy="31" r="6.5" />
      <circle cx="324" cy="31" r="6.5" />
      <circle cx="350" cy="31" r="6.5" />
      <ellipse cx="272" cy="23" rx="5" ry="3" />
      <ellipse cx="384" cy="23" rx="7" ry="4" />
      <ellipse cx="412" cy="23" rx="7" ry="4" />
      <path d="M182 42H440" />
      <ellipse cx="512" cy="31" rx="9" ry="6" />
      <ellipse cx="542" cy="31" rx="9" ry="6" />
      <path d="M566 26V38M500 42H556" />
    </TwoInk>
  );
}
