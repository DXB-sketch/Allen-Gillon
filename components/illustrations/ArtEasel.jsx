import TwoInk from "./TwoInk";

// An easel holding a small canvas (hills, a sun, two birds), with a brush
// leaning against it. Sits in the margin beside the /anns-art title.
// Decorative only.
export default function ArtEasel(props) {
  return (
    <TwoInk viewBox="0 0 240 280" {...props}>
      <path d="M70 272L112 18M170 272L128 18M120 22V272" />
      <path d="M112 18C116 12 124 12 128 18" />
      <path d="M86 214H154" />
      <path d="M50 44H190V148H50Z" />
      <path d="M40 156H200M44 164H196" />
      <path d="M56 130C78 108 98 112 116 122C134 132 150 110 184 118" />
      <path d="M56 142C90 132 128 138 184 134" />
      <circle cx="152" cy="76" r="13" />
      <path d="M78 78C82 72 88 72 92 78C96 72 102 72 106 78M98 96C101 92 105 92 108 96C111 92 115 92 118 96" />
      <path d="M204 272L226 150" />
      <path d="M226 150C224 140 228 130 234 126C236 134 234 144 228 152" />
    </TwoInk>
  );
}
