import TwoInk from "./TwoInk";

// A picture frame drawn around a painting: the outer and inner edges of the
// moulding with mitred corners, and the edge of the mat. It stretches to the
// box it is laid over (preserveAspectRatio none; the stroke does not scale),
// so route CSS gives that box an aspect ratio and insets the painting by
// 14% on every side, where the mat line falls. Decorative only.
export default function SideboardFrame(props) {
  return (
    <TwoInk viewBox="0 0 100 100" preserveAspectRatio="none" offset={0.8} {...props}>
      <rect x="1" y="1" width="98" height="98" />
      <rect x="7" y="7" width="86" height="86" />
      <path d="M1 1L7 7M99 1L93 7M1 99L7 93M99 99L93 93" />
      <rect x="13" y="13" width="74" height="74" opacity=".55" />
    </TwoInk>
  );
}
