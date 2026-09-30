import TwoInk from "./TwoInk";

// Chinese chimes hanging beside the Stories shelf: a hook, a round top and
// five tubes graded long to short, like the scale the characters are named
// after. Decorative only; see TwoInk.jsx for the rules.
export default function ShelfChimes(props) {
  return (
    <TwoInk viewBox="0 0 124 300" {...props}>
      <path d="M62 4V24" />
      <circle cx="62" cy="29" r="5" />
      <ellipse cx="62" cy="48" rx="46" ry="10" />
      <path d="M16 48V54C16 61 108 61 108 54V48" />
      <path d="M20 60V78M41 62V78M62 62V78M83 62V78M104 60V78" opacity=".6" />
      <rect x="15.5" y="78" width="9" height="164" rx="4.5" />
      <rect x="36.5" y="78" width="9" height="142" rx="4.5" />
      <rect x="57.5" y="78" width="9" height="122" rx="4.5" />
      <rect x="78.5" y="78" width="9" height="104" rx="4.5" />
      <rect x="99.5" y="78" width="9" height="88" rx="4.5" />
    </TwoInk>
  );
}
