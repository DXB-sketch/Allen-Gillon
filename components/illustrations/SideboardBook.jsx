import TwoInk from "./TwoInk";

// The page block and boards of an open book, drawn under its two printed
// pages: page edges fanning from the spine, the cover boards below them.
// It stretches to the book's width (preserveAspectRatio none; the stroke
// does not scale). Decorative only.
export default function SideboardBook(props) {
  return (
    <TwoInk viewBox="0 0 400 40" preserveAspectRatio="none" offset={1} {...props}>
      <path d="M200 2C150 10 60 10 4 4M200 2C250 10 340 10 396 4" />
      <path d="M200 10C150 18 60 18 6 12M200 10C250 18 340 18 394 12" opacity=".55" />
      <path d="M200 18C150 26 60 26 8 20M200 18C250 26 340 26 392 20" opacity=".55" />
      <path d="M200 30C150 38 50 38 1 30V2M200 30C250 38 350 38 399 30V2" />
      <path d="M200 2V30" />
    </TwoInk>
  );
}
