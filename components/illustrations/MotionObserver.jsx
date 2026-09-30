"use client";

import { useEffect } from "react";

/*
 * The one IntersectionObserver for entrance motion (DESIGN.md, Motion).
 * Rendered once by components/SiteChrome.jsx.
 *
 * Mark an element with data-motion="fade" | "rise" | "draw" (TwoInk sets
 * "draw" itself when given draw). Optional style={{"--motion-delay":"120ms"}}.
 * Pages may define their own effect in route CSS as long as it animates only
 * transform, opacity or stroke-dashoffset, keyed on the same classes:
 *   html.motion-ok .x[data-motion]:not(.is-in):not(.is-static) { start state }
 *   html.motion-ok .x[data-motion].is-in { transition to the final state }
 *
 * Final states are the default: the start state applies only under
 * html.motion-ok, which is set here after mount and never under
 * prefers-reduced-motion or without IntersectionObserver. Elements already on
 * screen at mount get .is-static (no flash of hidden content, no replay).
 * Others get .is-in once, the first time they enter the viewport. A
 * MutationObserver picks up elements added later (client navigation, an
 * album opening). For data-motion="draw" the stroke lengths are measured
 * here when the drawing enters, as --len on each stroke.
 */
export default function MotionObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          // Draw-on: give each stroke its on-screen length (the strokes do not
          // scale with the drawing, so pathLength cannot be used).
          if (el.dataset.motion === "draw") {
            el.querySelectorAll("path,line,polyline,polygon,circle,ellipse,rect").forEach((s) => {
              const ctm = s.getScreenCTM();
              if (ctm) s.style.setProperty("--len", `${Math.ceil(s.getTotalLength() * Math.hypot(ctm.a, ctm.b)) + 2}px`);
            });
          }
          el.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    const watch = (el, atMount) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (atMount) {
        const box = el.getBoundingClientRect();
        if (box.top < innerHeight && box.bottom > 0) {
          el.classList.add("is-static");
          return;
        }
      }
      io.observe(el);
    };
    const scan = (node, atMount) => {
      if (node.nodeType !== 1) return;
      if (node.matches("[data-motion]")) watch(node, atMount);
      node.querySelectorAll("[data-motion]").forEach((el) => watch(el, atMount));
    };
    scan(document.body, true);
    root.classList.add("motion-ok");
    const mo = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => scan(node, false));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("motion-ok");
    };
  }, []);
  return null;
}
