import TwoInk from "./TwoInk";

// A scrapbook photo corner: the triangular paper pocket that holds a print
// in an album (/biography). Place it over a photo's corner from route CSS
// (rotate it for each corner). Decorative only; see TwoInk.jsx.
export default function TimelessCorner(props) {
  return (
    <TwoInk viewBox="0 0 40 40" offset={2} {...props}>
      <path d="M3 3H37L3 37Z" />
      <path d="M9 9H24" opacity=".55" />
    </TwoInk>
  );
}
