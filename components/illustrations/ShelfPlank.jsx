import TwoInk from "./TwoInk";

// One length of drawn shelf board: the top edge the books stand on, the front
// edge below it and a little grain. It stretches to its box
// (preserveAspectRatio none), which is safe because every stroke runs
// sideways and the pen width does not scale. Planks laid side by side join
// into one shelf: each starts and ends at the same heights. `grain` (0 to 2)
// picks a different grain so neighbouring planks do not repeat.
const GRAIN = [
  "M34 14.5H92M188 13.5H236M300 15H352",
  "M20 13.5H64M128 15H210M276 14H318",
  "M58 15H118M170 13.5H204M262 14.5H340",
];

export default function ShelfPlank({ grain = 0, ...props }) {
  return (
    <TwoInk viewBox="0 0 400 24" preserveAspectRatio="none" {...props}>
      <path d="M0 5C120 6.4 280 6.4 400 5" />
      <path d="M0 21C130 22 270 22 400 21" />
      <path d={GRAIN[grain % GRAIN.length]} opacity=".5" />
    </TwoInk>
  );
}
