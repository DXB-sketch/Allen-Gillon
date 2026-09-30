import TwoInk from "./TwoInk";

// One photo corner, the paper kind that holds a print in an album: a
// triangle over the top left corner of the photo, with the fold line.
// Rotate it from route CSS for the other three corners. Decorative only.
export default function SideboardCorner(props) {
  return (
    <TwoInk viewBox="0 0 40 40" {...props}>
      <path d="M2 2H38L2 38Z" />
      <path d="M10 10H26L10 26" opacity=".55" />
    </TwoInk>
  );
}
