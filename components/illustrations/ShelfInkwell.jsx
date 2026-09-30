import TwoInk from "./TwoInk";

// An inkwell with a dip pen standing in it, for the Textbooks shelf.
// Decorative only; see TwoInk.jsx for the rules.
export default function ShelfInkwell(props) {
  return (
    <TwoInk viewBox="0 0 180 180" {...props}>
      <path d="M50 170H130C136 170 138 166 138 160V112C138 98 122 90 108 88V74H72V88C58 90 42 98 42 112V160C42 166 44 170 50 170Z" />
      <path d="M66 74H114M68 66H112V74M68 66V74" />
      <path d="M42 132C70 128 110 136 138 132" opacity=".5" />
      <path d="M84 80L154 8C158 4 166 9 162 14L92 86" />
      <path d="M104 62L112 70" />
      <path d="M52 150C52 158 56 162 62 162" opacity=".5" />
    </TwoInk>
  );
}
