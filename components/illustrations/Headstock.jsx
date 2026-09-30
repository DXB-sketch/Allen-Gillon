import TwoInk from "./TwoInk";

// A line-drawn guitar headstock (open-book top, three tuners a side) for the
// Bookings doorway. Decorative only; see TwoInk.jsx for the rules.
export default function Headstock(props) {
  return (
    <TwoInk viewBox="0 0 160 300" {...props}>
      <path d="M56 210C50 196 38 188 36 170L28 44C26 26 52 14 80 26C108 14 134 26 132 44L124 170C122 188 110 196 104 210" />
      <path d="M56 210H104M58 210V300M102 210V300M58 256H102" />
      <path d="M72 58H88L92 88C92 97 68 97 68 88Z" />
      <circle cx="50" cy="72" r="5" />
      <circle cx="48" cy="112" r="5" />
      <circle cx="46" cy="152" r="5" />
      <circle cx="110" cy="72" r="5" />
      <circle cx="112" cy="112" r="5" />
      <circle cx="114" cy="152" r="5" />
      <path d="M29 72H18M31 112H18M33 152H18M131 72H142M129 112H142M127 152H142" />
      <ellipse cx="11" cy="72" rx="7" ry="10" />
      <ellipse cx="11" cy="112" rx="7" ry="10" />
      <ellipse cx="11" cy="152" rx="7" ry="10" />
      <ellipse cx="149" cy="72" rx="7" ry="10" />
      <ellipse cx="149" cy="112" rx="7" ry="10" />
      <ellipse cx="149" cy="152" rx="7" ry="10" />
      <path d="M64 300V210L50 72M72 300V210L48 112M78 300V210L46 152M84 300V210L110 72M90 300V210L112 112M96 300V210L114 152" opacity=".55" />
    </TwoInk>
  );
}
