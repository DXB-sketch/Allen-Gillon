import TwoInk from "./TwoInk";

// A line-drawn arrow for the hallway and painting-view buttons. It points
// right; flip it in CSS for "previous". The button carries the name.
export default function ArtArrow(props) {
  return (
    <TwoInk viewBox="0 0 40 24" offset={2} {...props}>
      <path d="M4 12H35" />
      <path d="M25 3L35 12L25 21" />
    </TwoInk>
  );
}
