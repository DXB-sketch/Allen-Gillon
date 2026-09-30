import TwoInk from "./TwoInk";

// The picture rail along the top of the /anns-art hallway: a double
// moulding line, stretched to the width of the wall. Decorative only.
export default function ArtRail(props) {
  return (
    <TwoInk viewBox="0 0 1200 20" preserveAspectRatio="none" offset={2} {...props}>
      <path d="M0 5H1200" />
      <path d="M0 13H1200" />
    </TwoInk>
  );
}
