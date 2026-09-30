import TwoInk from "./TwoInk";

// A short wall shelf on two curved brackets: on narrow screens each
// sideboard doorway stands on one of these instead of the long sideboard.
// The object stands on its top edge at y=4. Decorative only.
export default function SideboardShelf(props) {
  return (
    <TwoInk viewBox="0 0 400 64" preserveAspectRatio="xMidYMin meet" {...props}>
      <path d="M4 4H396V18H4Z" />
      <path d="M60 18V58C60 36 80 18 108 18M340 18V58C340 36 320 18 292 18" />
    </TwoInk>
  );
}
