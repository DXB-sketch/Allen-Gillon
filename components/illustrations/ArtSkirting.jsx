import TwoInk from "./TwoInk";

// The skirting board along the foot of the /anns-art hallway: the board's
// top edge, its bevel and the floor line, stretched to the width of the
// wall. Decorative only.
export default function ArtSkirting(props) {
  return (
    <TwoInk viewBox="0 0 1200 40" preserveAspectRatio="none" offset={2} {...props}>
      <path d="M0 3H1200" />
      <path d="M0 10H1200" />
      <path d="M0 37H1200" />
    </TwoInk>
  );
}
