import TwoInk from "./TwoInk";

// A small hand-drawn printer's star: the ornament between venue names on the
// home page handbill. Decorative only; see TwoInk.jsx for the rules.
export default function HomeStar(props) {
  return (
    <TwoInk viewBox="0 0 24 24" offset={1.5} {...props}>
      <path d="M12 3V21M3 12H21M6 6L18 18M18 6L6 18" />
    </TwoInk>
  );
}
