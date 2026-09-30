// A stand-in for react-pageflip in tests/reader-dom.test.mjs that keeps the
// one behaviour the follow logic has to survive: a turn takes time, and
// starting a new turn first finishes the one in progress, which fires onFlip
// for the old page (page-flip's Flip.flip() calls render.finishAnimation()).
import React, { forwardRef, useImperativeHandle, useRef } from "react";

export const TURN_MS = 40;

const FakeFlipBook = forwardRef(function FakeFlipBook({ children, onFlip, startPage = 0, className, style }, ref) {
  const state = useRef({ page: startPage, pending: null, timer: 0 });
  const land = (page) => {
    const s = state.current;
    s.page = page;
    s.pending = null;
    onFlip?.({ data: page });
  };
  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flip(target) {
        const s = state.current;
        if (s.pending !== null) {
          /* finishAnimation(): the turn in progress lands first */
          clearTimeout(s.timer);
          land(s.pending);
        }
        s.pending = target;
        s.timer = setTimeout(() => land(target), TURN_MS);
      },
      turnToPage(target) {
        land(target);
      },
      getCurrentPageIndex: () => state.current.page,
    }),
  }));
  return React.createElement("div", { className, style, "data-fake-flip": "" }, children);
});

export default FakeFlipBook;
