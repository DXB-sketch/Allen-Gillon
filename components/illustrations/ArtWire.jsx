import TwoInk from "./TwoInk";

// The hanging cord from the picture rail to the top corners of a frame,
// stretched to the frame's width and the drop below the rail. Decorative only.
export default function ArtWire(props) {
  return (
    <TwoInk viewBox="0 0 100 100" preserveAspectRatio="none" offset={1.5} {...props}>
      <path d="M50 0L16 100M50 0L84 100" />
    </TwoInk>
  );
}
