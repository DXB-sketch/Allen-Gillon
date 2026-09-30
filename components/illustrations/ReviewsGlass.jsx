import TwoInk from "./TwoInk";

// A wine glass, half poured: "Pour me another glass." beside the table
// comments on /reviews. Decorative only; see TwoInk.jsx for the rules.
export default function ReviewsGlass(props) {
  return (
    <TwoInk viewBox="0 0 120 210" {...props}>
      <path d="M26 14C20 70 36 104 60 106C84 104 100 70 94 14Z" />
      <path d="M26 56C44 63 76 50 95 57" />
      <path d="M32 70C38 90 48 98 60 99" opacity=".55" />
      <path d="M60 106V176" />
      <ellipse cx="60" cy="182" rx="34" ry="8" />
    </TwoInk>
  );
}
